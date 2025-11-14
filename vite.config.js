import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'content/main.js'
            },
            output: {
                entryFileNames: 'content.bundle.js',
                // Output as IIFE to avoid module issues in Chrome extension
                format: 'iife',
                // Prevent code splitting - bundle everything together
                manualChunks: undefined,
                inlineDynamicImports: true,
            }
        },
        outDir: 'dist',
        // Increase chunk size warning limit since we're bundling everything
        chunkSizeWarningLimit: 3000,
        commonjsOptions: {
            include: /node_modules/
        },
        // Target for Chrome extensions
        target: 'esnext',
    },
    // Optimize for transformers.js
    optimizeDeps: {
        exclude: ['@xenova/transformers']
    },
    // Allow loading ONNX models and WASM files
    assetsInclude: ['**/*.onnx', '**/*.wasm'],
    // Define import.meta.url for transformers.js
    define: {
        'import.meta.url': JSON.stringify(''),
    }
});

// import { defineConfig } from 'vite';
// import { resolve } from 'path';

// export default defineConfig({
//   build: {
//     rollupOptions: {
//       input: {
//         // Your entry points
//         content: resolve(__dirname, 'content/main.js'),
//       },
//       output: {
//         // Prevent code splitting for transformers
//         manualChunks: undefined,
//       }
//     },
//     // Increase chunk size warning limit
//     chunkSizeWarningLimit: 3000,
//   },
//   optimizeDeps: {
//     exclude: ['@xenova/transformers']
//   },
//   // Important: Allow loading ONNX models
//   assetsInclude: ['**/*.onnx', '**/*.wasm'],
// });