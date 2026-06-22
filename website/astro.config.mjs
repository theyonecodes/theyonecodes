// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sentry from '@sentry/astro';
import compress from 'astro-compress';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://theyonecodes.github.io',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    sentry({ telemetry: false }),
    compress(),
    icon(),
  ],
});
