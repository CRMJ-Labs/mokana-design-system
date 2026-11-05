import {useEffect,useId,useImperativeHandle,useRef,useState,type ComponentPropsWithRef,type FocusEvent,type KeyboardEvent} from 'react';
import {Icon} from './Icon';
import './combobox.css';

export interface ComboboxProps extends Omit<ComponentPropsWithRef<'input'>,'onChange'|'list'> {
  label:string;
  options:string[];
  onChange?:(value:string)=>void;
  onValueChange?:(value:string)=>void;
  rootProps?:ComponentPropsWithRef<'div'>;
}

/** Editable combobox with a filterable listbox sized to its input. */
export function Combobox({label,options,onChange,onValueChange,placeholder='Buscar o seleccionar…',id:givenId,rootProps={},value,defaultValue='',disabled,readOnly,ref:externalRef,onFocus,onBlur,onKeyDown,autoComplete='off',...props}:ComboboxProps){
  const generated=useId();const id=givenId??generated;
  const input=useRef<HTMLInputElement>(null);const root=useRef<HTMLDivElement>(null);
  useImperativeHandle(externalRef,()=>input.current!,[]);
  const controlled=value!==undefined;
  const [internal,setInternal]=useState(String(defaultValue??''));
  const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
  const current=String(controlled?value??'':internal);
  const normalized=current.trim().toLocaleLowerCase();
  const filtered=options.filter(option=>!normalized||option.toLocaleLowerCase().includes(normalized));
  const listId=`${id}-listbox`;
  function commit(next:string){if(!controlled)setInternal(next);onChange?.(next);onValueChange?.(next);}
  function show(){if(disabled||readOnly)return;setOpen(true);setActive(filtered.length?Math.max(0,filtered.findIndex(option=>option===current)):-1);}
  function close(){setOpen(false);setActive(-1);}
  function select(option:string){commit(option);close();input.current?.focus();}
  function keyDown(event:KeyboardEvent<HTMLInputElement>){
    onKeyDown?.(event);if(event.defaultPrevented||disabled||readOnly)return;
    if(event.key==='ArrowDown'){event.preventDefault();if(!open){show();return;}setActive(index=>Math.min(filtered.length-1,index+1));}
    else if(event.key==='ArrowUp'){event.preventDefault();if(!open){show();setActive(filtered.length-1);return;}setActive(index=>Math.max(0,index-1));}
    else if(event.key==='Home'&&open){event.preventDefault();setActive(filtered.length?0:-1);}
    else if(event.key==='End'&&open){event.preventDefault();setActive(filtered.length-1);}
    else if(event.key==='Enter'&&open&&active>=0){event.preventDefault();select(filtered[active]);}
    else if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();close();}
  }
  function blur(event:FocusEvent<HTMLInputElement>){onBlur?.(event);if(!event.defaultPrevented&&!root.current?.contains(event.relatedTarget))close();}
  useEffect(()=>{if(disabled||readOnly)close();},[disabled,readOnly]);
  useEffect(()=>{if(active>=filtered.length)setActive(filtered.length-1);},[active,filtered.length]);
  return <div {...rootProps} className={`mk-field ${rootProps.className??''}`}>
    <label htmlFor={id}>{label}</label>
    <div ref={root} className="mk-combobox" data-open={open||undefined}>
      <input {...props} ref={input} id={id} role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={open} aria-controls={open?listId:undefined} aria-activedescendant={open&&active>=0?`${id}-option-${active}`:undefined} value={current} disabled={disabled} readOnly={readOnly} autoComplete={autoComplete} placeholder={placeholder} onFocus={event=>{onFocus?.(event);if(!event.defaultPrevented)show();}} onClick={show} onBlur={blur} onChange={event=>{commit(event.target.value);setOpen(true);setActive(-1);}} onKeyDown={keyDown}/>
      <Icon name="chevron" className="mk-combobox-chevron"/>
      {open&&<div id={listId} className="mk-combobox-listbox" role="listbox" aria-label={`Opciones de ${label}`}>
        {filtered.length?filtered.map((option,index)=><div id={`${id}-option-${index}`} key={option} role="option" aria-selected={option===current} data-active={index===active||undefined} onPointerDown={event=>event.preventDefault()} onPointerMove={()=>setActive(index)} onClick={()=>select(option)}>{option}</div>):<div className="mk-combobox-empty" role="status">Sin resultados</div>}
      </div>}
    </div>
  </div>;
}
