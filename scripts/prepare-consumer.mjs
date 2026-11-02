import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const npm=process.env.npm_execpath??join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
function run(args,cwd=root){
  const result=spawnSync(process.execPath,[npm,...args],{cwd,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
run(['run','build:lib']);
const destination=join(root,'.consumer-pack');
mkdirSync(destination,{recursive:true});
for(const name of readdirSync(destination))if(name.endsWith('.tgz'))rmSync(join(destination,name));
run(['pack','--ignore-scripts','--pack-destination',destination,'--cache',join(root,'.npm-cache')]);
const archive=readdirSync(destination).find(name=>name.endsWith('.tgz'));
if(!archive)throw new Error('npm pack did not create an archive');
renameSync(join(destination,archive),join(destination,'design-system.tgz'));
const consumer=join(root,'examples/consumer');
// A file dependency keeps the same version while its contents change between builds.
rmSync(join(consumer,'node_modules/@mokanadev/design-system'),{recursive:true,force:true});
const lockPath=join(consumer,'package-lock.json');
if(existsSync(lockPath)){
  const lock=JSON.parse(readFileSync(lockPath,'utf8'));
  delete lock.packages['node_modules/@mokanadev/design-system'];
  writeFileSync(lockPath,JSON.stringify(lock,null,2)+'\n');
}
run(['install','--ignore-scripts','--prefer-offline','--no-audit','--no-fund','--cache',join(root,'.npm-cache')],consumer);
run(['run','build'],consumer);
