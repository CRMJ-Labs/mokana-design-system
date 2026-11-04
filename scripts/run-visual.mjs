import {spawn} from 'node:child_process';
import path from 'node:path';
const consumer=path.resolve('examples/consumer');
const server=spawn(process.execPath,[path.join(consumer,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','3050','--strictPort'],{cwd:consumer,stdio:['ignore','pipe','pipe']});
let runner;
const interrupt=()=>{runner?.kill();server.kill();};
process.on('SIGINT',interrupt);process.on('SIGTERM',interrupt);
try{
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Visual preview did not start on port 3050')),15000);
    let errors='';server.stderr.on('data',data=>{errors+=data;});
    server.stdout.on('data',data=>{if(String(data).includes('3050')){clearTimeout(timer);resolve();}});
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Visual preview exited (${code}): ${errors}`));});
  });
  const code=await new Promise((resolve,reject)=>{
    runner=spawn(process.execPath,['node_modules/playwright/cli.js','test','--config','playwright.visual.config.ts',...process.argv.slice(2)],{stdio:'inherit'});
    runner.once('error',reject);runner.once('exit',code=>resolve(code??1));
  });
  process.exitCode=code;
}finally{server.kill();process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);}
