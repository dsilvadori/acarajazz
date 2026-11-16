/**
 * Parte do cupom que roda fora do canvas (HTML por cima do jogo):
 * formulário (nome + WhatsApp + aceites + Turnstile), compartilhar/baixar a imagem dos Stories
 * e o "plano C" pro navegador interno do Instagram.
 */
import { config, gravar, medir, type CupomInfo } from './estado';

let raiz: HTMLElement;
export const definirRaiz = (el: HTMLElement) => (raiz = el);

/** Navegador interno do Instagram (ou do Facebook): compartilhar e baixar costumam falhar. */
export const noInstagram = () => /Instagram|FBAN|FBAV/i.test(navigator.userAgent);

function camada(html: string) {
  const el = document.createElement('div');
  el.className = 'aj-camada';
  el.innerHTML = html;
  // os toques na camada não chegam no jogo por baixo (o Phaser escuta o "soltar" na janela inteira)
  for (const tipo of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) {
    el.addEventListener(tipo, (e) => e.stopPropagation());
  }
  raiz.appendChild(el);
  return el;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, op: Record<string, unknown>) => string;
      getResponse: (id: string) => string | undefined;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

/** Espera o Turnstile terminar a verificação invisível (até ~8 s). */
async function tokenTurnstile(widget: string | null) {
  if (!widget || !window.turnstile) return '';
  for (let i = 0; i < 40; i++) {
    const t = window.turnstile.getResponse(widget);
    if (t) return t;
    await new Promise((r) => setTimeout(r, 200));
  }
  return '';
}

/** Abre o formulário. Resolve com o cupom, ou null se a pessoa voltar. */
export function pedirCupom(): Promise<CupomInfo | null> {
  return new Promise((resolve) => {
    const el = camada(`
      <form class="aj-form" novalidate>
        <h2>Pra liberar seu cupom</h2>
        <p class="aj-sub">É 1 cupom por pessoa. Se você já ganhou antes, a gente mostra o mesmo cupom.</p>
        <label>Seu nome
          <input name="nome" autocomplete="given-name" maxlength="80" required />
          <span class="aj-erro" data-erro="nome"></span>
        </label>
        <label>WhatsApp com DDD
          <input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 9 0000-0000" required />
          <span class="aj-erro" data-erro="whatsapp"></span>
        </label>
        <label class="aj-check"><input type="checkbox" name="aceite" />
          <span>Li e aceito o <a href="/acarabet#regulamento" target="_blank" rel="noopener">regulamento</a> e a <a href="/politica-de-privacidade" target="_blank" rel="noopener">política de privacidade</a>.</span>
        </label>
        <span class="aj-erro" data-erro="aceite"></span>
        <label class="aj-check"><input type="checkbox" name="marketing" />
          <span>Quero receber novidades do Acarajazz no WhatsApp (opcional).</span>
        </label>
        <p class="aj-nota">Para maiores de 18 anos, ou com autorização do responsável. Usamos seu nome e WhatsApp só pra gerar o cupom e, se você autorizar, mandar novidades.</p>
        <input class="aj-armadilha" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="aj-turnstile"></div>
        <p class="aj-erro aj-geral" data-erro="geral" role="alert"></p>
        <div class="aj-botoes">
          <button type="submit" class="aj-botao">Gerar meu cupom</button>
          <button type="button" class="aj-botao aj-voltar">Agora não</button>
        </div>
      </form>`);
    const form = el.querySelector('form')!;
    const enviar = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    let widget: string | null = null;
    const ts = el.querySelector<HTMLElement>('.aj-turnstile')!;
    if (config.siteKey && window.turnstile) {
      try {
        widget = window.turnstile.render(ts, { sitekey: config.siteKey, appearance: 'interaction-only', language: 'pt-br', theme: 'light' });
      } catch { widget = null; }
    }
    const fechar = (r: CupomInfo | null) => {
      if (widget && window.turnstile) try { window.turnstile.remove(widget); } catch { /* ok */ }
      el.remove();
      resolve(r);
    };
    el.querySelector('.aj-voltar')!.addEventListener('click', () => fechar(null));
    form.querySelector<HTMLInputElement>('[name=nome]')!.focus({ preventScroll: true });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      el.querySelectorAll<HTMLElement>('[data-erro]').forEach((s) => (s.textContent = ''));
      const fd = new FormData(form);
      const corpo = {
        nome: String(fd.get('nome') ?? ''),
        whatsapp: String(fd.get('whatsapp') ?? ''),
        aceite: fd.get('aceite') === 'on',
        marketing: fd.get('marketing') === 'on',
        site: String(fd.get('site') ?? ''),
        turnstile: '',
      };
      enviar.disabled = true;
      enviar.textContent = 'Verificando…';
      corpo.turnstile = await tokenTurnstile(widget);
      enviar.textContent = 'Gerando…';
      try {
        const r = await fetch('/api/acarabet/cupom', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(corpo) });
        const j = (await r.json()) as { ok: boolean; cupom?: CupomInfo; erros?: Record<string, string> };
        if (j.ok && j.cupom) {
          gravar('cupom', j.cupom);
          medir('cupom_gerado', { novo: !!j.cupom.novo });
          fechar(j.cupom);
          return;
        }
        for (const [k, v] of Object.entries(j.erros ?? { geral: 'Não deu certo. Tente de novo.' })) {
          const alvo = el.querySelector(`[data-erro="${k}"]`) ?? el.querySelector('[data-erro="geral"]');
          if (alvo) alvo.textContent = v;
        }
        if (widget && window.turnstile) window.turnstile.reset(widget);
      } catch {
        el.querySelector('[data-erro="geral"]')!.textContent = 'Sem conexão. Confira a internet e tente de novo.';
      }
      enviar.disabled = false;
      enviar.textContent = 'Gerar meu cupom';
    });
  });
}

