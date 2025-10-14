import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'content/contentScript.js'
            },
            output: {
                entryFileNames: 'content.bundle.js'
            }
        },
        outDir: 'dist',
    }
});