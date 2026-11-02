import {useEffect,useId,useLayoutEffect,useRef,useState,type ReactElement,type ReactNode} from 'react';
import './interaction-components.css';

export interface ContextCardTriggerProps {
  'aria-expanded':boolean;
  'aria-controls':string|undefined;
}
export interface ContextCardProps {
  trigger:ReactNode;
  children:ReactNode;
  label:string;
  side?:'top'|'bottom'|'left'|'right';
  align?:'start'|'center'|'end';
  render?:(props:ContextCardTriggerProps)=>ReactElement;
}

export function ContextCard({trigger,children,label,side='top',align='center',render}:ContextCardProps){
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLSpanElement>(null);const panel=useRef<HTMLDivElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const hovered=useRef(false);const focused=useRef(false);const dismissed=useRef(false);
  const id=useId();
  const cancel=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;};
  const show=()=>{cancel();if(!dismissed.current)timer.current=setTimeout(()=>setOpen(true),150);};
  const hide=()=>{cancel();timer.current=setTimeout(()=>{if(!hovered.current&&!focused.current){setOpen(false);dismissed.current=false;}},150);};
  useEffect(()=>cancel,[]);
  useLayoutEffect(()=>{
    if(!open)return;
    function place(){
      const anchor=root.current?.firstElementChild?.getBoundingClientRect();const node=panel.current;if(!anchor||!node)return;
      const edge=8,gap=8;node.style.maxHeight=`${innerHeight-edge*2}px`;
      const {width,height}=node.getBoundingClientRect();
      let x=align==='start'?anchor.left:align==='end'?anchor.right-width:anchor.left+(anchor.width-width)/2;
      let y=side==='top'?anchor.top-height-gap:anchor.bottom+gap;
      if(side==='left'||side==='right'){
        x=side==='left'?anchor.left-width-gap:anchor.right+gap;
        y=align==='start'?anchor.top:align==='end'?anchor.bottom-height:anchor.top+(anchor.height-height)/2;
        if(x<edge)x=anchor.right+gap;if(x+width>innerWidth-edge)x=anchor.left-width-gap;
      }else{if(y<edge)y=anchor.bottom+gap;else if(y+height>innerHeight-edge)y=anchor.top-height-gap;}
      Object.assign(node.style,{left:`${Math.max(edge,Math.min(x,innerWidth-width-edge))}px`,top:`${Math.max(edge,Math.min(y,innerHeight-height-edge))}px`,visibility:'visible'});
    }
    place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const observer=new ResizeObserver(place);if(panel.current)observer.observe(panel.current);
    return ()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);observer.disconnect();};
  },[open,side,align]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){cancel();setOpen(false);dismissed.current=false;}};
    document.addEventListener('pointerdown',outside);return ()=>document.removeEventListener('pointerdown',outside);
  },[open]);
  const props:ContextCardTriggerProps={'aria-expanded':open,'aria-controls':open?id:undefined};
  return <span ref={root} className="mk-context-card" onMouseEnter={()=>{hovered.current=true;show();}} onMouseLeave={()=>{hovered.current=false;hide();}} onFocusCapture={()=>{focused.current=true;cancel();if(!dismissed.current)setOpen(true);}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null)){focused.current=false;dismissed.current=false;hide();}}} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();cancel();dismissed.current=true;setOpen(false);(root.current?.firstElementChild as HTMLElement)?.focus();}}}>
    {render?render(props):<button type="button" className="mk-context-card-trigger" {...props} onClick={()=>{dismissed.current=false;setOpen(true);}}>{trigger}</button>}
    {open&&<div ref={panel} id={id} role="region" aria-label={label} className="mk-context-card-panel" style={{visibility:'hidden'}}>{children}</div>}
  </span>;
}
