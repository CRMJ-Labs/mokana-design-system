import {Icon} from './Icon';
import {useEffect,useId,useLayoutEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type ReactNode} from 'react';
import {Button,type ButtonProps} from './components';
import './menu.css';

export interface MenuEntry {
  id:string;
  label:string;
  href?:string;
  target?:'_blank'|'_self';
  disabled?:boolean;
  locked?:boolean;
  danger?:boolean;
  prefix?:ReactNode;
  suffix?:ReactNode;
  section?:string;
  onSelect?:()=>void;
}
export interface MenuProps {
  open?:boolean;
  defaultOpen?:boolean;
  onOpenChange?:(open:boolean)=>void;
  contextArea?:ReactNode;
  items:MenuEntry[];
  label?:string;
  trigger?:ReactNode;
  chevron?:boolean;
  position?:'bottom-start'|'bottom-end'|'top-start'|'top-end'|'left-start'|'right-start';
  disabled?:boolean;
  buttonProps?:Omit<ButtonProps,'children'|'onClick'|'onKeyDown'|'aria-haspopup'|'aria-expanded'|'aria-controls'>;
}

export function Menu({items,label='Acciones',trigger,chevron=false,position='bottom-start',disabled=false,buttonProps,contextArea,open:controlledOpen,defaultOpen=false,onOpenChange}:MenuProps){
  const id=useId();
  const root=useRef<HTMLDivElement>(null);
  const contextTarget=useRef<HTMLDivElement>(null);
  const restoreTarget=useRef<HTMLElement|null>(null);
  const touch=useRef<{timer:ReturnType<typeof setTimeout>;x:number;y:number}|null>(null);
  const [point,setPoint]=useState<{x:number;y:number}|null>(null);
  const panel=useRef<HTMLDivElement>(null);
  const initialFocus=useRef<'first'|'last'>('first');
  const search=useRef({text:'',time:0});
  const [localOpen,setLocalOpen]=useState(defaultOpen);
  const open=controlledOpen??localOpen;
  function setOpen(next:boolean){if(controlledOpen===undefined)setLocalOpen(next);if(next!==open)onOpenChange?.(next);}
  const [style,setStyle]=useState<CSSProperties>({visibility:'hidden'});
  const triggerButton=()=>root.current?.querySelector<HTMLButtonElement>(':scope > button');
  const enabled=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')??[]);
  function close(restore=true){setOpen(false);search.current={text:'',time:0};if(restore)(restoreTarget.current??triggerButton())?.focus();}
  function show(last=false){setPoint(null);restoreTarget.current=triggerButton()??null;initialFocus.current=last?'last':'first';setOpen(true);}
  function showContext(x:number,y:number){if(disabled)return;restoreTarget.current=contextTarget.current;initialFocus.current='first';setPoint({x,y});setOpen(true);}
  function cancelTouch(){if(touch.current)clearTimeout(touch.current.timer);touch.current=null;}
  useEffect(()=>cancelTouch,[]);

  useLayoutEffect(()=>{
    if(!open)return;
    function place(){
      const anchor=triggerButton()?.getBoundingClientRect();const popup=panel.current;
      if(!anchor||!popup)return;
      const gap=8;const edge=8;
      popup.style.maxHeight=`${Math.max(0,innerHeight-edge*2)}px`;
      const {width,height}=popup.getBoundingClientRect();
      let left=position.endsWith('end')?anchor.right-width:anchor.left;
      let top=anchor.bottom+gap;
      if(position.startsWith('top')){top=anchor.top-height-gap;if(top<edge)top=anchor.bottom+gap;}
      else if(position.startsWith('left')||position.startsWith('right')){
        top=anchor.top;
        left=position.startsWith('left')?anchor.left-width-gap:anchor.right+gap;
        if(left<edge)left=anchor.right+gap;
        if(left+width>innerWidth-edge)left=anchor.left-width-gap;
      }else if(top+height>innerHeight-edge)top=anchor.top-height-gap;
      if(point){left=point.x;top=point.y;if(left+width>innerWidth-edge)left-=width;if(top+height>innerHeight-edge)top-=height;}
      left=Math.max(edge,Math.min(left,innerWidth-width-edge));
      top=Math.max(edge,Math.min(top,innerHeight-height-edge));
      // Make the panel focusable before the layout effect moves keyboard focus.
      Object.assign(popup.style,{left:`${left}px`,top:`${top}px`,visibility:'visible'});
      setStyle({left,top,maxHeight:innerHeight-edge*2,visibility:'visible'});
    }
    place();
    const options=enabled();(initialFocus.current==='last'?options.at(-1):options[0])?.focus();
    if(!options.length)panel.current?.focus();
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const observer=new ResizeObserver(place);if(panel.current)observer.observe(panel.current);
    return ()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);observer.disconnect();};
  },[open,position,point]);

  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))close(false);};
    const blur=(event:FocusEvent)=>{if(!root.current?.contains(event.target as Node))close(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',blur);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',blur);};
  },[open]);
  useEffect(()=>{if(disabled)setOpen(false);},[disabled]);

  function navigate(event:KeyboardEvent){
    const options=enabled();const index=options.indexOf(document.activeElement as HTMLElement);
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
    if(event.key==='Tab'){close();return;}
    let next:number|undefined;
    if(event.key==='ArrowDown')next=(index+1)%options.length;
    if(event.key==='ArrowUp')next=(index-1+options.length)%options.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=options.length-1;
    if(next!==undefined){event.preventDefault();options[next]?.focus();return;}
    if(event.key===' '&&event.target instanceof HTMLAnchorElement){event.preventDefault();event.target.click();return;}
    if(event.key.length===1&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&event.key!==' '){
      event.preventDefault();
      const now=Date.now();let text=now-search.current.time<600?search.current.text+event.key:event.key;
      if([...text].every(char=>char===text[0]))text=text[0];
      search.current={text,time:now};
      const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
      for(let offset=1;offset<=options.length;offset++){
        const option=options[(index+offset)%options.length];
        if(normalize(option.dataset.label??'').startsWith(normalize(text))){option.focus();break;}
      }
    }
  }
  return <div ref={root} className={`mk-menu${contextArea?' mk-context-menu':''}`}>
    {contextArea&&<div ref={contextTarget} className="mk-context-target" tabIndex={0} role="group" aria-label={label} aria-haspopup="menu" aria-expanded={open&&!!point} aria-controls={open&&point?id:undefined}
      onContextMenu={event=>{if(disabled)return;event.preventDefault();cancelTouch();showContext(event.clientX,event.clientY);}}
      onKeyDown={event=>{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){event.preventDefault();const rect=event.currentTarget.getBoundingClientRect();showContext(rect.left+16,rect.top+16);}}}
      onPointerDown={event=>{if(event.pointerType!=='touch'||disabled)return;cancelTouch();const {clientX:x,clientY:y}=event;touch.current={x,y,timer:setTimeout(()=>{showContext(x,y);touch.current=null;},550)};}}
      onPointerMove={event=>{if(touch.current&&Math.hypot(event.clientX-touch.current.x,event.clientY-touch.current.y)>10)cancelTouch();}}
      onPointerUp={cancelTouch} onPointerCancel={cancelTouch}>{contextArea}</div>}
    <Button {...buttonProps} variant={buttonProps?.variant??'secondary'} disabled={disabled||buttonProps?.disabled} className={`${trigger?'mk-menu-custom-trigger ':''}${buttonProps?.className??''}`} aria-label={trigger?label:buttonProps?.['aria-label']} aria-haspopup="menu" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>open?close():show()} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();show(event.key==='ArrowUp');}if(event.key==='Escape'&&open){event.preventDefault();close();}}}>
      {trigger??label}{chevron&&<Icon name="chevron-down" className="mk-menu-chevron" size={16}/>}
    </Button>
    {open&&<div ref={panel} id={id} role="menu" aria-label={label} tabIndex={-1} className="mk-menu-panel" style={style} onKeyDown={navigate}>
      {items.map((item,index)=>{
        const inert=item.disabled||item.locked;
        const content=<>{item.prefix&&<span aria-hidden="true" className="mk-menu-prefix">{item.prefix}</span>}<span className="mk-menu-label">{item.label}</span>{item.locked?<Icon name="lock" className="mk-menu-lock" size={16}/>:item.suffix&&<span className="mk-menu-suffix" aria-hidden="true">{item.suffix}</span>}</>;
        const props={role:'menuitem',tabIndex:-1,'aria-disabled':inert||undefined,'aria-description':item.locked?'Requiere permisos adicionales':undefined,'data-label':item.label,className:`mk-menu-item${item.danger?' mk-menu-danger':''}`,onClick:()=>{if(inert)return;close();item.onSelect?.();}};
        return <div role="none" key={item.id}>{item.section!==items[index-1]?.section&&index>0&&<div role="separator" className="mk-menu-separator"/>}{item.section&&item.section!==items[index-1]?.section&&<div role="presentation" className="mk-menu-section">{item.section}</div>}{item.href&&!inert?<a {...props} href={item.href} target={item.target} rel={item.target==='_blank'?'noreferrer':undefined}>{content}</a>:<button {...props} type="button" disabled={inert}>{content}</button>}</div>;
      })}
    </div>}
  </div>;
}
