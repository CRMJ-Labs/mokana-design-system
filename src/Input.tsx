import {Icon} from './Icon';
import {useEffect,useId,useImperativeHandle,useRef,useState,type ComponentPropsWithRef,type ReactNode} from 'react';
import './input.css';

interface InputBaseProps extends Omit<ComponentPropsWithRef<'input'>,'size'|'prefix'> {
  hint?:string;
  error?:string;
  size?:'sm'|'md'|'lg'|number;
  prefix?:ReactNode;
  suffix?:ReactNode;
  prefixStyling?:boolean;
  suffixStyling?:boolean;
  rounded?:boolean;
  search?:boolean;
  /** Visual hint only; global command shortcuts belong to CommandMenu. */
  shortcut?:boolean;
  onClear?:()=>void;
  onValueChange?:(value:string)=>void;
  rootProps?:ComponentPropsWithRef<'div'>;
}
export type InputProps=InputBaseProps&(
  {label:string}|{label?:undefined;'aria-label':string}|{label?:undefined;'aria-labelledby':string}
);

export function Input({label,hint,error,size='md',prefix,suffix,prefixStyling=true,suffixStyling=true,rounded=false,search=false,shortcut=false,onClear,onValueChange,rootProps={},id:givenId,className='',ref:externalRef,value,defaultValue,disabled,readOnly,onChange,onKeyDown,type,...props}:InputProps){
  const generated=useId();const id=givenId??generated;
  const input=useRef<HTMLInputElement>(null);
  const [dirty,setDirty]=useState(()=>String(value??defaultValue??'').length>0);
  const [modifier,setModifier]=useState('Ctrl');
  useImperativeHandle(externalRef,()=>input.current!,[]);
  useEffect(()=>{setModifier(/Mac|iPhone|iPad/.test(navigator.platform)?'⌘':'Ctrl');},[]);
  useEffect(()=>{
    const form=input.current?.form;if(!form)return;
    const reset=()=>queueMicrotask(()=>setDirty(Boolean(input.current?.value)));
    form.addEventListener('reset',reset);return ()=>form.removeEventListener('reset',reset);
  },[]);
  const populated=value!==undefined?String(value).length>0:dirty;
  const visualSize=typeof size==='number'?'md':size;
  const helper=error||hint;
  const describedBy=[props['aria-describedby'],helper?`${id}-help`:undefined].filter(Boolean).join(' ')||undefined;
  function clear(){
    const node=input.current;
    if(!node||node.matches(':disabled')||node.readOnly||!node.value)return;
    // Dispatch a real input event so controlled consumers receive their usual onChange.
    const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
    setter?.call(node,'');node.dispatchEvent(new Event('input',{bubbles:true}));setDirty(false);onClear?.();
  }
  return <div {...rootProps} className={`mk-field mk-input mk-input-${visualSize}${rounded?' mk-input-rounded':''} ${className} ${rootProps.className??''}`}>
    {label!==undefined&&<label htmlFor={id}>{label}{props.required&&' *'}</label>}
    <div className="mk-input-control" data-disabled={disabled||undefined} data-invalid={!!error||undefined}>
      {search&&prefix==null&&<span className="mk-input-search-icon" aria-hidden="true"><Icon name="search" size={20}/></span>}
      {prefix!=null&&<span inert={disabled} className={`mk-input-affix mk-input-prefix${prefixStyling?' is-styled':''}`}>{prefix}</span>}
      <input {...props} ref={input} id={id} type={type??(search?'search':'text')} size={typeof size==='number'?size:undefined} value={value} defaultValue={defaultValue} disabled={disabled} readOnly={readOnly} aria-invalid={error?true:props['aria-invalid']??false} aria-describedby={describedBy} onChange={event=>{setDirty(Boolean(event.target.value));onChange?.(event);if(!event.defaultPrevented)onValueChange?.(event.target.value);}} onKeyDown={event=>{
        onKeyDown?.(event);
        if(!event.defaultPrevented&&!event.nativeEvent.isComposing&&event.key==='Escape'&&(search||shortcut)&&populated&&!disabled&&!readOnly){event.preventDefault();event.stopPropagation();clear();}
      }}/>
      {suffix!=null&&<span inert={disabled} className={`mk-input-affix mk-input-suffix${suffixStyling?' is-styled':''}`}>{suffix}</span>}
      {shortcut&&<kbd className="mk-input-shortcut" aria-hidden="true">{populated?'Esc':`${modifier} K`}</kbd>}
    </div>
    <span className="mk-input-message" aria-live="polite">{helper&&<span className="mk-help" id={`${id}-help`}>{error&&<Icon name="error" size={16}/>}{helper}</span>}</span>
  </div>;
}
