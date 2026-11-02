import {Icon} from './Icon';
import {useEffect,useId,useLayoutEffect,useRef,useState,type KeyboardEvent,type ReactNode} from 'react';
import {Checkbox} from './Checkbox';
import './multi-select.css';

export interface MultiSelectOption {
  value:string;
  label:string;
  disabled?:boolean;
}
export interface MultiSelectProps {
  /** Stable accessible name of the trigger, also used by the panel. */
  label:string;
  hideLabel?:boolean;
  options:MultiSelectOption[];
  value?:string[];
  defaultValue?:string[];
  onChange?:(value:string[])=>void;
  placeholder?:string;
  summary?:(selected:MultiSelectOption[],options:MultiSelectOption[])=>ReactNode;
  emptyMessage?:string;
  position?:'bottom-start'|'bottom-end'|'top-start'|'top-end';
  disabled?:boolean;
  id?:string;
  className?:string;
}

const hints={check:'Marcar',uncheck:'Desmarcar',all:'Marcar todos',only:'Solo'};

export function MultiSelect({label,hideLabel=false,options,value,defaultValue=[],onChange,placeholder='Sin selección',summary,emptyMessage='No hay opciones disponibles.',position='bottom-start',disabled=false,id:givenId,className=''}:MultiSelectProps){
  const generated=useId();const id=givenId??generated;
  const trigger=useRef<HTMLButtonElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const initialFocus=useRef<'first'|'last'>('first');
  const [open,setOpen]=useState(false);
  const [internal,setInternal]=useState(defaultValue);
  const current=new Set(value??internal);
  const selected=options.filter(option=>current.has(option.value));
  const enabled=options.filter(option=>!option.disabled);
  const chosen=enabled.filter(option=>current.has(option.value)).length;
  const locked=selected.filter(option=>option.disabled).map(option=>option.value);
  function commit(next:string[]){
    const set=new Set(next);const result=options.filter(option=>set.has(option.value)).map(option=>option.value);
    if(value===undefined)setInternal(result);
    onChange?.(result);
  }
  function close(restore=true){setOpen(false);if(restore)trigger.current?.focus();}
  function show(last=false){initialFocus.current=last?'last':'first';setOpen(true);}
  function toggle(option:MultiSelectOption,checked:boolean){commit(checked?[...current,option.value]:[...current].filter(item=>item!==option.value));}
  function actionFor(option:MultiSelectOption):keyof typeof hints{
    const checked=current.has(option.value);
    if(enabled.length<2)return checked?'uncheck':'check';
    return checked&&chosen<enabled.length?'all':'only';
  }
  function runAction(option:MultiSelectOption){
    const action=actionFor(option);
    if(action==='all')commit([...locked,...enabled.map(item=>item.value)]);
    else if(action==='only')commit([...locked,option.value]);
    else toggle(option,action==='check');
  }

  useLayoutEffect(()=>{
    if(!open)return;
    function place(){
      const anchor=trigger.current?.getBoundingClientRect();const popup=panel.current;
      if(!anchor||!popup)return;
      const gap=8;const edge=8;
      popup.style.minWidth=`${Math.min(anchor.width,innerWidth-edge*2)}px`;
      popup.style.maxHeight=`${Math.min(320,innerHeight-edge*2)}px`;
      const {width,height}=popup.getBoundingClientRect();
      let left=position.endsWith('end')?anchor.right-width:anchor.left;
      let top=position.startsWith('top')?anchor.top-height-gap:anchor.bottom+gap;
      if(position.startsWith('top')&&top<edge)top=anchor.bottom+gap;
      else if(position.startsWith('bottom')&&top+height>innerHeight-edge)top=anchor.top-height-gap;
      left=Math.max(edge,Math.min(left,innerWidth-width-edge));
      top=Math.max(edge,Math.min(top,innerHeight-height-edge));
      Object.assign(popup.style,{left:`${left}px`,top:`${top}px`,visibility:'visible'});
    }
    place();
    const inputs=Array.from(panel.current?.querySelectorAll<HTMLInputElement>('input:not(:disabled)')??[]);
    (initialFocus.current==='last'?inputs.at(-1):inputs[0])?.focus();
    if(!inputs.length)panel.current?.focus();
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const observer=new ResizeObserver(place);if(panel.current)observer.observe(panel.current);
    return ()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);observer.disconnect();};
  },[open,position]);

  useEffect(()=>{
    if(!open)return;
    const outside=(event:Event)=>{const target=event.target as Node;if(!panel.current?.contains(target)&&!trigger.current?.contains(target))close(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);};
  },[open]);
  useEffect(()=>{if(disabled)setOpen(false);},[disabled]);

  function navigate(event:KeyboardEvent){
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
    // Focus returns to the trigger first, so the native Tab continues from its place in the page.
    if(event.key==='Tab'){close();return;}
    const active=document.activeElement as HTMLElement;
    if(event.key==='Enter'&&active instanceof HTMLInputElement){event.preventDefault();active.click();return;}
    const rows=Array.from(panel.current?.querySelectorAll<HTMLElement>('[data-multi-select-row]:not([data-disabled])')??[]);
    if(!rows.length)return;
    const index=rows.findIndex(row=>row.contains(active));
    const cell=(row:HTMLElement,action:boolean)=>row.querySelector<HTMLElement>(action?'button':'input');
    const onAction=active instanceof HTMLButtonElement;
    let next:HTMLElement|null|undefined;
    if(event.key==='ArrowDown')next=cell(rows[(index+1)%rows.length],onAction);
    if(event.key==='ArrowUp')next=cell(rows[(index-1+rows.length)%rows.length],onAction);
    if(event.key==='Home')next=cell(rows[0],onAction);
    if(event.key==='End')next=cell(rows[rows.length-1],onAction);
    if(index>=0&&event.key==='ArrowRight')next=cell(rows[index],true);
    if(index>=0&&event.key==='ArrowLeft')next=cell(rows[index],false);
    if(next){event.preventDefault();next.focus();}
  }

  const display=summary?summary(selected,options):!selected.length?placeholder:options.length>1&&selected.length===options.length?'Todos seleccionados':selected.length===1?selected[0].label:`${selected.length} seleccionados`;
  return <div className={`mk-multi-select ${className}`}>
    <span id={`${id}-label`} className={hideLabel?'mk-sr-only':'mk-multi-select-label'}>{label}</span>
    <button ref={trigger} id={id} type="button" className="mk-multi-select-trigger" disabled={disabled} aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?`${id}-panel`:undefined} onClick={()=>open?close():show()} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();show(event.key==='ArrowUp');}}}>
      <span id={`${id}-value`} className="mk-multi-select-value">{display}</span>
      <Icon name="chevron-down" className="mk-multi-select-chevron" size={16}/>
    </button>
    {open&&<div ref={panel} id={`${id}-panel`} role="dialog" aria-label={label} tabIndex={-1} className="mk-multi-select-panel" onKeyDown={navigate}>
      {options.length?<ul>{options.map(option=>{
        const checked=current.has(option.value);const hint=hints[actionFor(option)];
        return <li key={option.value} className="mk-multi-select-row" data-multi-select-row data-disabled={option.disabled||undefined}>
          <Checkbox className="mk-multi-select-check" label={option.label} checked={checked} disabled={option.disabled} tabIndex={-1} onChange={next=>toggle(option,next)}/>
          <button type="button" className="mk-multi-select-action" tabIndex={-1} disabled={option.disabled} aria-label={option.disabled?option.label:`${option.label}. ${hint}`} onClick={()=>runAction(option)}>
            <span className="mk-multi-select-name">{option.label}</span>
            {!option.disabled&&<span className="mk-multi-select-hint" aria-hidden="true"><span>{hint}</span><span>{checked?hints.uncheck:hints.check}</span></span>}
          </button>
        </li>;
      })}</ul>:<p role="status" className="mk-multi-select-empty">{emptyMessage}</p>}
    </div>}
  </div>;
}
