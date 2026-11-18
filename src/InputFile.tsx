import {useId,type ComponentPropsWithRef} from 'react';
import {Icon} from './Icon';
import './input-file.css';

interface InputFileBaseProps extends Omit<ComponentPropsWithRef<'input'>,'type'|'value'|'defaultValue'|'size'|'children'|'readOnly'> {
  hint?:string;
  error?:string;
  size?:'sm'|'md'|'lg';
  /** compact renders the native field; dropzone renders a large upload target. */
  variant?:'compact'|'dropzone';
  onValueChange?:(files:FileList|null)=>void;
  rootProps?:ComponentPropsWithRef<'div'>;
}
export type InputFileProps=InputFileBaseProps&(
  {label:string}|{label?:undefined;'aria-label':string}|{label?:undefined;'aria-labelledby':string}
);

/** Native file selection. Files stay in the browser until the application submits them. */
export function InputFile({label,hint,error,size='md',variant='compact',onChange,onValueChange,rootProps={},id:givenId,className='',...props}:InputFileProps){
  const generated=useId();
  const id=givenId??generated;
  const helper=error||hint;
  const describedBy=[props['aria-describedby'],helper?`${id}-help`:undefined].filter(Boolean).join(' ')||undefined;
  const input=<input {...props} id={id} type="file" className={`mk-input-file-control${className?` ${className}`:''}`} aria-invalid={error?true:props['aria-invalid']} aria-describedby={describedBy} onChange={event=>{
      onChange?.(event);
      if(!event.defaultPrevented)onValueChange?.(event.currentTarget.files);
    }}/>;
  return <div {...rootProps} className={`mk-field mk-input-file mk-input-file-${size} mk-input-file-variant-${variant}${rootProps.className?` ${rootProps.className}`:''}`}>
    {variant==='dropzone'?<label htmlFor={id} className="mk-input-file-dropzone">
      {input}
      <Icon name="plus" size={20}/>
      {label!==undefined&&<strong>{label}{props.required&&' *'}</strong>}
      <span className="mk-input-file-message" aria-live="polite">{helper&&<span id={`${id}-help`} className={error?'mk-input-file-error':''}>{error&&<Icon name="error" size={16}/>}<span>{helper}</span></span>}</span>
    </label>:<>
      {label!==undefined&&<label htmlFor={id}>{label}{props.required&&' *'}</label>}
      {input}
      <span className="mk-input-file-message" aria-live="polite">{helper&&<span id={`${id}-help`} className={`mk-help${error?' mk-input-file-error':''}`}>{error&&<Icon name="error" size={16}/>}<span>{helper}</span></span>}</span>
    </>}
  </div>;
}
