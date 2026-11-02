
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ziaa2.github.io',
  base: '/nexora',
  integrations: [sitemap()],
  output: 'static'
});
