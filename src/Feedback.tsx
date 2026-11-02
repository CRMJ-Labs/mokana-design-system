import {Icon} from './Icon';
import {useEffect,useId,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Button} from './components';
import {Error as ErrorMessage} from './Error';
import './structured-components.css';

export type FeedbackEmotion='negative'|'neutral'|'positive'|'delighted';
export interface FeedbackPayload {message:string;emotion:FeedbackEmotion;topic?:string;metadata:Record<string,string|number|boolean>}
export interface FeedbackProps {
  inline?:boolean;
  label?:string;
  copy?:string;
  topics?:{value:string;label:string}[];
  metadata?:Record<string,string|number|boolean>;
  prefix?:ReactNode;
  suffix?:ReactNode;
  disabled?:boolean;
  onSubmit:(feedback:FeedbackPayload)=>void|Promise<void>;
}
const emotions=[{value:'negative',label:'Insatisfecho'},{value:'neutral',label:'Neutral'},{value:'positive',label:'Satisfecho'},{value:'delighted',label:'Muy satisfecho'}] as const;

export function Feedback({inline=false,label='Feedback',copy='¿Cómo fue tu experiencia?',topics=[],metadata={},prefix,suffix,disabled=false,onSubmit}:FeedbackProps){
  const [open,setOpen]=useState(false);const [message,setMessage]=useState('');const [emotion,setEmotion]=useState<FeedbackEmotion>('neutral');
  const [topic,setTopic]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [sent,setSent]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLSpanElement>(null);const text=useRef<HTMLTextAreaElement>(null);
  const locked=useRef(false);const mounted=useRef(false);const id=useId();
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
  useLayoutEffect(()=>{
    if(!open||inline)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const node=dialog.current!;node.showModal();text.current?.focus();
    function place(){
      const anchor=trigger.current?.getBoundingClientRect();if(!anchor)return;
      const bounds=node.getBoundingClientRect();const edge=16;
      const left=Math.max(edge,Math.min(anchor.right-bounds.width,innerWidth-bounds.width-edge));
      const top=anchor.bottom+8+bounds.height<=innerHeight-edge?anchor.bottom+8:Math.max(edge,anchor.top-bounds.height-8);
      node.style.left=`${left}px`;node.style.top=`${top}px`;
    }
    place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const observer=new ResizeObserver(place);observer.observe(node);
    return ()=>{node.close();observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[open,inline]);
  useLayoutEffect(()=>{if(open&&dialog.current?.open&&!dialog.current.contains(document.activeElement))text.current?.focus();},[open,busy,error]);
  function close(){if(!locked.current)setOpen(false);}
  async function submit(){
    if(locked.current||disabled||!message.trim()||(topics.length&&!topic))return;
    locked.current=true;setBusy(true);setError('');setSent(false);
    try{
      await onSubmit({message:message.trim(),emotion,topic:topic||undefined,metadata:{...metadata}});
      if(mounted.current){setMessage('');setTopic('');setEmotion('neutral');setSent(true);setOpen(false);}
    }catch{if(mounted.current)setError('No se pudo guardar tu comentario. Vuelve a intentarlo.');}
    finally{locked.current=false;if(mounted.current)setBusy(false);}
  }
  const form=<form className="mk-feedback-form" aria-busy={busy} onSubmit={event=>{event.preventDefault();void submit();}}>
    <div className="mk-feedback-heading"><h3 id={`${id}-title`}>{copy}</h3>{!inline&&<button type="button" className="mk-feedback-close" disabled={busy} aria-label="Cerrar feedback" onClick={close}><Icon name="close" size={16}/></button>}</div>
    <fieldset className="mk-feedback-emotions" disabled={busy||disabled}><legend className="mk-sr-only">Tu valoración</legend>{emotions.map((item,index)=><label key={item.value} title={item.label}><input type="radio" name={`${id}-emotion`} value={item.value} checked={emotion===item.value} onChange={()=>setEmotion(item.value)}/><span><Icon name={(['frown','meh','smile','laugh'] as const)[index]} size={24}/><span className="mk-sr-only">{item.label}</span></span></label>)}</fieldset>
    {topics.length>0&&<label className="mk-feedback-field">Tema<select value={topic} disabled={busy||disabled} required onChange={event=>setTopic(event.target.value)}><option value="">Selecciona un tema</option>{topics.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
    <label className="mk-feedback-field" htmlFor={`${id}-message`}>Tu comentario</label><textarea ref={text} id={`${id}-message`} value={message} onChange={event=>{setMessage(event.target.value);setSent(false);}} placeholder="Tu comentario…" required maxLength={1000} readOnly={busy} disabled={disabled} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined}/>
    <div aria-live="polite">{error&&<ErrorMessage id={`${id}-error`} label={false} size="sm">{error}</ErrorMessage>}</div>
    <div className="mk-feedback-footer"><span>{message.length}/1000</span><Button type="submit" size="sm" variant="secondary" loading={busy} disabled={busy||disabled||!message.trim()||(topics.length>0&&!topic)}>{busy?'Guardando…':'Enviar comentario'}</Button></div>
    {inline&&<p className="mk-feedback-sent" role="status">{sent?'Comentario enviado':''}</p>}
  </form>;
  if(inline)return <div className="mk-feedback-inline">{form}</div>;
  return <><span ref={trigger}><Button variant="secondary" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setOpen(true);setSent(false);}}><span className="mk-feedback-trigger">{prefix&&<span aria-hidden="true">{prefix}</span>}{label}{suffix&&<span aria-hidden="true">{suffix}</span>}</span></Button></span>
    <dialog ref={dialog} className="mk-feedback-dialog" aria-labelledby={`${id}-title`} onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}}>{form}</dialog>
  </>;
}
