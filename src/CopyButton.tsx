import {Icon} from './Icon';
import {useEffect,useRef,useState,type ComponentPropsWithRef} from 'react';
import './interaction-components.css';

export interface CopyButtonProps extends Omit<ComponentPropsWithRef<'button'>,'onCopy'|'children'> {
  value:string;
  label?:string;
  onCopy?:()=>void;
  onCopyError?:(error:unknown)=>void;
  /** Shows the confirmation when the copy happens somewhere else. */
  copied?:boolean;
}
export function CopyButton({value,label='Copiar',disabled=false,onCopy,onCopyError,copied=false,className='',onClick,...props}:CopyButtonProps){
  const [internalState,setState]=useState<'idle'|'copying'|'copied'|'error'>('idle');
  const state=copied?'copied':internalState;
  const busy=useRef(false);const mounted=useRef(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;if(timer.current)clearTimeout(timer.current);};},[]);
  async function copy(){
    if(busy.current)return;busy.current=true;
    if(timer.current)clearTimeout(timer.current);setState('copying');
    try{
      await navigator.clipboard.writeText(value);
      if(mounted.current){setState('copied');timer.current=setTimeout(()=>setState('idle'),2000);}
      onCopy?.();
    }catch(error){if(mounted.current)setState('error');onCopyError?.(error);}
    finally{busy.current=false;}
  }
  const message=state==='copied'?'Copiado':state==='error'?'No se pudo copiar. Vuelve a intentarlo.':state==='copying'?'Copiando…':label;
  return <span className="mk-copy-control"><button {...props} type="button" disabled={disabled||state==='copying'} aria-label={message} title={message} className={`mk-copy-button ${className}`} onClick={event=>{onClick?.(event);if(!event.defaultPrevented)void copy();}}>
    <Icon name={state==='copied'?'check':'copy'} size={20}/>
  </button><span className={state==='error'?'mk-copy-error':'mk-sr-only'} role="status">{state==='copied'?'Copiado al portapapeles':state==='error'?message:''}</span></span>;
}
