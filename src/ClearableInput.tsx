import {useEffect, useId, useImperativeHandle, useRef, useState, type ComponentPropsWithRef} from 'react';
import {Icon, type IconName} from './components';
import './clearable-input.css';

export interface ClearableInputProps extends Omit<ComponentPropsWithRef<'input'>,'value'|'defaultValue'|'onChange'|'size'> {
  label?:string;
  value?:string;
  defaultValue?:string;
  hint?:string;
  error?:string;
  shortcut?:boolean;
  icon?:IconName;
  clearLabel?:string;
  onChange?:(value:string)=>void;
  onValueChange?:(value:string)=>void;
  rootProps?:ComponentPropsWithRef<'div'>;
  onClear?:()=>void;
}

export function ClearableInput({label,value,defaultValue='',hint,error,shortcut=false,icon,clearLabel='Limpiar texto',onChange,onValueChange,onClear,rootProps={},ref:externalRef,id:givenId,className='',disabled,readOnly,onKeyDown,...props}:ClearableInputProps){
  const generated=useId();
  const id=givenId??generated;
  const input=useRef<HTMLInputElement>(null);
  useImperativeHandle(externalRef,()=>input.current!,[]);
  const [internal,setInternal]=useState(defaultValue);
  const [modifier,setModifier]=useState('Ctrl');
  const current=value??internal;
  const editable=!disabled&&!readOnly;
  useEffect(()=>{
    setModifier(/Mac|iPhone|iPad/.test(navigator.platform)?'⌘':'Ctrl');
    if(!shortcut||disabled)return;
    const focus=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();input.current?.focus();
      }
    };
    document.addEventListener('keydown',focus);
    return ()=>document.removeEventListener('keydown',focus);
  },[shortcut,disabled]);
  function update(next:string){if(value===undefined)setInternal(next);onChange?.(next);onValueChange?.(next);}
  function clear(){
    if(!editable||!current)return;
    update('');onClear?.();input.current?.focus();
  }
  const description=[props['aria-describedby'],hint||error?`${id}-help`:undefined].filter(Boolean).join(' ')||undefined;
  return <div {...rootProps} className={`mk-field mk-clearable ${className} ${rootProps.className??''}`}>
    {label&&<label htmlFor={id}>{label}{props.required&&' *'}</label>}
    <div className="mk-clearable-control" data-disabled={disabled||undefined} data-invalid={!!error||undefined}>
      {icon&&<span className="mk-clearable-icon"><Icon name={icon}/></span>}
      <input {...props} ref={input} id={id} value={current} disabled={disabled} readOnly={readOnly} aria-label={props['aria-label']??(label?undefined:'Texto')} aria-invalid={error?true:props['aria-invalid']} aria-describedby={description} onChange={event=>update(event.target.value)} onKeyDown={event=>{
        onKeyDown?.(event);
        if(!event.defaultPrevented&&!event.nativeEvent.isComposing&&event.key==='Escape'&&editable&&current){event.preventDefault();event.stopPropagation();clear();}
      }}/>
      {editable&&current&&<button type="button" className="mk-clearable-button" aria-label={clearLabel} title={`${clearLabel} (Escape)`} onClick={clear}><Icon name="close"/><kbd aria-hidden="true">Esc</kbd></button>}
      {shortcut&&<kbd className="mk-clearable-shortcut" aria-hidden="true">{modifier} K</kbd>}
    </div>
    {(hint||error)&&<span className={`mk-help${error?' mk-clearable-error':''}`} id={`${id}-help`}>{error&&<Icon name="warning"/>}{error||hint}</span>}
  </div>;
}
