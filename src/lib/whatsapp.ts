/**
 * WhatsApp do Acarajazz. Os botões do site usam `WHATSAPP.link` (/whatsapp), nunca o wa.me direto:
 * a rota src/pages/whatsapp.ts barra quem está fora do Brasil e verifica se é robô (Turnstile)
 * antes de abrir a conversa.
 */
export const WHATSAPP = {
  numero: '5511979564494',
  exibicao: '(11) 97956-4494',
  link: '/whatsapp',
} as const;

/** País do Cloudflare. Sem país (dev local) passa; desconhecido ("XX") e Tor ("T1") não. */
export const foraDoBrasil = (request: Request) => {
  const pais = (request as Request & { cf?: { country?: string } }).cf?.country;
  return pais !== undefined && pais !== 'BR';
};
