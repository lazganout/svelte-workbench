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
        // Force Vite to use the project's Svelte copy
        dedupe: ['svelte'],
        alias: {
            '$workbench': __dirname,
            '/@workbench-src': path.resolve(__dirname, 'src')
        }
    },

    // --- FIX: Prevent pre-bundling Svelte ---
    // This fixes the "Cannot optimize dependency" and "Cannot read file" errors
    // while ensuring 'dedupe' works effectively to solve the blank screen issue.
    optimizeDeps: {
        exclude: ['svelte']
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
                    if (req.url === '/' || req.url.startsWith('/index.html')) {
                        const htmlPath = path.resolve(__dirname, 'index.html');

                        try {
                            let html = fs.readFileSync(htmlPath, 'utf-8');

                            const rawPath = path.resolve(__dirname, 'src/main.ts');
                            const posixPath = toPosixPath(rawPath);
                            const entryPath = `/@fs/${posixPath.replace(/^\//, '')}`;

                            if (html.includes('src="/src/main.ts"')) {
                                html = html.replace(
                                    'src="/src/main.ts"',
                                    `src="${entryPath}"`
                                );
                            } else {
                                console.error('[Workbench] 🔴 Could not find static script tag to replace.');
                            }

                            html = await server.transformIndexHtml(req.url, html);

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