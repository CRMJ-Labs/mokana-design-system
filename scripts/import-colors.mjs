import {readFileSync,writeFileSync} from 'node:fs';
import {readReferenceColors,referenceCommit,referenceSource} from './color-reference.mjs';

const destination=new URL('../tokens.json',import.meta.url);
const tokens=JSON.parse(readFileSync(destination,'utf8'));
const source=readReferenceColors();
const primitives=Object.fromEntries(Object.entries(source.common).map(([key,value])=>[`palette-${key}`,value]));
for(const mode of ['light','dark'])for(const [key,value]of Object.entries(source[mode]))primitives[`palette-${key}-${mode}`]=value;
const pair=name=>['light','dark'].map(mode=>`palette-${name}${name in source.common?'':`-${mode}`}`);
const semantic=Object.fromEntries([...new Set([...Object.keys(source.common),...Object.keys(source.light)])].map(name=>[name,pair(name)]));
const aliases={
  secondary:'muted',line:'separator','accent-text':'accent-soft-foreground','info-text':'accent-soft-foreground',
  'action-primary':'accent','action-primary-text':'accent-foreground','action-secondary':'accent','action-secondary-text':'accent-foreground',
  'button-primary-background':'accent','button-primary-text':'accent-foreground','button-secondary-background':'default','button-secondary-text':'accent-soft-foreground','button-ghost-text':'foreground',
  'code-keyword':'danger-soft-foreground','code-function':'accent-soft-foreground','code-string':'success-soft-foreground','code-constant':'warning-soft-foreground',
  'brand-primary':'accent','brand-on-primary':'accent-foreground','brand-subtle':'accent-soft',
  'chart-primary':'accent','chart-secondary':'success','selection-background':'accent-soft','selection-text':'accent-soft-foreground',
  'success-text':'success-soft-foreground','success-background':'success-soft','success-solid':'success','success-on-solid':'success-foreground',
  'warning-text':'warning-soft-foreground','warning-background':'warning-soft','warning-solid':'warning','warning-on-solid':'warning-foreground',
  'error-text':'danger-soft-foreground','error-background':'danger-soft','error-solid':'danger','error-on-solid':'danger-foreground',
  'info-background':'accent-soft','info-solid':'accent','info-on-solid':'accent-foreground',
  'inverse-background':'eclipse','inverse-text':'snow','shadow-color':'black',
};
for(const [name,target]of Object.entries(aliases))semantic[name]=pair(target);
semantic['inverse-secondary']=['palette-muted-dark','palette-muted-dark'];
semantic['inverse-line']=['palette-border-dark','palette-border-dark'];
semantic['inverse-accent']=pair('snow');

// Compatibility names point to MOK colors; none retain the former brand palette.
const legacy={ink:'eclipse',violet:'accent',cyan:'accent',lime:'accent',paper:'snow'};
for(const [name,target]of Object.entries(legacy))primitives[name]=`var(--${target})`;
for(const name of Object.keys(tokens.primitives)){
  if(name.startsWith('palette-')||name in primitives||name==='muted')continue;
  const match=name.match(/^(.*)-(light|dark)$/);
  if(match){
    const [,base,mode]=match;
    const target=({secondary:'muted',accent:'accent-soft-foreground',info:'accent-soft-foreground',success:'success-soft-foreground',warning:'warning-soft-foreground',error:'danger-soft-foreground','line':'separator','brand-subtle':'accent-soft','success-background':'success-soft','warning-background':'warning-soft','error-background':'danger-soft','info-background':'accent-soft',...aliases})[base]??base;
    if(target in source[mode]||target in source.common)primitives[name]=`var(--${pair(target)[mode==='light'?0:1]})`;
  }
}
primitives['overlay-color']='var(--backdrop)';
primitives['inverse-background-color']='var(--eclipse)';
primitives['inverse-text-color']='var(--snow)';
primitives['shadow-ink']='var(--black)';
tokens.primitives=primitives;
tokens.semantic=semantic;
tokens.metadata.colors={name:'MOK default theme',source:referenceSource,commit:referenceCommit,license:'Apache-2.0',reference:'docs/reference/default-theme/variables.css'};
tokens.metadata.notes='MOK typography, spacing, radii, components, default color tokens and derived color formulas. Legacy MOK color roles are aliases to semantic palette roles.';
tokens.paletteDefaults={brand:'#0485f7',accent:'#0485f7',success:'#17c964',warning:'#f5a524',error:'#ff383c',info:'#0485f7'};
tokens.shadows={low:'var(--surface-shadow)',overlay:'var(--overlay-shadow)'};
writeFileSync(destination,JSON.stringify(tokens,null,2)+'\n');
console.log(`Imported ${Object.keys(source.common).length} common and ${Object.keys(source.light).length} themed MOK tokens from ${referenceCommit}.`);