/** Compartilhar a imagem (folha de compartilhar do celular → Instagram). Plano B: baixar. Plano C: mostrar na tela. */
export async function compartilhar(png: Blob) {
  const arquivo = new File([png], 'acarabet-acarajazz.png', { type: 'image/png' });
  if (noInstagram()) return mostrarImagem(png);
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], text: 'Apostei no acarajé e ganhei! @o_acarajazz' });
      medir('imagem_compartilhada');
      return;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
  }
  baixar(png);
}

export function baixar(png: Blob) {
  if (noInstagram()) return mostrarImagem(png);
  const url = URL.createObjectURL(png);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'acarabet-acarajazz.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  medir('imagem_baixada');
}

/** Plano C: a imagem na tela, pra tocar e segurar. E o caminho pra abrir no navegador. */
export function mostrarImagem(png: Blob) {
  const url = URL.createObjectURL(png);
  const android = /Android/i.test(navigator.userAgent);
  const intent = `intent://${location.host}${location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
  const el = camada(`
    <div class="aj-imagem">
      <img src="${url}" alt="Imagem pros Stories: Apostei no acarajé e ganhei" />
      <p><b>Toque e segure na imagem</b> pra salvar no celular. Depois é só postar nos Stories marcando <b>@o_acarajazz</b>.</p>
      <p class="aj-nota">Não salvou? Abra no navegador: toque em <b>⋯</b> no canto de cima e escolha <b>Abrir no navegador</b>.</p>
      <div class="aj-botoes">
        ${android ? `<a class="aj-botao" href="${intent}">Abrir no Chrome</a>` : ''}
        <button type="button" class="aj-botao aj-voltar">Fechar</button>
      </div>
    </div>`);
  medir('imagem_baixada', { modo: 'tela' });
  el.querySelector('.aj-voltar')!.addEventListener('click', () => {
    el.remove();
    URL.revokeObjectURL(url);
  });
}
