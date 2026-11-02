import {createContext,useCallback,useContext,useEffect,useId,useMemo,useRef,useState,type ComponentPropsWithRef,type ReactNode} from 'react';
import {Icon} from './components';
import './toast.css';

export type ToastTone='info'|'success'|'warning'|'error';
export interface ToastAction {label:string;onClick:()=>void}
export interface ToastProps extends Omit<ComponentPropsWithRef<'div'>,'title'> {
  title:ReactNode;
  tone?:ToastTone;
  action?:ToastAction;
  onClose?:()=>void;
  /** The provider announces the complete list once, instead of each toast. */
  announce?:boolean;
}

export function Toast({title,children,tone='info',action,onClose,announce=true,className='',...props}:ToastProps){
  const toneLabels={info:'Información',success:'Completado',warning:'Advertencia',error:'Error'};
  return <div role={announce?'status':undefined} {...props} className={`mk-toast mk-notification mk-toast-${tone}${className?` ${className}`:''}`}>
    <span className="mk-toast-symbol"><Icon name={tone==='success'?'check':tone==='info'?'info':'warning'}/><span className="mk-sr-only">{toneLabels[tone]}: </span></span>
    <div className="mk-toast-body"><strong>{title}</strong>{children!=null&&<div className="mk-toast-description">{children}</div>}{action&&<button type="button" className="mk-toast-action" onClick={action.onClick}>{action.label}</button>}</div>
    {onClose&&<button type="button" className="mk-toast-close" aria-label="Cerrar notificación" onClick={onClose}><Icon name="close"/></button>}
  </div>;
}

export interface ToastOptions {
  description?:ReactNode;
  duration?:number;
  preserve?:boolean;
  action?:ToastAction;
}
interface ToastEntry extends ToastOptions {
  id:string;
  title:ReactNode;
  tone:ToastTone;
  origin:HTMLElement|null;
}
interface ToastContextValue {
  message:(title:ReactNode,options?:ToastOptions)=>string;
  success:(title:ReactNode,options?:ToastOptions)=>string;
  warning:(title:ReactNode,options?:ToastOptions)=>string;
  error:(title:ReactNode,options?:ToastOptions)=>string;
  dismiss:(id:string)=>void;
}
const ToastContext=createContext<ToastContextValue|null>(null);

function ManagedToast({entry,dismiss}:{entry:ToastEntry;dismiss:(id:string)=>void}){
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [hidden,setHidden]=useState(()=>document.hidden);
  const duration=entry.duration??(entry.action?8000:5000);
  const remaining=useRef(Number.isFinite(duration)?Math.max(0,duration):5000);
  useEffect(()=>{
    const update=()=>setHidden(document.hidden);
    document.addEventListener('visibilitychange',update);
    return ()=>document.removeEventListener('visibilitychange',update);
  },[]);
  useEffect(()=>{
    if(entry.preserve||hovered||focused||hidden)return;
    const started=Date.now();
    const timer=setTimeout(()=>dismiss(entry.id),remaining.current);
    return ()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(Date.now()-started));};
  },[entry.id,entry.preserve,hovered,focused,hidden,dismiss]);
  return <li className="mk-toast-list-item" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
    <Toast id={entry.id} tabIndex={0} announce={false} title={entry.title} tone={entry.tone} onClose={()=>dismiss(entry.id)} action={entry.action?{label:entry.action.label,onClick:()=>{dismiss(entry.id);entry.action?.onClick();}}:undefined} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss(entry.id);}}}>{entry.description}</Toast>
  </li>;
}

export function ToastProvider({children}:{children:ReactNode}){
  const [entries,setEntries]=useState<ToastEntry[]>([]);
  const entriesRef=useRef(entries);entriesRef.current=entries;
  const region=useRef<HTMLElement>(null);
  const prefix=useId();const counter=useRef(0);
  const dismiss=useCallback((id:string)=>{
    const entry=entriesRef.current.find(item=>item.id===id);
    const node=document.getElementById(id);
    if(node?.contains(document.activeElement)&&entry?.origin?.isConnected)entry.origin.focus({preventScroll:true});
    setEntries(current=>current.filter(item=>item.id!==id));
  },[]);
  const add=useCallback((tone:ToastTone,title:ReactNode,options:ToastOptions={})=>{
    const id=`${prefix}-toast-${++counter.current}`;
    const origin=document.activeElement instanceof HTMLElement?document.activeElement:null;
    setEntries(current=>[...current,{...options,id,title,tone,origin}]);return id;
  },[prefix]);
  const api=useMemo<ToastContextValue>(()=>({message:(title,options)=>add('info',title,options),success:(title,options)=>add('success',title,options),warning:(title,options)=>add('warning',title,options),error:(title,options)=>add('error',title,options),dismiss}),[add,dismiss]);
  useEffect(()=>{
    const focus=(event:KeyboardEvent)=>{if(event.key==='F8'&&region.current?.querySelector<HTMLElement>('.mk-notification')){event.preventDefault();region.current.querySelector<HTMLElement>('.mk-notification')?.focus();}};
    window.addEventListener('keydown',focus);return ()=>window.removeEventListener('keydown',focus);
  },[]);
  return <ToastContext.Provider value={api}>{children}<section ref={region} className="mk-toast-region" aria-label="Notificaciones" aria-live="polite" aria-relevant="additions text"><ol className="mk-toast-list">{entries.map(entry=><ManagedToast key={entry.id} entry={entry} dismiss={dismiss}/>)}</ol></section></ToastContext.Provider>;
}

export function useToasts(){
  const api=useContext(ToastContext);
  if(!api)throw new globalThis.Error('useToasts requires a ToastProvider.');
  return api;
}
