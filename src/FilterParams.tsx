import {Icon} from './Icon';
import {useEffect,useId,useLayoutEffect,useRef,useState,useSyncExternalStore} from 'react';
import {Button} from './components';
import {Error as ErrorMessage} from './Error';
import {ContextCard} from './ContextCard';
import './metrics-layout.css';

const changeEvent='mok-filter-params-change';
function subscribe(callback:()=>void){window.addEventListener('popstate',callback);window.addEventListener(changeEvent,callback);return ()=>{window.removeEventListener('popstate',callback);window.removeEventListener(changeEvent,callback);};}
function writeParams(update:(params:URLSearchParams)=>void,replace=false){
  const url=new URL(location.href);update(url.searchParams);
  if(url.href===location.href)return;
  history[replace?'replaceState':'pushState'](history.state,'',url);
  window.dispatchEvent(new Event(changeEvent));
}
export function useFilterParam(key:string):[string|undefined,(value:string|undefined)=>void]{
  const search=useSyncExternalStore(subscribe,()=>location.search,()=>'');
  return [new URLSearchParams(search).get(key)??undefined,value=>writeParams(params=>{if(value===undefined)params.delete(key);else params.set(key,value);})];
}
export interface FilterDefinition {
  key:string;
  label:string;
  options:{value:string;label:string}[];
  suggestion?:string;
  readonly?:boolean;
  /** Authoritative value for a read-only context filter. */
  value?:string;
  note?:string;
  encode?:(value:string)=>string;
  decode?:(value:string)=>string|undefined;
}
export interface FilterParamsBarProps {
  filters:FilterDefinition[];
  label?:string;
  ai?:(query:string)=>Promise<Record<string,string>>;
}
function decode(filter:FilterDefinition,raw:string|null){
  if(raw===null)return undefined;
  try{const value=filter.decode?filter.decode(raw):raw;return filter.options.some(option=>option.value===value)?value:undefined;}catch{return undefined;}
}
export function FilterParamsBar({filters,label='Filtros',ai}:FilterParamsBarProps){
  const search=useSyncExternalStore(subscribe,()=>location.search,()=>'');
  const params=new URLSearchParams(search);
  const [open,setOpen]=useState(false);const [filterKey,setFilterKey]=useState<string>();const [query,setQuery]=useState('');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const dialog=useRef<HTMLDialogElement>(null);const input=useRef<HTMLInputElement>(null);const add=useRef<HTMLSpanElement>(null);
  const request=useRef(0);const id=useId();
  const selectedFilter=filters.find(filter=>filter.key===filterKey);
  const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
  const choices=selectedFilter?selectedFilter.options.filter(option=>normalize(option.label).includes(normalize(query))):filters.filter(filter=>!filter.readonly&&normalize([filter.label,...filter.options.map(option=>option.label)].join(' ')).includes(normalize(query)));
  useEffect(()=>{
    const fixed=filters.filter(filter=>filter.readonly&&filter.value!==undefined);
    if(fixed.some(filter=>params.get(filter.key)!==(filter.encode?.(filter.value!)??filter.value)))writeParams(params=>{fixed.forEach(filter=>params.set(filter.key,filter.encode?.(filter.value!)??filter.value!));},true);
  },[filters,search]);
  useEffect(()=>()=>{request.current++;},[]);
  useLayoutEffect(()=>{
    if(!open)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const node=dialog.current!;node.showModal();input.current?.focus();
    return ()=>{node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[open]);
  useLayoutEffect(()=>{if(open&&dialog.current?.open&&!dialog.current.contains(document.activeElement))input.current?.focus();},[open,busy,error]);
  function close(){request.current++;setBusy(false);setOpen(false);setError('');}
  function show(key?:string){setFilterKey(key);setQuery('');setError('');setOpen(true);}
  function setValue(filter:FilterDefinition,value:string|undefined){
    if(filter.readonly)return;
    writeParams(params=>{if(value===undefined)params.delete(filter.key);else params.set(filter.key,filter.encode?.(value)??value);});
  }
  async function suggest(){
    if(!ai||busy||!query.trim())return;
    const token=++request.current;setBusy(true);setError('');
    try{
      const result=await ai(query.trim());if(token!==request.current)return;
      const accepted=filters.filter(filter=>!filter.readonly&&filter.options.some(option=>option.value===result[filter.key]));
      if(!accepted.length){setError('No se encontraron filtros para esa consulta.');return;}
      writeParams(params=>accepted.forEach(filter=>params.set(filter.key,filter.encode?.(result[filter.key])??result[filter.key])));close();
    }catch{if(token===request.current)setError('No se pudieron sugerir filtros. Vuelve a intentarlo.');}
    finally{if(token===request.current)setBusy(false);}
  }
  return <div className="mk-filter-bar" role="group" aria-label={label}>
    {filters.map(filter=>{
      const value=filter.readonly&&filter.value!==undefined?filter.value:decode(filter,params.get(filter.key));
      const option=filter.options.find(option=>option.value===value);if(!option)return null;
      const context=<>{filter.label}: {option.label}<Icon name="lock" size={16}/></>;
      return <span className="mk-filter-pill" key={filter.key}>{filter.readonly?filter.note?<ContextCard trigger={context} label={`Contexto de ${filter.label}`} render={props=><button {...props} type="button" className="mk-filter-context">{context}</button>}><p>{filter.note}</p></ContextCard>:<span className="mk-filter-locked">{context}</span>:<><button type="button" className="mk-filter-edit" aria-label={`Cambiar ${filter.label}: ${option.label}`} onClick={()=>show(filter.key)}>{filter.label}: <strong>{option.label}</strong></button><button type="button" className="mk-filter-remove" aria-label={`Quitar filtro ${filter.label}: ${option.label}`} onClick={()=>{add.current?.querySelector('button')?.focus();setValue(filter,undefined);}}><Icon name="close" size={16}/></button></>}</span>;
    })}
    <span ref={add}><Button variant="secondary" size="sm" aria-haspopup="dialog" aria-expanded={open} onClick={()=>show()}>Añadir filtro</Button></span>
    {filters.filter(filter=>!filter.readonly&&filter.suggestion!==undefined&&decode(filter,params.get(filter.key))===undefined).map(filter=>{const option=filter.options.find(option=>option.value===filter.suggestion);return option&&<button className="mk-filter-suggestion" type="button" key={filter.key} onClick={()=>setValue(filter,option.value)}>Sugerencia: {filter.label} · {option.label}</button>;})}
    <dialog ref={dialog} className="mk-filter-dialog" aria-labelledby={`${id}-title`} onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}} onKeyDown={event=>{
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      if((event.key==='Home'||event.key==='End')&&event.target===input.current)return;
      const options=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('[data-filter-option]')??[]);const current=options.indexOf(document.activeElement as HTMLButtonElement);
      const next=event.key==='Home'?0:event.key==='End'?options.length-1:event.key==='ArrowDown'?(current+1)%options.length:current<0?options.length-1:(current-1+options.length)%options.length;
      event.preventDefault();options[next]?.focus();
    }}>
      <header>{selectedFilter&&<button type="button" aria-label="Volver a los filtros" disabled={busy} onClick={()=>{setFilterKey(undefined);setQuery('');input.current?.focus();}}><Icon name="arrow-left" size={16}/></button>}<h3 id={`${id}-title`}>{selectedFilter?`Filtrar por ${selectedFilter.label}`:'Añadir filtro'}</h3><button type="button" aria-label="Cerrar filtros" onClick={close}><Icon name="close" size={16}/></button></header>
      <input ref={input} type="search" aria-label={selectedFilter?'Buscar valor de filtro':'Buscar filtro'} value={query} readOnly={busy} onChange={event=>setQuery(event.target.value)} placeholder={selectedFilter?'Busca un valor…':'Busca un filtro…'}/>
      <div className="mk-filter-options">{selectedFilter?(choices as FilterDefinition['options']).map(option=><button data-filter-option key={option.value} type="button" disabled={busy} onClick={()=>{setValue(selectedFilter,option.value);close();}}>{option.label}{decode(selectedFilter,params.get(selectedFilter.key))===option.value&&<Icon name="check" size={16}/>}</button>):(choices as FilterDefinition[]).map(filter=><button data-filter-option key={filter.key} type="button" disabled={busy} onClick={()=>{setFilterKey(filter.key);setQuery('');input.current?.focus();}}>{filter.label}<Icon name="chevron-right" size={16}/></button>)}{!choices.length&&<p>No se encontraron opciones</p>}</div>
      {!selectedFilter&&ai&&<Button variant="secondary" disabled={busy||!query.trim()} loading={busy} onClick={()=>void suggest()}>{busy?'Interpretando…':'Sugerir filtros para esta búsqueda'}</Button>}
      <div aria-live="polite">{error&&<ErrorMessage label={false} size="sm">{error}</ErrorMessage>}</div>
    </dialog>
  </div>;
}
