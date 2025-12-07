import type { Plugin } from 'vite';

export default function svelteWorkbench(): Plugin {
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
                // We return code that uses Vite's native glob feature.
                // Vite will parse this string, find the files, and keep them updated (HMR).
                return `
          const globResult = import.meta.glob('/playground/**/preview/*.svelte');
          
          export default Object.entries(globResult).map(([path, loader]) => ({
            path,
            component: loader
          }));
        `;
            }
        }
    };
}