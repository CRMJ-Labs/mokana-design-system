import {useEffect, useRef, useState} from 'react';
import {Icon} from './components';
import './breadcrumbs.css';

export interface BreadcrumbItem {
  label:string;
  href?:string;
  active?:boolean;
  disabled?:boolean;
  menu?:{label:string;href:string;disabled?:boolean}[];
}

export interface BreadcrumbsProps {
  items:BreadcrumbItem[];
  variant?:'text'|'menu';
  disabled?:boolean;
  label?:string;
}

export function Breadcrumbs({items,variant='text',disabled=false,label='Ruta'}:BreadcrumbsProps){
  const root=useRef<HTMLElement>(null);
  const [openIndex,setOpenIndex]=useState<number|null>(null);
  useEffect(()=>{
    if(openIndex===null)return;
    const closeOutside=(event:PointerEvent)=>{
      const expanded=root.current?.querySelector('details[open]');
      if(event.target instanceof Node&&!expanded?.contains(event.target))setOpenIndex(null);
    };
    document.addEventListener('pointerdown',closeOutside);
    return ()=>document.removeEventListener('pointerdown',closeOutside);
  },[openIndex]);
  const selected=items.findIndex(item=>item.active);
  const activeIndex=selected<0?items.length-1:selected;
  return <nav ref={root} aria-label={label} className={`mk-breadcrumbs mk-breadcrumbs-${variant}`}>
    <ol>{items.map((item,index)=>{
      const inactive=disabled||item.disabled;
      const active=index===activeIndex;
      const current=active?'page' as const:undefined;
      const content=inactive?<span aria-disabled="true" aria-current={current}>{item.label}</span>:
        variant==='menu'&&item.menu?.length?<details className="mk-breadcrumb-menu" open={openIndex===index} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpenIndex(null);}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();setOpenIndex(null);event.currentTarget.querySelector('summary')?.focus();}}}>
          <summary aria-current={current} onClick={event=>{event.preventDefault();setOpenIndex(previous=>previous===index?null:index);}}>{item.label}<Icon name="chevron"/></summary>
          <ul className="mk-breadcrumb-options" aria-label={`Opciones de ${item.label}`}>{item.menu.map(option=><li key={option.href}>{option.disabled?<span aria-disabled="true">{option.label}</span>:<a href={option.href} onClick={()=>setOpenIndex(null)}>{option.label}</a>}</li>)}</ul>
        </details>:
        item.href?<a href={item.href} aria-current={current}>{item.label}</a>:<span aria-current={current}>{item.label}</span>;
      return <li key={`${item.label}-${index}`} data-active={active||undefined}>{content}{index<items.length-1&&<span className="mk-breadcrumb-separator" aria-hidden="true"><Icon name="chevron"/></span>}</li>;
    })}</ol>
  </nav>;
}
