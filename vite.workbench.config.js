import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svelteWorkbench from './workbench-plugin.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Ensure valid browser paths (C:\foo -> C:/foo)
const toPosixPath = (p) => p.split(path.sep).join('/');

export default defineConfig({
    // Root is User's Project
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
                    // Intercept root or index.html requests
                    if (req.url === '/' || req.url.startsWith('/index.html')) {

                        const htmlPath = path.resolve(__dirname, 'index.html');

                        try {
                            let html = fs.readFileSync(htmlPath, 'utf-8');

                            // Transform HTML (Vite injects HMR client, etc.)
                            html = await server.transformIndexHtml(req.url, html);

                            // --- Calculate Absolute Entry Path ---
                            const rawPath = path.resolve(__dirname, 'src/main.ts');
                            const posixPath = toPosixPath(rawPath);
                            // Ensure valid Vite absolute fs path (handle Windows drive letters)
                            // Example: /@fs/C:/Users/name/project/...
                            const entryPath = `/@fs/${posixPath.replace(/^\//, '')}`;

                            // --- ROBUST REPLACEMENT ---
                            // This regex finds <script ... src="..."> anywhere in the tag
                            // and handles quotes/spacing variations.
                            // We look for 'main.ts' specifically.
                            const regex = /<script\s+[^>]*src=["'].*?main\.ts["'][^>]*><\/script>/i;

                            if (regex.test(html)) {
                                console.log('[Workbench] 🟢 Injecting Workbench Entry:', entryPath);
                                // Replace the whole tag with the correct one
                                html = html.replace(regex, `<script type="module" src="${entryPath}"></script>`);
                            } else {
                                console.error('[Workbench] 🔴 FAILED to find script tag in index.html');
                                console.log('Current HTML Content:', html);
                            }

                            res.setHeader('Content-Type', 'text/html');
                            res.end(html);
                            return;
                        } catch (e) {
                            console.error('[Workbench] 💥 Error serving HTML:', e);
                            next(e);
                        }
                    }
                    next();
                });
            }
        }
    ]
});