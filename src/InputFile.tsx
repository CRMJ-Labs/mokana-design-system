import {useId,type ComponentPropsWithRef} from 'react';
import {Icon} from './Icon';
import './input-file.css';

interface InputFileBaseProps extends Omit<ComponentPropsWithRef<'input'>,'type'|'value'|'defaultValue'|'size'|'children'|'readOnly'> {
  hint?:string;
  error?:string;
  size?:'sm'|'md'|'lg';
  onValueChange?:(files:FileList|null)=>void;
  rootProps?:ComponentPropsWithRef<'div'>;
}
export type InputFileProps=InputFileBaseProps&(
  {label:string}|{label?:undefined;'aria-label':string}|{label?:undefined;'aria-labelledby':string}
);

/** Native file selection. Files stay in the browser until the application submits them. */
export function InputFile({label,hint,error,size='md',onChange,onValueChange,rootProps={},id:givenId,className='',...props}:InputFileProps){
  const generated=useId();
  const id=givenId??generated;
  const helper=error||hint;
  const describedBy=[props['aria-describedby'],helper?`${id}-help`:undefined].filter(Boolean).join(' ')||undefined;
  return <div {...rootProps} className={`mk-field mk-input-file mk-input-file-${size}${rootProps.className?` ${rootProps.className}`:''}`}>
    {label!==undefined&&<label htmlFor={id}>{label}{props.required&&' *'}</label>}
    <input {...props} id={id} type="file" className={`mk-input-file-control${className?` ${className}`:''}`} aria-invalid={error?true:props['aria-invalid']} aria-describedby={describedBy} onChange={event=>{
      onChange?.(event);
      if(!event.defaultPrevented)onValueChange?.(event.currentTarget.files);
    }}/>
    <span className="mk-input-file-message" aria-live="polite">{helper&&<span id={`${id}-help`} className={`mk-help${error?' mk-input-file-error':''}`}>{error&&<Icon name="error" size={16}/>}<span>{helper}</span></span>}</span>
  </div>;
}
