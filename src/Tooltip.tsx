import {cloneElement,isValidElement,useEffect,useId,useRef,useState,type ComponentPropsWithRef,type ReactNode} from 'react';
import './tooltip.css';
export interface TooltipProps extends Omit<ComponentPropsWithRef<'span'>,'content'> {content:string;children:ReactNode;placement?:'top'|'bottom'|'left'|'right'}
export function Tooltip({content,children,placement='top',className='',onMouseEnter,onMouseLeave,onFocusCapture,onBlurCapture,onKeyDown,...props}:TooltipProps){
  const id=useId();const [open,setOpen]=useState(false);
  const focused=useRef(false),hovered=useRef(false),dismissed=useRef(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const cancel=()=>{if(timer.current!==null)clearTimeout(timer.current);timer.current=null;};
  const show=()=>{cancel();if(!dismissed.current)setOpen(true);};
  const leave=()=>{cancel();timer.current=setTimeout(()=>{if(!focused.current&&!hovered.current){setOpen(false);dismissed.current=false;}},150);};
  const dismiss=()=>{cancel();dismissed.current=true;setOpen(false);};
  useEffect(()=>cancel,[]);
  useEffect(()=>{
    if(!open)return;
    // Hover does not move focus, so Escape must also work from another control.
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();event.stopPropagation();dismiss();}};
    document.addEventListener('keydown',escape);
    return ()=>document.removeEventListener('keydown',escape);
  },[open]);
  const child=isValidElement<{'aria-describedby'?:string}>(children)?cloneElement(children,{'aria-describedby':[children.props['aria-describedby'],id].filter(Boolean).join(' ')}):children;
  return <span {...props} className={`mk-tooltip mk-tooltip-${placement} ${className}`} tabIndex={props.tabIndex??(isValidElement(children)?undefined:0)} onMouseEnter={event=>{onMouseEnter?.(event);if(event.defaultPrevented)return;hovered.current=true;show();}} onMouseLeave={event=>{onMouseLeave?.(event);if(event.defaultPrevented)return;hovered.current=false;leave();}} onFocusCapture={event=>{onFocusCapture?.(event);if(event.defaultPrevented)return;focused.current=true;show();}} onBlurCapture={event=>{onBlurCapture?.(event);if(!event.defaultPrevented&&!event.currentTarget.contains(event.relatedTarget as Node|null)){focused.current=false;leave();}}} onKeyDown={event=>{onKeyDown?.(event);if(!event.defaultPrevented&&event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();dismiss();}}}>{child}<span id={id} role="tooltip" hidden={!open}>{content}</span></span>;
}
