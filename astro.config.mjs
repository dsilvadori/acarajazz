// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://oacarajazz.com',
  output: 'server',
  // Sem sessões do Astro: o login do /admin usa cookie próprio (src/lib/auth.ts). Evita criar um KV à toa.
  session: false,
  redirects: {
    '/curso': '/acaraje-alem-da-receita',
  },
  adapter: cloudflare({ imageService: 'passthrough' }),
});
