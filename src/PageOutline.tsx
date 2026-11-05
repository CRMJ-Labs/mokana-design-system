import {useEffect,useId,useRef,useState,type MouseEvent,type RefObject} from 'react';
import {Icon} from './Icon';
import './page-outline.css';

type Entry={id:string;label:string;level:2|3};
const signature=(entries:Entry[])=>JSON.stringify(entries);

/** Documentation navigation, derived from the sections actually rendered. */
export function PageOutline({content}:{content:RefObject<HTMLDivElement|null>}){
  const [entries,setEntries]=useState<Entry[]>([]),[active,setActive]=useState(''),[open,setOpen]=useState(false);
  const panelId=useId(),panel=useRef<HTMLDivElement>(null),toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const root=content.current;if(!root)return;
    let headings:{entry:Entry;target:HTMLElement}[]=[],refreshFrame=0,scrollFrame=0;
    let pendingHash=location.hash;
    function updateActive(){
      scrollFrame=0;
      if(!headings.length)return;
      const offset=matchMedia('(min-width:1200px)').matches?112:132;
      let current=headings[0].entry.id;
      for(const {entry,target}of headings){if(target.getBoundingClientRect().top<=offset)current=entry.id;else break;}
      if(window.scrollY+innerHeight>=document.documentElement.scrollHeight-2)current=headings.at(-1)!.entry.id;
      setActive(previous=>previous===current?previous:current);
    }
    const scheduleScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateActive);};
    function refresh(){
      refreshFrame=0;
      const labels=new Map<string,string>();
      for(const node of root!.querySelectorAll<HTMLElement>('[data-page-sections]')){
        const sections=JSON.parse(node.dataset.pageSections??'[]') as [string,string][];
        for(const [id,label]of sections)labels.set(id,label);
      }
      const seen=new Set<string>();
      headings=[...root!.querySelectorAll<HTMLElement>('h2,h3')].flatMap(heading=>{
        // Preview content, popup menus and example cards are not documentation sections.
        if(heading.closest('[class*="-preview"],[class*="-demo"],dialog,[role=dialog],.mk-table,.mk-code-block'))return [];
        const label=heading.textContent?.trim();if(!label)return [];
        const section=heading.closest<HTMLElement>('section');
        const target=heading.id?heading:section?.id&&section.querySelector('h2,h3')===heading?section:heading;
        if(!target.id){
          const base=`section-${label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'content'}`;
          let id=base,index=2;while(document.getElementById(id))id=`${base}-${index++}`;
          target.id=id;
        }
        if(seen.has(target.id))return [];seen.add(target.id);
        return [{entry:{id:target.id,label:labels.get(target.id)??label,level:heading.tagName==='H3'?3:2} as Entry,target}];
      });
      const next=headings.map(({entry})=>entry);
      setEntries(previous=>signature(previous)===signature(next)?previous:next);
      if(pendingHash){
        let target:HTMLElement|null=null;
        try{target=document.getElementById(decodeURIComponent(pendingHash.slice(1)));}catch{pendingHash='';}
        if(target&&root!.contains(target)){pendingHash='';target.scrollIntoView({block:'start',behavior:'instant'});}
      }
      updateActive();
    }
    const observer=new MutationObserver(()=>{if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh);});
    observer.observe(root,{childList:true,subtree:true,characterData:true});
    const resize=new ResizeObserver(scheduleScroll);resize.observe(root);
    refresh();
    window.addEventListener('scroll',scheduleScroll,{passive:true});window.addEventListener('resize',scheduleScroll);window.addEventListener('hashchange',scheduleScroll);
    return ()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(refreshFrame);cancelAnimationFrame(scrollFrame);window.removeEventListener('scroll',scheduleScroll);window.removeEventListener('resize',scheduleScroll);window.removeEventListener('hashchange',scheduleScroll);};
  },[content]);
  useEffect(()=>{
    const list=panel.current,item=list?.querySelector<HTMLElement>('[aria-current=location]');
    if(!list||!item||!matchMedia('(min-width:1200px)').matches)return;
    const bounds=list.getBoundingClientRect(),row=item.getBoundingClientRect();
    if(row.top<bounds.top)list.scrollTop+=row.top-bounds.top-8;
    else if(row.bottom>bounds.bottom)list.scrollTop+=row.bottom-bounds.bottom+8;
  },[active]);
  function navigate(event:MouseEvent<HTMLAnchorElement>,entry:Entry){
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const target=document.getElementById(entry.id);if(!target)return;
    setActive(entry.id);setOpen(false);
    // Leave fragment history to the browser and move keyboard focus to the section.
    if(!target.hasAttribute('tabindex'))target.tabIndex=-1;
    requestAnimationFrame(()=>{target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true});});
  }
  if(!entries.length)return null;
  return <nav className="mk-page-outline" aria-label="En esta página" data-open={open||undefined} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();setOpen(false);toggle.current?.focus();}}}>
    <p className="mk-page-outline-title"><Icon name="menu" size={14}/>En esta página</p>
    <button ref={toggle} type="button" className="mk-page-outline-toggle" aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(value=>!value)}><span><Icon name="menu" size={14}/>En esta página</span><Icon name="chevron-down" size={14}/></button>
    <div ref={panel} id={panelId} className="mk-page-outline-links"><ul>{entries.map(entry=><li key={entry.id} data-level={entry.level}><a href={`#${entry.id}`} aria-current={active===entry.id?'location':undefined} onClick={event=>navigate(event,entry)}>{entry.label}</a></li>)}</ul></div>
  </nav>;
}
