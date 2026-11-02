import {useId, useMemo, useState, type ChangeEvent, type ComponentPropsWithRef} from 'react';
import {Icon} from './components';

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

export function AddressInput({value,defaultValue,mode:givenMode='search',disabled=false,error,suggestions=defaultSuggestions,countries=defaultCountries,onChange,onValueChange,onModeChange,className='',...props}:AddressInputProps){
  const rootId=useId(),controlled=value!==undefined;
  const [internalValue,setInternalValue]=useState(()=>normalize(defaultValue));
  const [mode,setMode]=useState<AddressInputMode>(givenMode);
  const current=controlled?normalize(value):internalValue;
  const [query,setQuery]=useState(current.address),[open,setOpen]=useState(false);
  const filtered=useMemo(()=>{const needle=query.trim().toLocaleLowerCase();return needle.length<2?[]:suggestions.filter(item=>`${item.label} ${item.description??''}`.toLocaleLowerCase().includes(needle));},[query,suggestions]);
  const update=(patch:Partial<AddressValue>)=>{const next={...current,...patch};if(!controlled)setInternalValue(next);onChange?.(next);onValueChange?.(next);};
  const changeMode=(next:AddressInputMode)=>{setMode(next);setOpen(false);onModeChange?.(next);};
  const field=(key:keyof AddressValue)=>(event:ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>update({[key]:event.target.value});
  return <div {...props} className={`mk-address-input ${className}`} data-mode={mode}>
    <div className="mk-field"><label htmlFor={`${rootId}-country`}>País</label><select id={`${rootId}-country`} value={current.country} disabled={disabled} onChange={field('country')}>{countries.map(country=><option key={country.value} value={country.value}>{country.label}</option>)}</select></div>
    {mode==='search'?<div className="mk-field mk-address-search">
      <label htmlFor={`${rootId}-search`}>Dirección</label>
      <div className="mk-address-search-control"><Icon name="search"/><input id={`${rootId}-search`} role="combobox" aria-autocomplete="list" value={query} placeholder="Busca una dirección" autoComplete="street-address" disabled={disabled} aria-invalid={!!error} aria-describedby={`${rootId}-search-help`} aria-expanded={open&&filtered.length>0} aria-controls={`${rootId}-results`} onFocus={()=>setOpen(true)} onChange={event=>{setQuery(event.target.value);update({address:event.target.value});setOpen(true);}} onKeyDown={event=>{if(event.key==='Escape')setOpen(false);}}/>{query&&<button type="button" disabled={disabled} onClick={()=>{setQuery('');update({address:''});}} aria-label="Limpiar dirección">Limpiar</button>}</div>
      {open&&filtered.length>0&&<ul id={`${rootId}-results`} className="mk-address-results" role="listbox" aria-label="Direcciones sugeridas">{filtered.map(item=><li key={item.id} role="option" aria-selected={current.address===item.value.address}><button type="button" onClick={()=>{const next={...current,...item.value};setQuery(next.address);update(next);setOpen(false);}}><Icon name="arrow"/><span><strong>{item.label}</strong>{item.description&&<small>{item.description}</small>}</span></button></li>)}</ul>}
      <span className={`mk-help ${error?'mk-address-error':''}`} id={`${rootId}-search-help`}>{error||'Empieza a escribir para ver coincidencias.'}</span>
      <button className="mk-address-mode" type="button" disabled={disabled} onClick={()=>changeMode('manual')}>Ingresar la dirección manualmente</button>
    </div>:<div className="mk-address-manual">
      <div className="mk-field"><label htmlFor={`${rootId}-address`}>Dirección</label><input id={`${rootId}-address`} value={current.address} disabled={disabled} aria-invalid={!!error} aria-describedby={error?`${rootId}-address-error`:undefined} onChange={field('address')} placeholder="Calle y número"/>{error&&<span id={`${rootId}-address-error`} className="mk-help mk-address-error">{error}</span>}</div>
      <div className="mk-field"><label htmlFor={`${rootId}-line2`}>Complemento <span>(opcional)</span></label><input id={`${rootId}-line2`} value={current.addressLine2} disabled={disabled} onChange={field('addressLine2')} placeholder="Apto., oficina o interior"/></div>
      <div className="mk-address-locality"><div className="mk-field"><label htmlFor={`${rootId}-postal`}>Código postal</label><input id={`${rootId}-postal`} value={current.postalCode} disabled={disabled} inputMode="numeric" autoComplete="postal-code" onChange={field('postalCode')}/></div><div className="mk-field"><label htmlFor={`${rootId}-city`}>Ciudad</label><input id={`${rootId}-city`} value={current.city} disabled={disabled} autoComplete="address-level2" onChange={field('city')}/></div></div>
      <button className="mk-address-mode" type="button" disabled={disabled} onClick={()=>{setQuery(current.address);changeMode('search');}}>Buscar una dirección</button>
    </div>}
  </div>;
}
