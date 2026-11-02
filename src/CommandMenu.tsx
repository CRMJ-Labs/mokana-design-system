import {Icon} from './Icon';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import './interaction-components.css';

export interface CommandItem {
  id:string;
  label:string;
  keywords?:string[];
  group?:string;
  suffix?:ReactNode;
  keybind?:string;
  disabled?:boolean;
  page?:string;
  href?:string;
  onSelect?:()=>void;
}
export interface CommandPage {id:string;label:string;placeholder?:string;items:CommandItem[]}
export interface CommandMenuProps {
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  items:CommandItem[];
  pages?:CommandPage[];
  label?:string;
  placeholder?:string;
  shortcut?:boolean;
}

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();

export function CommandMenu({open,onOpenChange,items,pages=[],label='Comandos de MOK',placeholder='Escribe un comando o busca…',shortcut=true}:CommandMenuProps){
  const dialog=useRef<HTMLDialogElement>(null);const input=useRef<HTMLInputElement>(null);
  const [stack,setStack]=useState<{page:string;query:string}[]>([{page:'',query:''}]);
  const [active,setActive]=useState(0);const id=useId();
  const callbacks=useRef({onOpenChange,open});callbacks.current={onOpenChange,open};
  const frame=stack.at(-1)!;
  const page=pages.find(item=>item.id===frame.page);
  const results=(page?.items??items).filter(item=>normalize([item.label,...item.keywords??[]].join(' ')).includes(normalize(frame.query)));
  const enabled=results.filter(item=>!item.disabled);
  const selected=enabled[Math.min(active,Math.max(0,enabled.length-1))];
  useEffect(()=>{
    if(!shortcut)return;
    const handle=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'&&!event.altKey){event.preventDefault();callbacks.current.onOpenChange(!callbacks.current.open);}};
    window.addEventListener('keydown',handle);return ()=>window.removeEventListener('keydown',handle);
  },[shortcut]);
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    setStack([{page:'',query:''}]);setActive(0);
    const node=dialog.current!;node.showModal();input.current?.focus();
    const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return ()=>{node.close();document.body.style.overflow=previousOverflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[open]);
  useEffect(()=>{if(open&&selected)document.getElementById(`${id}-${selected.id}`)?.scrollIntoView({block:'nearest'});},[open,id,selected?.id]);
  function back(){setStack(current=>current.length>1?current.slice(0,-1):current);setActive(0);input.current?.focus();}
  function choose(item:CommandItem){
    if(item.disabled)return;
    if(item.page&&pages.some(page=>page.id===item.page)){setStack(current=>[...current,{page:item.page!,query:''}]);setActive(0);input.current?.focus();return;}
    onOpenChange(false);item.onSelect?.();
  }
  return <dialog ref={dialog} className="mk-command-dialog" aria-labelledby={`${id}-title`} onCancel={event=>{event.preventDefault();onOpenChange(false);}} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)onOpenChange(false);}}}>
    <header className="mk-command-header">{stack.length>1&&<button type="button" onClick={back} aria-label="Volver a los comandos"><Icon name="arrow-left" size={16}/></button>}<h2 id={`${id}-title`}>{page?.label??label}</h2><button type="button" onClick={()=>onOpenChange(false)} aria-label="Cerrar comandos"><Icon name="close" size={16}/></button></header>
    <div className="mk-command-search"><Icon name="search" size={20}/><input ref={input} role="combobox" aria-label={page?.placeholder??placeholder} aria-expanded={open} aria-autocomplete="list" aria-controls={`${id}-results`} aria-activedescendant={selected?`${id}-${selected.id}`:undefined} placeholder={page?.placeholder??placeholder} value={frame.query} onChange={event=>{const query=event.target.value;setStack(current=>current.map((frame,index)=>index===current.length-1?{...frame,query}:frame));setActive(0);}} onKeyDown={event=>{
      if(event.nativeEvent.isComposing)return;
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setActive(current=>enabled.length?(current+(event.key==='ArrowDown'?1:-1)+enabled.length)%enabled.length:0);}
      if(event.key==='Home'){event.preventDefault();setActive(0);}
      if(event.key==='End'){event.preventDefault();setActive(Math.max(0,enabled.length-1));}
      if(event.key==='Enter'&&selected){event.preventDefault();if(selected.href)document.getElementById(`${id}-${selected.id}`)?.click();else choose(selected);}
      if(event.key==='Backspace'&&!frame.query&&stack.length>1){event.preventDefault();back();}
    }}/></div>
    <div id={`${id}-results`} role="listbox" aria-label="Resultados de comandos" className="mk-command-results">
      {results.map((item,index)=>{
        const content=<><span>{item.label}</span>{item.page&&<Icon name="chevron-right" size={16}/>}{item.suffix&&<span className="mk-command-suffix">{item.suffix}</span>}{item.keybind&&<kbd>{item.keybind}</kbd>}</>;
        const props={id:`${id}-${item.id}`,role:'option','aria-selected':item.id===selected?.id,'aria-disabled':item.disabled||undefined,tabIndex:-1,className:'mk-command-item',onMouseDown:(event:React.MouseEvent)=>event.preventDefault(),onMouseMove:()=>{const next=enabled.indexOf(item);if(next>=0)setActive(next);},onClick:()=>choose(item)};
        return <div role="presentation" key={item.id}>{item.group&&item.group!==results[index-1]?.group&&<div className="mk-command-group" role="presentation">{item.group}</div>}{item.href&&!item.disabled?<a {...props} href={item.href}>{content}</a>:<button {...props} type="button" disabled={item.disabled}>{content}</button>}</div>;
      })}
      {!results.length&&<p className="mk-command-empty">No se encontraron comandos</p>}
    </div>
    <footer className="mk-command-footer"><span role="status" aria-live="polite">{results.length} resultados</span><span>↑ ↓ recorrer · Enter ejecutar · Esc cerrar</span></footer>
  </dialog>;
}
