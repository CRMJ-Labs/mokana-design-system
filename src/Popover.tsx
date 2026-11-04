import {Children,Fragment,cloneElement,isValidElement,useEffect,useId,useImperativeHandle,useLayoutEffect,useRef,useState,type ComponentPropsWithRef,type MouseEvent,type KeyboardEvent,type ReactNode} from 'react';
import {Button,Icon} from './components';
import './popover.css';

export interface PopoverProps extends Omit<ComponentPropsWithRef<'span'>,'title'> {
  /** Text/content or one control that forwards ARIA attributes and events. */
  trigger:ReactNode;
  children:ReactNode;
  title?:string;
  /** Accessible panel name when no visible title is provided. */
  label?:string;
  open?:boolean;
  defaultOpen?:boolean;
  onOpenChange?:(open:boolean)=>void;
}

export function Popover({trigger,children,title,label='Información adicional',open:controlled,defaultOpen=false,onOpenChange,className='',ref:externalRef,onKeyDown,...props}:PopoverProps){
  const [localOpen,setLocalOpen]=useState(defaultOpen);
  const open=controlled??localOpen;
  const root=useRef<HTMLSpanElement>(null),panel=useRef<HTMLDivElement>(null);
  const restoreFocus=useRef(true);
  const id=useId();
  useImperativeHandle(externalRef,()=>root.current!,[]);
  const triggerNode=()=>root.current?.firstElementChild instanceof HTMLElement?root.current.firstElementChild:null;
  function change(next:boolean,restore=true){
    if(next===open)return;
    restoreFocus.current=restore;
    if(controlled===undefined)setLocalOpen(next);
    onOpenChange?.(next);
    if(!next&&restore)triggerNode()?.focus({preventScroll:true});
  }

  useLayoutEffect(()=>{
    if(!open)return;
    const node=panel.current!,anchor=triggerNode();
    restoreFocus.current=true;
    function place(){
      if(!anchor)return;
      const rect=anchor.getBoundingClientRect(),edge=8,gap=8;
      node.style.maxHeight=`${Math.max(0,innerHeight-edge*2)}px`;
      const {width,height}=node.getBoundingClientRect();
      let top=rect.bottom+gap;
      if(top+height>innerHeight-edge)top=rect.top-height-gap;
      Object.assign(node.style,{left:`${Math.max(edge,Math.min(rect.left,innerWidth-width-edge))}px`,top:`${Math.max(edge,Math.min(top,innerHeight-height-edge))}px`,visibility:'visible'});
    }
    place();node.focus({preventScroll:true});
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const observer=new ResizeObserver(place);observer.observe(node);
    return ()=>{
      window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);observer.disconnect();
      // Removing a focused panel moves focus to body before layout cleanup.
      if(restoreFocus.current&&(node.contains(document.activeElement)||document.activeElement===document.body)&&anchor?.isConnected)anchor.focus({preventScroll:true});
    };
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:Event)=>{if(!root.current?.contains(event.target as Node))change(false,false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);};
  },[open,onOpenChange,controlled]);

  type TriggerProps=ComponentPropsWithRef<'button'>;
  let resolvedTrigger=trigger;
  while(isValidElement<{children?:ReactNode}>(resolvedTrigger)&&resolvedTrigger.type===Fragment){
    const children=Children.toArray(resolvedTrigger.props.children);
    if(children.length!==1)break;
    resolvedTrigger=children[0];
  }
  const childProps=isValidElement<TriggerProps>(resolvedTrigger)&&resolvedTrigger.type!==Fragment?resolvedTrigger.props:null;
  const triggerProps={
    'aria-haspopup':'dialog' as const,'aria-expanded':open,'aria-controls':open?id:undefined,
    onClick:(event:MouseEvent<HTMLButtonElement>)=>{
      childProps?.onClick?.(event);
      if(event.defaultPrevented||childProps?.disabled||childProps?.['aria-disabled']===true||childProps?.['aria-disabled']==='true')return;
      event.preventDefault();change(!open);
    },
    onKeyDown:(event:KeyboardEvent<HTMLButtonElement>)=>{
      childProps?.onKeyDown?.(event);if(event.defaultPrevented)return;
      const nativeButton=event.currentTarget instanceof HTMLButtonElement;
      const nativeLink=event.currentTarget instanceof HTMLAnchorElement&&event.currentTarget.hasAttribute('href');
      if(!nativeButton&&(event.key===' '||event.key==='Enter'&&!nativeLink)){event.preventDefault();event.currentTarget.click();}
    },
  };
  const control=isValidElement<TriggerProps>(resolvedTrigger)&&resolvedTrigger.type!==Fragment?cloneElement(resolvedTrigger,{
    ...triggerProps,role:childProps?.role??'button',tabIndex:childProps?.tabIndex??0,
    className:`mk-popover-trigger ${childProps?.className??''}`,
    ...(resolvedTrigger.type==='button'||resolvedTrigger.type===Button?{type:childProps?.type??'button'}:{}),
  }):<Button {...triggerProps} className="mk-popover-trigger">{resolvedTrigger??'Más información'}</Button>;
  return <span {...props} ref={root} className={`mk-popover ${className}`} onKeyDown={event=>{
    onKeyDown?.(event);
    if(event.key==='Escape'&&open&&!event.defaultPrevented){event.preventDefault();event.stopPropagation();change(false);}
  }}>
    {control}
    {open&&<div ref={panel} id={id} role="dialog" aria-labelledby={title?`${id}-title`:undefined} aria-label={title?undefined:label} tabIndex={-1} className="mk-popover-panel">
      <div className="mk-popover-heading">{title&&<strong id={`${id}-title`}>{title}</strong>}<button type="button" className="mk-popover-close" aria-label="Cerrar" onClick={()=>change(false)}><Icon name="close"/></button></div>
      {children}
    </div>}
  </span>;
}
