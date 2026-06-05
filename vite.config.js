import { defineConfig } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { crx } from '@crxjs/vite-plugin';
import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8'));

export default defineConfig({
    plugins: [
        svelte(),
        crx({ manifest }) 
    ],
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 3000,
        target: 'esnext',
    }
});