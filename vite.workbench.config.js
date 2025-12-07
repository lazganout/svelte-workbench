// vite.workbench.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svelteWorkbench from './workbench-plugin'; // Point to your local plugin
import path from 'path';
import fs from 'fs';

export default defineConfig({
    // 1. Set the root to the CURRENT working directory (the user's project)
    root: process.cwd(),

    // 2. We need to serve files from the workbench package (node_modules)
    // and the user's project
    server: {
        port: 52313,
        strictPort: true,
        fs: {
            strict: false,
            allow: [
                // Allow serving files from the user's project
                process.cwd(),
                // Allow serving files from the workbench package location
                __dirname
            ]
        }
    },

    resolve: {
        alias: {
            // This is crucial: When the workbench UI imports things, 
            // it might need to resolve specific workbench files.
            '$workbench': __dirname
        }
    },

    plugins: [
        svelte(), // Compiles user components AND workbench components
        svelteWorkbench({
            // Scan the User's SRC folder
            pattern: '/src/**/preview/*.svelte'
        }),

        // 3. Custom Plugin to serve the Workbench HTML
        {
            name: 'serve-workbench-html',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.url === '/' || req.url === '/index.html') {
                        // We read the index.html from YOUR package
                        const htmlPath = path.resolve(__dirname, 'index.html');
                        let html = fs.readFileSync(htmlPath, 'utf-8');

                        // We need to transform the script src in index.html to point to the absolute path
                        // of your main.ts, otherwise Vite looks for main.ts in the USER'S src folder.
                        html = await server.transformIndexHtml(req.url, html);

                        // Replace the entry point
                        // Assuming your index.html has <script type="module" src="/src/main.ts"></script>
                        // We replace it with the absolute path to the workbench main.ts
                        const entryPath = '/@fs' + path.resolve(__dirname, 'src/main.ts');
                        html = html.replace('src="/src/main.ts"', `src="${entryPath}"`);

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