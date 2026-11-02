import {useEffect,useId,useImperativeHandle,useRef,useState,type ComponentPropsWithRef} from 'react';
import './legacy-components.css';

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {label:string;hint?:string;error?:string;showCount?:boolean;onValueChange?:(value:string)=>void;rootProps?:ComponentPropsWithRef<'div'>}
export function Textarea({label,hint,error,showCount=false,maxLength,id:givenId,value,defaultValue,onChange,onValueChange,rootProps={},ref:externalRef,...props}:TextareaProps){
  const generated=useId();const id=givenId??generated;const input=useRef<HTMLTextAreaElement>(null);
  const [text,setText]=useState(String(defaultValue??''));
  useImperativeHandle(externalRef,()=>input.current!,[]);
  useEffect(()=>{
    const form=input.current?.form;if(!form)return;
    let timer:ReturnType<typeof setTimeout>|undefined;
    const reset=(event:Event)=>{clearTimeout(timer);timer=setTimeout(()=>{if(!event.defaultPrevented)setText(input.current?.value??'');},0);};
    form.addEventListener('reset',reset);return ()=>{form.removeEventListener('reset',reset);clearTimeout(timer);};
  },[]);
  const helper=error||hint;const count=showCount&&maxLength!==undefined;
  const description=[props['aria-describedby'],helper?`${id}-help`:null,count?`${id}-count`:null].filter(Boolean).join(' ')||undefined;
  return <div {...rootProps} className={`mk-field mk-textarea ${rootProps.className??''}`}><label htmlFor={id}>{label}{props.required&&' *'}</label><textarea {...props} ref={input} id={id} value={value} defaultValue={defaultValue} maxLength={maxLength} aria-invalid={error?true:props['aria-invalid']??false} aria-describedby={description} onChange={event=>{setText(event.target.value);onChange?.(event);if(!event.defaultPrevented)onValueChange?.(event.target.value);}}/>
    <span className="mk-field-meta"><span className="mk-help" id={`${id}-help`} aria-live="polite">{helper}</span>{count&&<span id={`${id}-count`} className="mk-textarea-count">{String(value??text).length}/{maxLength}</span>}</span>
  </div>;
}
