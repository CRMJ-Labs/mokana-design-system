import {useLayoutEffect,useId,useRef,useState,type ReactNode} from 'react';
import {Button,Icon} from './components';
import {DestructiveConfirmationInput} from './DestructiveConfirmationInput';
import './destructive.css';

export interface DestructiveActionModalProps {
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  title:string;
  description:ReactNode;
  verificationPhrase:string;
  verificationLabel?:string;
  confirmLabel:string;
  cancelLabel?:string;
  irreversibleDescription?:ReactNode;
  loading?:boolean;
  error?:string|globalThis.Error;
  onConfirm:()=>void;
}

export function DestructiveActionModal({open,onOpenChange,title,description,verificationPhrase,verificationLabel,confirmLabel,cancelLabel='Cancelar',irreversibleDescription,loading=false,error,onConfirm}:DestructiveActionModalProps){
  const [value,setValue]=useState('');const dialog=useRef<HTMLDialogElement>(null);
  const input=useRef<HTMLInputElement>(null);const id=useId();
  const canConfirm=verificationPhrase.length>0&&value===verificationPhrase&&!loading;
  useLayoutEffect(()=>{
    if(!open)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    setValue('');const node=dialog.current!;node.showModal();input.current?.focus();
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return ()=>{node.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[open,verificationPhrase]);
  useLayoutEffect(()=>{
    // Disabling a focused submit button can send focus to the document body.
    if(open&&dialog.current?.open&&!dialog.current.contains(document.activeElement))input.current?.focus();
  },[open,loading,error]);
  function cancel(){if(!loading)onOpenChange(false);}
  return <dialog ref={dialog} className="mk-destructive-modal" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} aria-busy={loading} onCancel={event=>{event.preventDefault();cancel();}} onClick={event=>{if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)cancel();}}>
    <form onSubmit={event=>{event.preventDefault();if(canConfirm)onConfirm();}}>
      <div className="mk-destructive-modal-body"><h2 id={`${id}-title`}>{title}</h2><div id={`${id}-description`} className="mk-destructive-description">{description}</div>
        <DestructiveConfirmationInput ref={input} verificationPhrase={verificationPhrase} verificationLabel={verificationLabel} value={value} onChange={event=>setValue(event.target.value)} readOnly={loading} error={error}/>
      </div>
      <footer className="mk-destructive-modal-actions"><Button variant="secondary" disabled={loading} onClick={cancel}>{cancelLabel}</Button><Button type="submit" variant="danger" disabled={!canConfirm} loading={loading}>{confirmLabel}</Button></footer>
      {irreversibleDescription!=null&&<div className="mk-destructive-band"><Icon name="warning"/><span>{irreversibleDescription}</span></div>}
    </form>
  </dialog>;
}
