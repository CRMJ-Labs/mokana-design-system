import {useId,useRef,useState,type ComponentPropsWithRef,type KeyboardEvent,type PointerEvent,type ReactNode} from 'react';
import './split-container.css';

export interface SplitContainerProps extends Omit<ComponentPropsWithRef<'div'>,'children'|'onChange'> {
  /** Exactly two panels, in reading order. */
  children:[ReactNode,ReactNode];
  /** horizontal places panels side by side; vertical stacks them. */
  orientation?:'horizontal'|'vertical';
  /** Percentage of the available panel space assigned to the first panel. */
  size?:number;
  defaultSize?:number;
  minSize?:number;
  maxSize?:number;
  onSizeChange?:(size:number)=>void;
  /** Prevents resizing without disabling the contents of the panels. */
  disabled?:boolean;
  /** Stack horizontal panels below 640px and hide the resize handle. */
  stackOnMobile?:boolean;
  separatorLabel?:string;
}

const percent=(value:number,fallback:number)=>Number.isFinite(value)?Math.max(0,Math.min(100,value)):fallback;

export function SplitContainer({children,orientation='horizontal',size,defaultSize=50,minSize=20,maxSize=80,onSizeChange,disabled=false,stackOnMobile=true,separatorLabel='Tamaño del primer panel',className='',...props}:SplitContainerProps){
  const id=useId();
  const [internalSize,setInternalSize]=useState(defaultSize);
  const [dragging,setDragging]=useState(false);
  const drag=useRef<{pointerId:number;start:number;position:number;length:number;direction:number}|null>(null);
  const min=percent(minSize,20),max=Math.max(min,percent(maxSize,80));
  const clamp=(value:number)=>Math.max(min,Math.min(max,percent(value,50)));
  const value=clamp(size??internalSize);
  const horizontal=orientation==='horizontal';
  const locked=disabled||min===max;
  function update(next:number){
    const result=clamp(next);
    if(result===value)return;
    if(size===undefined)setInternalSize(result);
    onSizeChange?.(result);
  }
  function start(event:PointerEvent<HTMLDivElement>){
    if(locked||!event.isPrimary||event.button!==0)return;
    const handle=event.currentTarget,container=handle.parentElement!;
    const handleBounds=handle.getBoundingClientRect();
    const length=horizontal?container.clientWidth-handleBounds.width:container.clientHeight-handleBounds.height;
    if(length<=0)return;
    event.preventDefault();
    handle.focus();
    handle.setPointerCapture(event.pointerId);
    drag.current={pointerId:event.pointerId,start:value,position:horizontal?event.clientX:event.clientY,length,direction:horizontal&&getComputedStyle(container).direction==='rtl'?-1:1};
    setDragging(true);
  }
  function move(event:PointerEvent<HTMLDivElement>){
    const active=drag.current;
    if(!active||active.pointerId!==event.pointerId||locked)return;
    const position=horizontal?event.clientX:event.clientY;
    update(active.start+(position-active.position)/active.length*100*active.direction);
  }
  function finish(event:PointerEvent<HTMLDivElement>,cancel=false){
    const active=drag.current;
    if(!active||active.pointerId!==event.pointerId)return;
    drag.current=null;
    setDragging(false);
    if(cancel)update(active.start);
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyDown(event:KeyboardEvent<HTMLDivElement>){
    if(locked)return;
    if(event.key==='Escape'&&drag.current){
      const active=drag.current;
      drag.current=null;
      setDragging(false);
      update(active.start);
      if(event.currentTarget.hasPointerCapture(active.pointerId))event.currentTarget.releasePointerCapture(active.pointerId);
      event.preventDefault();
      return;
    }
    const rtl=horizontal&&getComputedStyle(event.currentTarget).direction==='rtl';
    const increase=horizontal?(rtl?'ArrowLeft':'ArrowRight'):'ArrowDown';
    const decrease=horizontal?(rtl?'ArrowRight':'ArrowLeft'):'ArrowUp';
    const step=event.shiftKey?10:1;
    const next=event.key==='Home'?min:event.key==='End'?max:event.key===increase?value+step:event.key===decrease?value-step:null;
    if(next===null)return;
    event.preventDefault();
    update(next);
  }
  return <div {...props} className={`mk-split-container mk-split-container-${orientation}${stackOnMobile?' mk-split-container-responsive':''}${dragging?' mk-split-container-dragging':''}${className?` ${className}`:''}`}>
    <div id={`${id}-primary`} className="mk-split-panel" tabIndex={0} style={{flexGrow:value}}>{children[0]}</div>
    <div className="mk-split-handle" role="separator" tabIndex={locked?-1:0} aria-label={separatorLabel} aria-orientation={horizontal?'vertical':'horizontal'} aria-controls={`${id}-primary`} aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value*100)/100} aria-valuetext={`${Math.round(value)}%`} aria-disabled={locked||undefined} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={event=>finish(event,true)} onLostPointerCapture={()=>{drag.current=null;setDragging(false);}} onKeyDown={keyDown}><span aria-hidden="true"/></div>
    <div className="mk-split-panel" tabIndex={0} style={{flexGrow:100-value}}>{children[1]}</div>
  </div>;
}
