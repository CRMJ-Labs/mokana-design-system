import {spawn} from 'node:child_process';
import fs from 'node:fs';

// One at a time: several checks share preview ports.
const limit=5*60*1000;
const checks=fs.readdirSync(new URL('.',import.meta.url)).filter(file=>/^check-.+\.mjs$/.test(file)).sort();
const failed=[];
for(const check of checks){
  const started=Date.now();
  const code=await new Promise(resolve=>{
    const child=spawn(process.execPath,[`scripts/${check}`],{stdio:'inherit'});
    const timer=setTimeout(()=>{console.error(`${check}: sin terminar tras ${limit/60000} min.`);child.kill();resolve('timeout');},limit);
    child.once('exit',exit=>{clearTimeout(timer);resolve(exit);});
    child.once('error',()=>{clearTimeout(timer);resolve('error');});
  });
  console.log(`${code===0?'OK   ':'FALLA'} ${check} (${Math.round((Date.now()-started)/1000)} s)`);
  if(code!==0)failed.push(check);
}
console.log(`${checks.length-failed.length} de ${checks.length} comprobaciones correctas.`);
if(failed.length){console.error(`Fallaron: ${failed.join(', ')}`);process.exit(1);}
process.exit(0);
