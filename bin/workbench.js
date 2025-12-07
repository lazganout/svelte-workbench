#!/usr/bin/env node

import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Boilerplate to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate the path to the config file we created in Step 2
// Assumes bin/workbench.js is one level deep, so we go up one level
const configPath = path.resolve(__dirname, '../vite.workbench.config.ts');

async function startServer() {
    console.log('🚀 Starting Svelte Workbench...');

    try {
        const server = await createServer({
            configFile: configPath,
            mode: 'development'
        });

        await server.listen();

        server.printUrls();
    } catch (e) {
        console.error('Failed to start workbench:', e);
        process.exit(1);
    }
}

startServer();