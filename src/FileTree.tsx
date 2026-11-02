import {Icon} from './Icon';
import {useId,useImperativeHandle,useRef,useState,type ComponentPropsWithRef,type CSSProperties,type ReactNode} from 'react';
import './structured-components.css';

export interface FileTreeNode {id:string;name:string;children?:FileTreeNode[];href?:string;icon?:ReactNode;disabled?:boolean}
export interface FileTreeProps extends Omit<ComponentPropsWithRef<'ul'>,'children'|'onSelect'> {
  items:FileTreeNode[];
  defaultExpanded?:string[];
  selectedId?:string;
  defaultSelectedId?:string;
  onSelect?:(node:FileTreeNode)=>void;
  label?:string;
}

export function FileTree({items,defaultExpanded=[],selectedId,defaultSelectedId,onSelect,label='Archivos del proyecto',className='',...props}:FileTreeProps){
  const [expanded,setExpanded]=useState(()=>new Set(defaultExpanded));const [localSelected,setLocalSelected]=useState(defaultSelectedId);
  const [focusId,setFocusId]=useState(items[0]?.id);const root=useRef<HTMLUListElement>(null);const id=useId();
  const search=useRef({text:'',time:0});
  useImperativeHandle(props.ref,()=>root.current!,[]);
  const visible:{node:FileTreeNode;parent?:string}[]=[];
  function visit(nodes:FileTreeNode[],parent?:string){for(const node of nodes){visible.push({node,parent});if(node.children&&expanded.has(node.id))visit(node.children,node.id);}}
  visit(items);
  const current=visible.some(item=>item.node.id===focusId)?focusId:visible[0]?.node.id;
  const focus=(nodeId:string|undefined)=>{if(!nodeId)return;setFocusId(nodeId);root.current?.querySelectorAll<HTMLElement>('[role=treeitem]').forEach(node=>{if(node.dataset.nodeId===nodeId)node.focus();});};
  function toggle(nodeId:string,open?:boolean){setExpanded(current=>{const next=new Set(current);if(open??!next.has(nodeId))next.add(nodeId);else next.delete(nodeId);return next;});}
  function activate(node:FileTreeNode){if(node.disabled)return;if(node.children){toggle(node.id);return;}setLocalSelected(node.id);onSelect?.(node);}
  function render(nodes:FileTreeNode[],level=1):ReactNode{
    return nodes.map((node,index)=>{
      const folder=node.children!==undefined;const isOpen=expanded.has(node.id);
      return <li role="treeitem" data-node-id={node.id} key={node.id} aria-labelledby={`${id}-${node.id}`} aria-level={level} aria-posinset={index+1} aria-setsize={nodes.length} aria-expanded={folder?isOpen:undefined} aria-selected={!folder?(selectedId??localSelected)===node.id:undefined} aria-disabled={node.disabled||undefined} tabIndex={current===node.id?0:-1} onFocus={event=>{if(event.target===event.currentTarget)setFocusId(node.id);}} onKeyDown={event=>{
        event.stopPropagation();const at=visible.findIndex(item=>item.node.id===node.id);
        if(event.key==='ArrowDown'){event.preventDefault();focus(visible[Math.min(at+1,visible.length-1)]?.node.id);}
        else if(event.key==='ArrowUp'){event.preventDefault();focus(visible[Math.max(0,at-1)]?.node.id);}
        else if(event.key==='Home'){event.preventDefault();focus(visible[0]?.node.id);}
        else if(event.key==='End'){event.preventDefault();focus(visible.at(-1)?.node.id);}
        else if(event.key==='ArrowRight'){event.preventDefault();if(folder&&!node.disabled){if(!isOpen)toggle(node.id,true);else focus(node.children?.[0]?.id);}}
        else if(event.key==='ArrowLeft'){event.preventDefault();if(folder&&isOpen)toggle(node.id,false);else focus(visible[at]?.parent);}
        else if(event.key==='Enter'||event.key===' '){event.preventDefault();if(node.href&&!node.disabled&&!folder)event.currentTarget.querySelector<HTMLAnchorElement>(':scope > .mk-file-row a')?.click();else activate(node);}
        else if(event.key.length===1&&!event.ctrlKey&&!event.altKey&&!event.metaKey){
          event.preventDefault();const now=Date.now();let text=now-search.current.time<600?search.current.text+event.key:event.key;if([...text].every(char=>char===text[0]))text=text[0];search.current={text,time:now};
          for(let offset=1;offset<=visible.length;offset++){const item=visible[(at+offset)%visible.length];if(item.node.name.toLocaleLowerCase().startsWith(text.toLocaleLowerCase())){focus(item.node.id);break;}}
        }
      }}><div className="mk-file-row" style={{'--file-depth':level-1} as CSSProperties} onClick={event=>{event.stopPropagation();focus(node.id);if(!(event.target instanceof Element&&event.target.closest('a')))activate(node);}}>
        <Icon name="chevron-right" className={`mk-file-chevron${isOpen?' is-open':''}`} size={16} style={!folder?{visibility:'hidden'}:undefined}/>
        <span className="mk-file-icon" aria-hidden="true">{node.icon??<Icon name={folder?(isOpen?'folder-open':'folder'):'file'} size={16}/>}</span>
        {node.href&&!node.disabled&&!folder?<a id={`${id}-${node.id}`} href={node.href} tabIndex={-1} title={node.name} onClick={()=>activate(node)}>{node.name}</a>:<span id={`${id}-${node.id}`} className="mk-file-name" title={node.name}>{node.name}</span>}
      </div>{folder&&isOpen&&node.children!.length>0&&<ul role="group">{render(node.children!,level+1)}</ul>}</li>;
    });
  }
  return <ul {...props} ref={root} role="tree" aria-label={label} className={`mk-file-tree ${className}`}>{render(items)}</ul>;
}
