import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('the publication hook runs every verification stage and stops on failure',()=>{
  const {scripts}=JSON.parse(fs.readFileSync('package.json','utf8'));
  const required=['tokens:check','docs:check','typecheck','build','build:lib','test:ui','test:checks','test:consumer','test:visual'];
  const stageNames=[...scripts.verify.matchAll(/npm run ([\w:]+)/g)].map(match=>match[1]);
  for(const name of required)assert.ok(stageNames.includes(name),`Missing release check: ${name}`);
  const directory=path.resolve('verification',`release-gate-${process.pid}`);
  fs.mkdirSync(directory,{recursive:true});
  const fixture={type:'module',scripts:{prepublishOnly:scripts.prepublishOnly,verify:scripts.verify,...Object.fromEntries(stageNames.map(name=>[name,`node stage.mjs ${name}`]))}};
  fs.writeFileSync(path.join(directory,'package.json'),JSON.stringify(fixture));
  fs.writeFileSync(path.join(directory,'stage.mjs'),"import fs from 'node:fs'; const name=process.argv[2]; fs.appendFileSync('stages.log',name+'\\n'); if(name===process.env.MOK_FAILED_STAGE)process.exit(17);\n");
  const npm=process.env.npm_execpath??path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
  for(const failed of [undefined,...required]){
    fs.writeFileSync(path.join(directory,'stages.log'),'');
    const result=spawnSync(process.execPath,[npm,'run','prepublishOnly'],{cwd:directory,encoding:'utf8',env:{...process.env,MOK_FAILED_STAGE:failed??''}});
    assert.ifError(result.error);
    const visited=fs.readFileSync(path.join(directory,'stages.log'),'utf8').trim().split('\n');
    assert.deepEqual(visited,failed?stageNames.slice(0,stageNames.indexOf(failed)+1):stageNames,`Stage order / fail-fast: ${failed??'all passing'}`);
    if(failed)assert.notEqual(result.status,0,`Publication must fail when ${failed} fails`);
    else assert.equal(result.status,0,result.stderr);
  }
});
