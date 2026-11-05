import {readFileSync} from 'node:fs';

export const referenceCommit='b2c65a5b5236550526f23d475b1ad0c6e5eab1a2';
export const referenceSource=`docs/reference/default-theme/variables.css`;
export const colorReference=new URL('../docs/reference/default-theme/variables.css',import.meta.url);

/** Read the pinned upstream declarations, without changing color spaces or formulas. */
export function readReferenceColors(){
  const css=readFileSync(colorReference,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  const blocks=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const declarations=selector=>Object.fromEntries([...blocks.find(([,_selector])=>selector(_selector))[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)]
    .map(([,name,value])=>[name,value.trim().replace(/\s+/g,' ')]));
  const common=declarations(selector=>selector.includes(':root')&&selector.includes(':host')&&!selector.includes('.light'));
  const light=declarations(selector=>selector.includes('.light')&&!selector.includes('data-vibrant'));
  const dark=declarations(selector=>selector.includes('.dark')&&!selector.includes('data-vibrant'));
  const colors=values=>Object.fromEntries(Object.entries(values).filter(([name,value])=>
    !['scrollbar-color','scrollbar-gutter','scrollbar-width'].includes(name)&&(name.endsWith('-shadow')||/^(?:oklch\(|rgba\(|color-mix\(|var\(|transparent$)/.test(value))));
  return {common:colors(common),light:colors(light),dark:colors(dark)};
}
