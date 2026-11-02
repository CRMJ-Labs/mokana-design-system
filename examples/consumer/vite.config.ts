import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

export default defineConfig({build:{rollupOptions:{input:{app:fileURLToPath(new URL('./index.html',import.meta.url)),api:fileURLToPath(new URL('./api.html',import.meta.url)),palette:fileURLToPath(new URL('./palette.html',import.meta.url))}}}});
