import {fileURLToPath,URL} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const fromRoot=(path:string)=>fileURLToPath(new URL(`../${path}`,import.meta.url));

export default defineConfig({
  plugins:[react()],
  resolve:{alias:[
    {find:'@mokanadev/design-system/styles.css',replacement:fromRoot('src/styles.css')},
    {find:'@mokanadev/design-system/fonts.css',replacement:fromRoot('src/fonts.css')},
    {find:'@mokanadev/design-system',replacement:fromRoot('src/index.ts')},
  ]},
});
