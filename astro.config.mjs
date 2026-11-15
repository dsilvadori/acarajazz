// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://oacarajazz.com',
  output: 'server',
  redirects: {
    '/curso': '/acaraje-alem-da-receita',
  },
  adapter: cloudflare({ imageService: 'passthrough' }),
});
