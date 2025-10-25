// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  site: "https://liamleeproduction-cloud.github.io/grufos-page/",
  base: "/grufos-page/",
  // trailingSlash: "always"
});