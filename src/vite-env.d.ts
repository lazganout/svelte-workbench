/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module 'virtual:workbench' {
    import type { Component } from 'svelte';

    export interface WorkbenchConfig {
        mode: 'full' | 'hug' | 'fixed';
        width?: string;
        height?: string;
    }

    export interface WorkbenchEntry {
        path: string;
        // The module might contain a default component AND a named 'workbench' export
        component: () => Promise<{
            default: Component;
            workbench?: WorkbenchConfig
        }>;
    }

    const entries: WorkbenchEntry[];
    export default entries;
}