import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svelteWorkbench from './workbench-plugin.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '$workbench': __dirname
    }
  },
  plugins: [
    svelte(),
    svelteWorkbench({
      // SCENARIO A: Local Development
      // We explicitly tell the plugin to look in the playground folder
      pattern: '/playground/**/preview/*.svelte'
    })
  ]
});