import {useEffect, useId, useImperativeHandle, useRef, useState, type ComponentPropsWithRef} from 'react';
import {Icon} from './components';
import './checkbox.css';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>,'type'|'onChange'|'size'> {
  label:string;
  description?:string;
  indeterminate?:boolean;
  onChange?:(checked:boolean)=>void;
  onCheckedChange?:(checked:boolean)=>void;
  rootProps?:ComponentPropsWithRef<'label'>;
}

export function Checkbox({label,description,indeterminate=false,checked,defaultChecked=false,onChange,onCheckedChange,rootProps={},ref:externalRef,id:givenId,className='',...props}:CheckboxProps){
  const generated=useId();
  const id=givenId??generated;
  const input=useRef<HTMLInputElement>(null);
  useImperativeHandle(externalRef,()=>input.current!,[]);
  const [internalChecked,setInternalChecked]=useState(defaultChecked);
  const selected=checked??internalChecked;
  useEffect(()=>{if(input.current)input.current.indeterminate=indeterminate;},[indeterminate,selected]);
  const describedBy=[props['aria-describedby'],description?`${id}-description`:undefined].filter(Boolean).join(' ')||undefined;
  return <label {...rootProps} className={`mk-choice mk-checkbox ${className} ${rootProps.className??''}`} htmlFor={id} title={props.title}>
    <input {...props} ref={input} id={id} type="checkbox" checked={selected} aria-label={props['aria-label']??label} aria-describedby={describedBy} onChange={event=>{if(checked===undefined)setInternalChecked(event.target.checked);onChange?.(event.target.checked);onCheckedChange?.(event.target.checked);}}/>
    <span className="mk-choice-control" aria-hidden="true"><Icon name="check"/><span className="mk-checkbox-dash"/></span>
    <span><strong>{label}</strong>{description&&<small id={`${id}-description`}>{description}</small>}</span>
  </label>;
}
