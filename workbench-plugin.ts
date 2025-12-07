// src/workbench-plugin.ts
import type { Plugin } from 'vite';

export default function svelteWorkbench(options = { pattern: '/src/**/preview/*.svelte' }): Plugin {
    const virtualModuleId = 'virtual:workbench';
    const resolvedVirtualModuleId = '\0' + virtualModuleId;

    return {
        name: 'svelte-workbench-plugin',
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                // We inject the pattern provided in options
                return `
          const globResult = import.meta.glob('${options.pattern}');
          
          export default Object.entries(globResult).map(([path, loader]) => ({
            path,
            component: loader
          }));
        `;
            }
        }
    };
}