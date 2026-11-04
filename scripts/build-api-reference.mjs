import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseSync} from 'rolldown/utils';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=new Map(),types=new Map();
for(const file of fs.readdirSync(path.join(root,'src')).filter(file=>/\.tsx?$/.test(file)&&!file.endsWith('.d.ts'))){
  const source=fs.readFileSync(path.join(root,'src',file),'utf8');
  const parsed=parseSync(file,source);if(parsed.errors.length)throw new Error(`${file}: ${JSON.stringify(parsed.errors)}`);
  files.set(file,{source,body:parsed.program.body});
  for(const entry of parsed.program.body){const node=entry.declaration??entry;if(['TSInterfaceDeclaration','TSTypeAliasDeclaration'].includes(node.type))types.set(node.id.name,{node,file});}
}
const slice=(file,node)=>node?files.get(file).source.slice(node.start,node.end):'';
function propertyTypes(node,file,seen=new Set()){
  if(!node)return [];
  if(node.type==='TSTypeAnnotation'||node.type==='TSParenthesizedType')return propertyTypes(node.typeAnnotation,file,seen);
  if(node.type==='TSInterfaceDeclaration')return [...node.extends.flatMap(base=>propertyTypes({type:'TSTypeReference',typeName:base.expression,typeArguments:base.typeArguments},file,seen)),...propertyTypes(node.body,file,seen)];
  if(node.type==='TSTypeAliasDeclaration')return propertyTypes(node.typeAnnotation,file,seen);
  if(['TSInterfaceBody','TSTypeLiteral'].includes(node.type))return (node.body??node.members??[]).filter(member=>member.type==='TSPropertySignature').map(member=>({name:member.key.name??member.key.value,type:slice(file,member.typeAnnotation?.typeAnnotation)||'unknown',required:!member.optional}));
  if(node.type==='TSIntersectionType')return node.types.flatMap(type=>propertyTypes(type,file,seen));
  if(node.type==='TSUnionType'){
    const branches=node.types.map(type=>propertyTypes(type,file,seen));
    return [...new Set(branches.flat().map(prop=>prop.name))].map(name=>{
      const matches=branches.map(branch=>branch.find(prop=>prop.name===name));const available=matches.filter(Boolean);
      return {name,type:[...new Set(available.map(prop=>prop.type))].join(' | '),required:matches.every(prop=>prop?.required),conditional:!matches.every(prop=>prop?.required)&&matches.some(prop=>prop?.required)};
    });
  }
  if(node.type==='TSTypeReference'){
    const name=node.typeName?.name;
    const args=node.typeArguments?.params??node.typeParameters?.params??[];
    if(name==='Omit'||name==='Pick'){
      const keys=slice(file,args[1]).match(/['"]([^'"]+)['"]/g)?.map(key=>key.slice(1,-1))??[];
      return propertyTypes(args[0],file,seen).filter(prop=>name==='Omit'?!keys.includes(prop.name):keys.includes(prop.name));
    }
    if(seen.has(name)||!types.has(name))return [];
    const next=new Set(seen);next.add(name);const definition=types.get(name);return propertyTypes(definition.node,definition.file,next);
  }
  return [];
}
function collect(file,seen=new Set()){
  if(seen.has(file))return new Map();const next=new Set(seen);next.add(file);
  const result=new Map();const resolve=source=>`${path.posix.normalize(path.posix.join(path.posix.dirname(file),source))}.tsx`;
  for(const entry of files.get(file)?.body??[]){
    if(entry.type==='ExportAllDeclaration'){for(const [name,item] of collect(resolve(entry.source.value),next))result.set(name,item);}
    if(entry.type!=='ExportNamedDeclaration')continue;
    if(entry.declaration?.type==='FunctionDeclaration'&&/^[A-Z]/.test(entry.declaration.id.name))result.set(entry.declaration.id.name,{node:entry.declaration,file});
    if(entry.source){const source=collect(resolve(entry.source.value),next);for(const specifier of entry.specifiers){const name=specifier.local.name;const item=source.get(name);if(item)result.set(specifier.exported.name,item);}}
    else for(const specifier of entry.specifiers??[]){const item=result.get(specifier.local.name);if(item)result.set(specifier.exported.name,item);}
  }
  return result;
}
const entries=[];
for(const [name,{node,file}] of collect('index.ts')){
  const parameter=node.params[0];if(!parameter)continue;
  const pattern=parameter.type==='AssignmentPattern'?parameter.left:parameter;
  const annotation=pattern.typeAnnotation;
  const defaults=new Map((pattern.properties??[]).filter(prop=>prop.value?.type==='AssignmentPattern').map(prop=>[prop.key.name,slice(file,prop.value.right)]));
  for(const statement of node.body.body??[])if(statement.type==='VariableDeclaration')for(const declaration of statement.declarations){if(declaration.id.type==='ObjectPattern'&&declaration.init?.name===pattern.name)for(const prop of declaration.id.properties??[])if(prop.value?.type==='AssignmentPattern')defaults.set(prop.key.name,slice(file,prop.value.right));}
  const merged=new Map();
  for(const prop of propertyTypes(annotation,file)){
    const previous=merged.get(prop.name);
    if(previous&&previous.type!==prop.type){previous.type=[...new Set([previous.type,prop.type])].join(' | ');previous.required=previous.required&&prop.required;}
    else merged.set(prop.name,{...prop,default:defaults.get(prop.name)??null});
  }
  entries.push({name,source:file,signature:slice(file,annotation?.typeAnnotation),props:[...merged.values()].sort((a,b)=>Number(b.required)-Number(a.required)||a.name.localeCompare(b.name))});
}
const output=JSON.stringify(entries.sort((a,b)=>a.name.localeCompare(b.name)),null,2)+'\n';
const destination=path.join(root,'src/api-reference.generated.json');
if(process.argv.includes('--check')){
  if(!fs.existsSync(destination)||fs.readFileSync(destination,'utf8').replace(/\r\n/g,'\n')!==output){console.error('API reference is stale. Run npm run docs:api.');process.exit(1);}
  console.log(`API reference is current: ${entries.length} public components.`);
}else{fs.writeFileSync(destination,output);console.log(`Generated API reference: ${entries.length} public components.`);}
