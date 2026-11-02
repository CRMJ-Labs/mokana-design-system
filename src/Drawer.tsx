import {useId,useLayoutEffect,useImperativeHandle,useRef,type ComponentPropsWithRef,type ReactNode} from 'react';
import {Icon} from './components';
import './legacy-components.css';

export interface DrawerProps extends Omit<ComponentPropsWithRef<'dialog'>,'open'|'title'|'onClose'|'children'> {
  onOpenChange?:(open:boolean)=>void;
  open:boolean;
  onClose:()=>void;
  title:string;
  children:ReactNode;
  footer?:ReactNode;
  side?:'left'|'right';
}
export function Drawer({open,onClose,title,children,footer,side='right',onOpenChange,ref:externalRef,className='',onCancel,onKeyDown,onClick,...props}:DrawerProps){
  const dialog=useRef<HTMLDialogElement>(null);const close=useRef<HTMLButtonElement>(null);const id=useId();
  useImperativeHandle(externalRef,()=>dialog.current!,[]);
  const requestClose=()=>{onClose();onOpenChange?.(false);};
  useLayoutEffect(()=>{
    if(!open)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const node=dialog.current!;node.showModal();close.current?.focus();
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return ()=>{node.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[open]);
  return <dialog {...props} ref={dialog} className={`mk-drawer-dialog mk-drawer-dialog-${side} ${className}`} aria-labelledby={props['aria-labelledby']??`${id}-title`} onCancel={event=>{onCancel?.(event);if(event.defaultPrevented)return;event.preventDefault();requestClose();}} onKeyDown={event=>{
    onKeyDown?.(event);if(event.defaultPrevented)return;
    if(event.key!=='Tab')return;
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')).filter(node=>node.getClientRects().length>0&&!node.closest('[inert],[hidden]'));
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }} onClick={event=>{
    onClick?.(event);if(event.defaultPrevented)return;
    if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)requestClose();
  }}>
    <header><h2 id={`${id}-title`}>{title}</h2><button ref={close} type="button" aria-label="Cerrar panel" onClick={requestClose}><Icon name="close"/></button></header>
    <div className="mk-drawer-dialog-body">{children}</div>
    {footer&&<footer className="mk-actions">{footer}</footer>}
  </dialog>;
}
