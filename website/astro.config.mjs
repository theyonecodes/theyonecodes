// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';
import compress from 'astro-compress';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://theyonecodes.github.io',
  base: '/theyonecodes',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sentry({ telemetry: false }), spotlightjs(), compress(), icon()]
});
