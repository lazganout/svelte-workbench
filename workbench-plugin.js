export default function svelteWorkbench(options = {}) {
    // Default options
    const pattern = options.pattern || '/src/**/preview/*.svelte';

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
                return `
          const globResult = import.meta.glob('${pattern}');
          
          export default Object.entries(globResult).map(([path, loader]) => ({
            path,
            component: loader
          }));
        `;
            }
        }
    };
}