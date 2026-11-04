import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const source=path.dirname(require.resolve('@fontsource-variable/inter'));
const destination=new URL('../dist/fonts/',import.meta.url);
fs.mkdirSync(destination,{recursive:true});
const css=fs.readFileSync(path.join(source,'index.css'),'utf8').replace(/url\(\.\/files\/([^\s)]+)\)/g,(_,name)=>{
  fs.copyFileSync(path.join(source,'files',name),new URL(name,destination));
  return `url(./fonts/${name})`;
});
fs.copyFileSync(path.join(source,'LICENSE'),new URL('OFL.txt',destination));
fs.writeFileSync(new URL('../dist/fonts.css',import.meta.url),'/* Optional Inter subsets; unicode-range selects the files to download. */\n'+css);
console.log('Built optional fonts.css and cacheable WOFF2 subsets.');
