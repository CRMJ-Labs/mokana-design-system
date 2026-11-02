import {useId,type ComponentPropsWithRef} from 'react';
export interface RadioProps extends Omit<ComponentPropsWithRef<'input'>,'type'|'onChange'> {label:string;description?:string;onChange?:(checked:boolean)=>void;onCheckedChange?:(checked:boolean)=>void;rootProps?:ComponentPropsWithRef<'label'>}
export function Radio({label,description,checked,disabled,onChange,onCheckedChange,rootProps={},id:givenId,...props}:RadioProps){
  const generated=useId();const id=givenId??generated;
  return <label {...rootProps} className={`mk-choice mk-radio ${rootProps.className??''}`} htmlFor={id}><input {...props} id={id} type="radio" checked={checked} disabled={disabled} aria-describedby={[props['aria-describedby'],description?`${id}-help`:null].filter(Boolean).join(' ')||undefined} onChange={event=>{onChange?.(event.target.checked);onCheckedChange?.(event.target.checked);}}/><span className="mk-choice-control" aria-hidden="true"/><span><strong>{label}</strong>{description&&<small id={`${id}-help`}>{description}</small>}</span></label>;
}
