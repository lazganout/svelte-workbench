import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svelteWorkbench from './workbench-plugin.js'; // Note the .js extension
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- FIX: Define __dirname for ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: process.cwd(),

    server: {
        port: 52313,
        strictPort: true,
        fs: {
            strict: false,
            allow: [
                process.cwd(),
                __dirname
            ]
        }
    },

    resolve: {
        alias: {
            '$workbench': __dirname
        }
    },

    plugins: [
        svelte(),
        svelteWorkbench({
            pattern: '/src/**/preview/*.svelte'
        }),

        {
            name: 'serve-workbench-html',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.url === '/' || req.url === '/index.html') {
                        const htmlPath = path.resolve(__dirname, 'index.html');
                        let html = fs.readFileSync(htmlPath, 'utf-8');

                        html = await server.transformIndexHtml(req.url, html);

                        // Point to the main.ts file (Vite handles TS compilation automatically)
                        const entryPath = '/@fs' + path.resolve(__dirname, 'src/main.ts');

                        // Replace the src path
                        html = html.replace(/src="\/src\/main\.ts"/, `src="${entryPath}"`);

                        res.setHeader('Content-Type', 'text/html');
                        res.end(html);
                        return;
                    }
                    next();
                });
            }
        }
    ]
});