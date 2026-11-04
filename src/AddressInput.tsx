import {useEffect, useId, useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type ComponentPropsWithRef} from 'react';
import {Icon} from './components';
import './address-input.css';

export type AddressInputMode = 'search' | 'manual';
export interface AddressValue {country:string;address:string;addressLine2:string;postalCode:string;city:string;}
export interface AddressSuggestion {id:string;label:string;description?:string;value:Partial<AddressValue>;}
export interface AddressInputProps extends Omit<ComponentPropsWithRef<'div'>,'onChange'|'defaultValue'|'children'> {
  onValueChange?:(value:AddressValue)=>void;
  value?:Partial<AddressValue>;defaultValue?:Partial<AddressValue>;mode?:AddressInputMode;disabled?:boolean;error?:string;
  suggestions?:AddressSuggestion[];countries?:{value:string;label:string}[];onChange?:(value:AddressValue)=>void;onModeChange?:(mode:AddressInputMode)=>void;
}
const emptyAddress:AddressValue={country:'CO',address:'',addressLine2:'',postalCode:'',city:''};
const defaultCountries=[{value:'CO',label:'Colombia'},{value:'MX',label:'México'},{value:'US',label:'Estados Unidos'},{value:'ES',label:'España'}];
const defaultSuggestions:AddressSuggestion[]=[
  {id:'bogota-93',label:'Calle 93 # 13–24',description:'Chapinero, Bogotá',value:{address:'Calle 93 # 13–24',city:'Bogotá',postalCode:'110221'}},
  {id:'bogota-80',label:'Carrera 7 # 80–15',description:'El Retiro, Bogotá',value:{address:'Carrera 7 # 80–15',city:'Bogotá',postalCode:'110221'}},
  {id:'medellin',label:'Calle 10 # 34–11',description:'El Poblado, Medellín',value:{address:'Calle 10 # 34–11',city:'Medellín',postalCode:'050021'}},
];
const normalize=(value?:Partial<AddressValue>):AddressValue=>({...emptyAddress,...value});

