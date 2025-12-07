import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svelteWorkbench from './workbench-plugin.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Force forward slashes even on Windows
const toPosixPath = (p) => p.split(path.sep).join('/');

export default defineConfig({
    root: process.cwd(),

    server: {
        port: 52313,
        strictPort: true,
        fs: {
            strict: false,
            allow: [process.cwd(), __dirname]
        }
    },

    resolve: {
        alias: {
            '$workbench': __dirname,
            // Add this alias to help imports inside your App.svelte resolve correctly
            '/@workbench-src': path.resolve(__dirname, 'src')
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
                    // Intercept index.html requests
                    if (req.url === '/' || req.url.startsWith('/index.html')) {
                        const htmlPath = path.resolve(__dirname, 'index.html');

                        try {
                            let html = fs.readFileSync(htmlPath, 'utf-8');
                            html = await server.transformIndexHtml(req.url, html);

                            // --- THE FIX ---
                            // 1. Get absolute path
                            let rawPath = path.resolve(__dirname, 'src/main.ts');
                            // 2. Convert to forward slashes (C:/Users/...)
                            const posixPath = toPosixPath(rawPath);
                            // 3. Prepend /@fs/ (Vite's way of serving absolute paths)
                            // Note: On Windows, Vite expects /@fs/C:/Users/...
                            const entryPath = `/@fs/${posixPath.replace(/^\//, '')}`; // Ensure no double leading slash

                            // Replace the specific script tag in your index.html
                            html = html.replace(
                                /src="\/src\/main\.ts"/,
                                `src="${entryPath}"`
                            );

                            res.setHeader('Content-Type', 'text/html');
                            res.end(html);
                            return;
                        } catch (e) {
                            console.error('Error serving HTML:', e);
                            next(e);
                        }
                    }
                    next();
                });
            }
        }
    ]
});