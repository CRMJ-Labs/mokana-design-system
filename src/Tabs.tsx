import {useId,useRef,type ComponentPropsWithRef,type ReactNode} from 'react';
import './legacy-components.css';

export interface TabItem {id:string;label:string;disabled?:boolean;content?:ReactNode;panelId?:string}
export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>,'onChange'|'children'> {tabs:TabItem[];active:string;onChange?:(id:string)=>void;onValueChange?:(id:string)=>void;label?:string}
export function Tabs({tabs,active,onChange,onValueChange,label='Secciones',className='',...props}:TabsProps){
  const id=useId();const buttons=useRef(new Map<string,HTMLButtonElement>());
  const change=(next:string)=>{onChange?.(next);onValueChange?.(next);};
  const enabled=tabs.filter(tab=>!tab.disabled);
  const selected=enabled.find(tab=>tab.id===active)?.id??enabled[0]?.id;
  return <div {...props} className={`mk-tabs-root ${className}`}><div className="mk-tabs" role="tablist" aria-label={label}>{tabs.map(tab=><button key={tab.id} ref={node=>{if(node)buttons.current.set(tab.id,node);else buttons.current.delete(tab.id);}} id={`${id}-${tab.id}`} type="button" role="tab" aria-selected={selected===tab.id} aria-controls={tab.content!==undefined?(tab.panelId??`${id}-${tab.id}-panel`):tab.panelId} tabIndex={selected===tab.id?0:-1} disabled={tab.disabled} onClick={()=>change(tab.id)} onKeyDown={event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const index=enabled.findIndex(item=>item.id===tab.id);
    const next=event.key==='Home'?enabled[0]:event.key==='End'?enabled.at(-1):enabled[(index+(event.key==='ArrowRight'?1:-1)+enabled.length)%enabled.length];
    if(next){change(next.id);buttons.current.get(next.id)?.focus();}
  }}>{tab.label}</button>)}</div>{tabs.filter(tab=>tab.content!==undefined).map(tab=><div key={tab.id} id={tab.panelId??`${id}-${tab.id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab.id}`} hidden={selected!==tab.id} tabIndex={0} className="mk-tab-panel">{tab.content}</div>)}</div>;
}