export function AddressInput({value,defaultValue,mode:givenMode='search',disabled=false,error,suggestions=defaultSuggestions,countries=defaultCountries,onChange,onValueChange,onModeChange,className='',ref:externalRef,onBlurCapture,...props}:AddressInputProps){
  const rootId=useId(),controlled=value!==undefined;
  const root=useRef<HTMLDivElement>(null),search=useRef<HTMLInputElement>(null);
  useImperativeHandle(externalRef,()=>root.current!,[]);
  const [internalValue,setInternalValue]=useState(()=>normalize(defaultValue));
  const [mode,setMode]=useState<AddressInputMode>(givenMode);
  const current=controlled?normalize(value):internalValue;
  const query=current.address;
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState<{query:string;id:string}|null>(null);
  const filtered=useMemo(()=>{const needle=query.trim().toLocaleLowerCase();return needle.length<2?[]:suggestions.filter(item=>`${item.label} ${item.description??''}`.toLocaleLowerCase().includes(needle));},[query,suggestions]);
  const expanded=open&&!disabled&&mode==='search'&&filtered.length>0;
  const activeIndex=active?.query===query?filtered.findIndex(item=>item.id===active.id):-1;
  const close=()=>{setOpen(false);setActive(null);};
  useEffect(()=>{
    if(expanded&&activeIndex>=0)root.current?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')?.scrollIntoView({block:'nearest'});
  },[expanded,activeIndex]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){setOpen(false);setActive(null);}};
    document.addEventListener('pointerdown',outside);
    return ()=>document.removeEventListener('pointerdown',outside);
  },[open]);
  useEffect(()=>{if(disabled){setOpen(false);setActive(null);}},[disabled]);
  const update=(patch:Partial<AddressValue>)=>{const next={...current,...patch};if(!controlled)setInternalValue(next);onChange?.(next);onValueChange?.(next);};
  const select=(item:AddressSuggestion)=>{update(item.value);search.current?.focus();close();};
  const changeMode=(next:AddressInputMode)=>{setMode(next);close();onModeChange?.(next);};
  const field=(key:keyof AddressValue)=>(event:ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>update({[key]:event.target.value});
  return <div {...props} ref={root} className={`mk-address-input ${className}`} data-mode={mode} onBlurCapture={event=>{onBlurCapture?.(event);if(!event.defaultPrevented&&!event.currentTarget.contains(event.relatedTarget as Node|null))close();}}>
    <div className="mk-field"><label htmlFor={`${rootId}-country`}>País</label><select id={`${rootId}-country`} value={current.country} disabled={disabled} onChange={field('country')}>{countries.map(country=><option key={country.value} value={country.value}>{country.label}</option>)}</select></div>
    {mode==='search'?<div className="mk-field mk-address-search">
      <label htmlFor={`${rootId}-search`}>Dirección</label>
      <div className="mk-address-search-control"><Icon name="search"/><input ref={search} id={`${rootId}-search`} role="combobox" aria-autocomplete="list" aria-haspopup="listbox" value={query} placeholder="Busca una dirección" autoComplete="street-address" disabled={disabled} aria-invalid={!!error} aria-describedby={`${rootId}-search-help`} aria-expanded={expanded} aria-controls={expanded?`${rootId}-results`:undefined} aria-activedescendant={expanded&&activeIndex>=0?`${rootId}-option-${activeIndex}`:undefined} onFocus={()=>setOpen(true)} onBlur={close} onChange={event=>{update({address:event.target.value});setActive(null);setOpen(true);}} onKeyDown={event=>{
        if(event.nativeEvent.isComposing)return;
        if((event.key==='ArrowDown'||event.key==='ArrowUp')&&filtered.length){
          event.preventDefault();const step=event.key==='ArrowDown'?1:-1;
          const index=!expanded||activeIndex<0?(step===1?0:filtered.length-1):(activeIndex+step+filtered.length)%filtered.length;
          setOpen(true);setActive({query,id:filtered[index].id});
        }else if(event.key==='Enter'&&expanded&&activeIndex>=0){event.preventDefault();select(filtered[activeIndex]);}
        else if(event.key==='Escape'&&expanded){event.preventDefault();event.stopPropagation();close();}
        else if(event.key==='Tab')close();
      }}/>{query&&<button type="button" disabled={disabled} onClick={()=>{update({address:''});search.current?.focus();close();}} aria-label="Limpiar dirección">Limpiar</button>}</div>
      {expanded&&<ul id={`${rootId}-results`} className="mk-address-results" role="listbox" aria-label="Direcciones sugeridas">{filtered.map((item,index)=><li id={`${rootId}-option-${index}`} key={item.id} role="option" aria-selected={activeIndex===index} onPointerDown={event=>event.preventDefault()} onPointerMove={()=>setActive({query,id:item.id})} onClick={()=>select(item)}><Icon name="arrow"/><span><strong>{item.label}</strong>{item.description&&<small>{item.description}</small>}</span></li>)}</ul>}
      <span className={`mk-help ${error?'mk-address-error':''}`} id={`${rootId}-search-help`}>{error||'Empieza a escribir para ver coincidencias.'}</span>
      <button className="mk-address-mode" type="button" disabled={disabled} onClick={()=>changeMode('manual')}>Ingresar la dirección manualmente</button>
    </div>:<div className="mk-address-manual">
      <div className="mk-field"><label htmlFor={`${rootId}-address`}>Dirección</label><input id={`${rootId}-address`} value={current.address} disabled={disabled} aria-invalid={!!error} aria-describedby={error?`${rootId}-address-error`:undefined} onChange={field('address')} placeholder="Calle y número"/>{error&&<span id={`${rootId}-address-error`} className="mk-help mk-address-error">{error}</span>}</div>
      <div className="mk-field"><label htmlFor={`${rootId}-line2`}>Complemento <span>(opcional)</span></label><input id={`${rootId}-line2`} value={current.addressLine2} disabled={disabled} onChange={field('addressLine2')} placeholder="Apto., oficina o interior"/></div>
      <div className="mk-address-locality"><div className="mk-field"><label htmlFor={`${rootId}-postal`}>Código postal</label><input id={`${rootId}-postal`} value={current.postalCode} disabled={disabled} inputMode="numeric" autoComplete="postal-code" onChange={field('postalCode')}/></div><div className="mk-field"><label htmlFor={`${rootId}-city`}>Ciudad</label><input id={`${rootId}-city`} value={current.city} disabled={disabled} autoComplete="address-level2" onChange={field('city')}/></div></div>
      <button className="mk-address-mode" type="button" disabled={disabled} onClick={()=>changeMode('search')}>Buscar una dirección</button>
    </div>}
  </div>;
}
