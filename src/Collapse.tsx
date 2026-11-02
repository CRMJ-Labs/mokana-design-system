import {useId, useState, type ComponentPropsWithRef, type ReactNode} from 'react';
import {Icon} from './components';
import './collapse.css';

export interface CollapseProps extends Omit<ComponentPropsWithRef<'section'>,'title'|'children'> {
  title:string;
  children:ReactNode;
  expanded?:boolean;
  defaultExpanded?:boolean;
  disabled?:boolean;
  size?:'sm'|'md';
  onExpandedChange?:(expanded:boolean)=>void;
}

export function Collapse({title,children,expanded,defaultExpanded=false,disabled=false,size='md',onExpandedChange,className='',...props}:CollapseProps){
  const id=useId();
  const [internal,setInternal]=useState(defaultExpanded);
  const open=expanded??internal;
  function toggle(){if(expanded===undefined)setInternal(!open);onExpandedChange?.(!open);}
  return <section {...props} className={`mk-collapse mk-collapse-${size} ${className}`}>
    <h3><button type="button" id={`${id}-trigger`} disabled={disabled} aria-expanded={open} aria-controls={`${id}-panel`} onClick={toggle}>{title}<Icon name="chevron"/></button></h3>
    <div className="mk-collapse-panel" id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} aria-hidden={!open} inert={!open} data-expanded={open}>
      <div className="mk-collapse-body"><div className="mk-collapse-content">{children}</div></div>
    </div>
  </section>;
}

export interface CollapseItem {id:string;title:string;content:ReactNode;disabled?:boolean;}
export interface CollapseGroupProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {
  items:CollapseItem[];
  multiple?:boolean;
  expanded?:string[];
  defaultExpanded?:string[];
  size?:'sm'|'md';
  disabled?:boolean;
  onExpandedChange?:(expanded:string[])=>void;
}

export function CollapseGroup({items,multiple=false,expanded,defaultExpanded=[],size='md',disabled=false,onExpandedChange,className='',...props}:CollapseGroupProps){
  const [internal,setInternal]=useState(defaultExpanded);
  const available=new Set(items.map(item=>item.id));
  const requested=(expanded??internal).filter(id=>available.has(id));
  const open=multiple?requested:requested.slice(0,1);
  function update(id:string,nextOpen:boolean){
    const next=nextOpen?(multiple?[...open.filter(item=>item!==id),id]:[id]):open.filter(item=>item!==id);
    if(expanded===undefined)setInternal(next);
    onExpandedChange?.(next);
  }
  return <div {...props} className={`mk-collapse-group ${className}`}>{items.map(item=><Collapse key={item.id} title={item.title} expanded={open.includes(item.id)} disabled={disabled||item.disabled} size={size} onExpandedChange={next=>update(item.id,next)}>{item.content}</Collapse>)}</div>;
}
