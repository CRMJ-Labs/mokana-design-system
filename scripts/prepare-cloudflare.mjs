import {existsSync,rmSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'website-dist');
if(!existsSync(resolve(output,'index.html')))throw new Error('Build the website before preparing Cloudflare assets.');
const redirects=resolve(output,'_redirects');
if(dirname(redirects)!==output)throw new Error('Redirect file must remain inside the website build.');
// Workers handles SPA navigation through wrangler.jsonc. The catch-all Pages
// rewrite would also intercept JavaScript, CSS and fonts when applied by Workers.
rmSync(redirects,{force:true});
console.log('Cloudflare assets ready: website-dist; SPA routing configured in wrangler.jsonc.');
