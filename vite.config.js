import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'content/main.js'
            },
            output: {
                entryFileNames: 'content.bundle.js'
            }
        },
        outDir: 'dist',
        // Allow external ES modules (transformers library)
        commonjsOptions: {
            include: /node_modules/
        }
    },
    // Optimize for transformers.js
    optimizeDeps: {
        exclude: ['@xenova/transformers']
    }
});