import {Children,useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type ComponentPropsWithRef,type CSSProperties,type KeyboardEvent,type ReactNode} from 'react';
import {Button,Icon,type ButtonVariant} from './components';
import {ContextCard} from './ContextCard';
import {Input,type InputProps} from './Input';
import {Menu,type MenuEntry} from './Menu';
import {Separator} from './Separator';
import {Spinner} from './StatusComponents';
import './control-components.css';

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const percent=(value:number,min:number,max:number)=>max===min?0:(clamp(value,min,max)-min)/(max-min)*100;

export interface SliderProps extends Omit<ComponentPropsWithRef<'input'>,'value'|'defaultValue'|'onChange'|'type'|'min'|'max'|'step'> {
  label?:string;
  value?:number;
  defaultValue?:number;
  min?:number;
  max?:number;
  step?:number;
  unit?:string;
  showValue?:boolean;
  onChange?:(value:number)=>void;
  /** Runs when the drag or key press ends. */
  onCommit?:(value:number)=>void;
}
export function Slider({label,value,defaultValue,min=0,max=100,step=1,unit='',showValue=true,onChange,onCommit,disabled,id:givenId,className='',style,...props}:SliderProps){
  const generated=useId();const id=givenId??generated;
  const [internal,setInternal]=useState(defaultValue??min);
  const current=value??internal;
  return <div className={`mk-slider${disabled?' is-disabled':''}${className?` ${className}`:''}`} style={{...style,'--slider-start':'0%','--slider-end':`${percent(current,min,max)}%`} as CSSProperties}>
    {(label||showValue)&&<div className="mk-slider-header">{label&&<label htmlFor={id}>{label}</label>}{showValue&&<span className="mk-slider-value" aria-hidden="true">{current}{unit}</span>}</div>}
    <div className="mk-slider-track"><input {...props} id={id} type="range" min={min} max={max} step={step} value={current} disabled={disabled} aria-valuetext={unit?`${current}${unit}`:undefined} onChange={event=>{const next=Number(event.target.value);if(value===undefined)setInternal(next);onChange?.(next);}} onPointerUp={event=>onCommit?.(Number(event.currentTarget.value))} onKeyUp={event=>{if(/^(Arrow|Page|Home|End)/.test(event.key))onCommit?.(Number(event.currentTarget.value));}}/></div>
  </div>;
}

export interface RangeSliderProps {
  label:string;
  value?:[number,number];
  defaultValue?:[number,number];
  min?:number;
  max?:number;
  step?:number;
  disabled?:boolean;
  /** Adds number fields for exact values. */
  inputs?:boolean;
  onChange?:(value:[number,number])=>void;
  className?:string;
}
/** Keeps the typed text while it is out of range, so partial numbers can be written. */
function RangeField({label,value,min,max,step,disabled,onCommit}:{label:string;value:number;min:number;max:number;step:number;disabled?:boolean;onCommit:(value:number)=>void}){
  const [draft,setDraft]=useState<string|null>(null);
  return <Input size="sm" type="number" label={label} min={min} max={max} step={step} value={draft??value} disabled={disabled} onChange={event=>{const text=event.target.value;setDraft(text);const next=Number(text);if(text!==''&&next>=min&&next<=max)onCommit(next);}} onBlur={()=>{if(draft!==null&&draft!=='')onCommit(clamp(Number(draft),min,max));setDraft(null);}}/>;
}
export function RangeSlider({label,value,defaultValue,min=0,max=100,step=1,disabled,inputs=false,onChange,className=''}:RangeSliderProps){
  const id=useId();
  const [internal,setInternal]=useState<[number,number]>(defaultValue??[min,max]);
  const [low,high]=value??internal;
  function update(next:[number,number]){if(value===undefined)setInternal(next);onChange?.(next);}
  const setLow=(next:number)=>update([clamp(next,min,high),high]);
  const setHigh=(next:number)=>update([low,clamp(next,low,max)]);
  return <div role="group" aria-labelledby={`${id}-label`} className={`mk-slider mk-range-slider${disabled?' is-disabled':''}${className?` ${className}`:''}`} style={{'--slider-start':`${percent(low,min,max)}%`,'--slider-end':`${percent(high,min,max)}%`} as CSSProperties}>
    <div className="mk-slider-header"><span id={`${id}-label`} className="mk-slider-label">{label}</span>{!inputs&&<span className="mk-slider-value" aria-hidden="true">{low} – {high}</span>}</div>
    <div className="mk-slider-track">
      <input type="range" aria-label={`${label}: mínimo`} min={min} max={max} step={step} value={low} disabled={disabled} onChange={event=>setLow(Number(event.target.value))}/>
      <input type="range" aria-label={`${label}: máximo`} min={min} max={max} step={step} value={high} disabled={disabled} onChange={event=>setHigh(Number(event.target.value))}/>
    </div>
    {inputs&&<div className="mk-range-inputs"><RangeField label="Mínimo" min={min} max={high} step={step} value={low} disabled={disabled} onCommit={setLow}/><RangeField label="Máximo" min={low} max={max} step={step} value={high} disabled={disabled} onCommit={setHigh}/></div>}
  </div>;
}

type InputNaming={label:string}|{label?:undefined;'aria-label':string};
export type SearchInputProps=Omit<InputProps,'label'|'aria-label'|'aria-labelledby'|'value'|'defaultValue'|'search'|'suffix'|'onChange'|'type'>&InputNaming&{
  value?:string;
  defaultValue?:string;
  onValueChange?:(value:string)=>void;
  loading?:boolean;
};
export function SearchInput({value,defaultValue='',onValueChange,loading=false,placeholder='Buscar',prefix,shortcut=false,disabled,readOnly,className='',...props}:SearchInputProps){
  const ref=useRef<HTMLInputElement>(null);
  const [internal,setInternal]=useState(defaultValue);
  const current=value??internal;
  function change(next:string){if(value===undefined)setInternal(next);onValueChange?.(next);}
  const canClear=!!current&&!disabled&&!readOnly&&!shortcut;
  const naming=(props.label!==undefined?{label:props.label}:{'aria-label':(props as {'aria-label':string})['aria-label']}) as {label:string};
  const {label:_label,'aria-label':_aria,...rest}=props as typeof props&{'aria-label'?:string};
  return <Input {...rest} {...naming} ref={ref} className={`mk-search-input ${className}`} search={!loading&&prefix==null} shortcut={shortcut&&!loading} type="search" value={current} disabled={disabled} readOnly={readOnly} placeholder={placeholder} aria-busy={loading||undefined} prefix={loading?<Spinner size={16} label="Buscando"/>:prefix} prefixStyling={false} suffixStyling={false} onChange={event=>change(event.target.value)} suffix={canClear?<button type="button" className="mk-search-clear" aria-label="Limpiar búsqueda" onClick={()=>{change('');ref.current?.focus();}}><Icon name="close"/></button>:undefined}/>;
}

export interface SplitButtonProps {
  children:ReactNode;
  onClick?:()=>void;
  items:MenuEntry[];
  /** Names the action set for screen readers, like "Más opciones de despliegue". */
  menuButtonLabel:string;
  menuPosition?:'bottom-start'|'bottom-end'|'top-start'|'top-end';
  /** Destructive variants stay out on purpose: a delete must not hide in a dropdown. */
  variant?:Extract<ButtonVariant,'primary'|'secondary'>;
  size?:'sm'|'md'|'lg';
  prefix?:ComponentPropsWithRef<typeof Button>['prefix'];
  disabled?:boolean;
  loading?:boolean;
}
export function SplitButton({children,onClick,items,menuButtonLabel,menuPosition='bottom-end',variant='primary',size='md',prefix,disabled=false,loading=false}:SplitButtonProps){
  return <span className={`mk-split-button mk-split-button-${variant}`} role="group" aria-label={menuButtonLabel}>
    <Button variant={variant} size={size} prefix={prefix} disabled={disabled} loading={loading} onClick={onClick}>{children}</Button>
    <Menu items={items} label={menuButtonLabel} position={menuPosition} disabled={disabled||loading} buttonProps={{variant,size,className:'mk-split-button-trigger'}} trigger={<Icon name="chevron-down" size={16}/>}/>
  </span>;
}

export interface ShowMoreProps extends Omit<ComponentPropsWithRef<'div'>,'onToggle'> {
  expanded:boolean;
  onToggle:(expanded:boolean)=>void;
  /** Hidden items, shown in the label so the cost of expanding is clear. */
  count?:number;
  controls?:string;
  border?:boolean;
  moreLabel?:string;
  lessLabel?:string;
}
export function ShowMore({expanded,onToggle,count,controls,border=true,moreLabel,lessLabel='Mostrar menos',className='',...props}:ShowMoreProps){
  const label=expanded?lessLabel:moreLabel??(count!==undefined?`Mostrar ${count} más`:'Mostrar más');
  return <div {...props} className={`mk-show-more${className?` ${className}`:''}`}>
    {border&&<Separator aria-hidden/>}
    <button type="button" className="mk-show-more-button" aria-expanded={expanded} aria-controls={controls} onClick={()=>onToggle(!expanded)}>{label}<Icon name="chevron-down" data-expanded={expanded} size={16}/></button>
    {border&&<Separator aria-hidden/>}
  </div>;
}

export interface ScrollerProps extends ComponentPropsWithRef<'div'> {
  direction?:'vertical'|'horizontal'|'free';
  /** Adds buttons that scroll to the next direct child. */
  buttons?:boolean;
  /** Names the content: it labels the region and its buttons. */
  label:string;
  height?:string|number;
  width?:string|number;
}
export function Scroller({direction='vertical',buttons=false,label,height,width,children,className='',style,...props}:ScrollerProps){
  const view=useRef<HTMLDivElement>(null);
  const [edges,setEdges]=useState({start:true,end:true});
  const horizontal=direction==='horizontal';
  useLayoutEffect(()=>{
    const node=view.current;if(!node)return;
    function measure(){
      if(!node)return;
      const position=horizontal?node.scrollLeft:node.scrollTop;
      const total=horizontal?node.scrollWidth-node.clientWidth:node.scrollHeight-node.clientHeight;
      setEdges({start:position<=1,end:position>=total-1});
    }
    measure();node.addEventListener('scroll',measure,{passive:true});
    const observer=new ResizeObserver(measure);observer.observe(node);
    return ()=>{node.removeEventListener('scroll',measure);observer.disconnect();};
  },[horizontal]);
  function move(forward:boolean){
    const node=view.current;if(!node)return;
    const motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
    const position=horizontal?node.scrollLeft:node.scrollTop;
    const origin=node.getBoundingClientRect();
    const offsets=Array.from(node.children).map(child=>{const box=child.getBoundingClientRect();return horizontal?box.left-origin.left+position:box.top-origin.top+position;});
    const target=forward?offsets.find(offset=>offset>position+1):offsets.filter(offset=>offset<position-1).at(-1);
    node.scrollTo({[horizontal?'left':'top']:target??(forward?Number.MAX_SAFE_INTEGER:0),behavior:motion});
  }
  const names=horizontal?['a la izquierda','a la derecha']:['hacia arriba','hacia abajo'];
  return <div className={`mk-scroller mk-scroller-${direction}${buttons?' has-buttons':''}${className?` ${className}`:''}`} style={{width,...style}} data-start={edges.start} data-end={edges.end}>
    {buttons&&direction!=='free'&&<button type="button" className="mk-scroller-button" disabled={edges.start} aria-label={`Desplazar ${label} ${names[0]}`} onClick={()=>move(false)}><Icon name="chevron"/></button>}
    {/* The region takes focus so keyboard users can scroll when no child is focusable. */}
    <div {...props} ref={view} role="region" aria-label={label} tabIndex={0} className="mk-scroller-view" style={{height}}>{Children.toArray(children)}</div>
    {buttons&&direction!=='free'&&<button type="button" className="mk-scroller-button" disabled={edges.end} aria-label={`Desplazar ${label} ${names[1]}`} onClick={()=>move(true)}><Icon name="chevron"/></button>}
  </div>;
}

const relativeUnits:[Intl.RelativeTimeFormatUnit,number][]=[['year',31536e6],['month',2592e6],['day',864e5],['hour',36e5],['minute',6e4]];
function formatRelative(date:number,now:number,locale:string){
  const difference=date-now;
  if(Math.abs(difference)<6e4)return 'Ahora mismo';
  const format=new Intl.RelativeTimeFormat(locale,{numeric:'auto',style:'short'});
  const [unit,size]=relativeUnits.find(([,ms])=>Math.abs(difference)>=ms)!;
  const text=format.format(Math.trunc(difference/size),unit);
  return text.charAt(0).toUpperCase()+text.slice(1);
}
export interface RelativeTimeCardProps {
  /** Unix time in milliseconds. */
  date:number;
  /** For states the formatter cannot describe, like "En cola". */
  children?:ReactNode;
  locale?:string;
  side?:'top'|'bottom'|'left'|'right';
}
export function RelativeTimeCard({date,children,locale='es',side='top'}:RelativeTimeCardProps){
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return ()=>clearInterval(timer);},[]);
  const moment=new Date(date);
  const timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const format=(zone?:string)=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'medium',timeZone:zone}).format(moment);
  return <ContextCard label="Fecha y hora exactas" side={side} trigger={<time dateTime={moment.toISOString()}>{children??formatRelative(date,now,locale)}</time>}>
    <dl className="mk-time-card"><div><dt>UTC</dt><dd>{format('UTC')}</dd></div><div><dt>{timeZone}</dt><dd>{format()}</dd></div></dl>
  </ContextCard>;
}

export interface SheetProps {
  open:boolean;
  onClose:()=>void;
  title:string;
  description?:ReactNode;
  children?:ReactNode;
  footer?:ReactNode;
  side?:'top'|'right'|'bottom'|'left';
  /** By default the page stays usable; modal blocks it and traps focus. */
  modal?:boolean;
  closeLabel?:string;
}
export function Sheet({open,onClose,title,description,children,footer,side='right',modal=false,closeLabel='Cerrar panel'}:SheetProps){
  const dialog=useRef<HTMLDialogElement>(null);
  const opener=useRef<HTMLElement|null>(null);
  const id=useId();
  useEffect(()=>{
    if(!open)return;
    const node=dialog.current;if(!node)return;
    opener.current=document.activeElement as HTMLElement|null;
    if(modal)node.showModal();else node.show();
    node.querySelector<HTMLElement>('.mk-sheet-close')?.focus();
    const onKey=(event:globalThis.KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onClose();}};
    document.addEventListener('keydown',onKey);
    return ()=>{document.removeEventListener('keydown',onKey);node.close();if(opener.current?.isConnected)opener.current.focus();};
  },[open,modal]);
  if(!open)return null;
  return <dialog ref={dialog} className={`mk-sheet mk-sheet-${side}`} aria-labelledby={`${id}-title`} aria-describedby={description?`${id}-description`:undefined} onCancel={event=>event.preventDefault()}>
    <header><div><h2 id={`${id}-title`}>{title}</h2>{description&&<p id={`${id}-description`}>{description}</p>}</div><button type="button" className="mk-sheet-close" aria-label={closeLabel} onClick={onClose}><Icon name="close"/></button></header>
    <div className="mk-sheet-body">{children}</div>
    {footer&&<footer className="mk-actions">{footer}</footer>}
  </dialog>;
}

export interface CalendarRange {start:Date;end:Date}
export interface CalendarPreset {label:string;range:CalendarRange}
export interface CalendarProps {
  value?:CalendarRange|null;
  defaultValue?:CalendarRange|null;
  onChange?:(range:CalendarRange|null)=>void;
  label?:string;
  placeholder?:string;
  min?:Date;
  max?:Date;
  presets?:CalendarPreset[];
  /** compact joins the presets to the trigger; stacked places them above. */
  presetsLayout?:'compact'|'stacked';
  size?:'sm'|'md';
  /** Places the timezone beside the month instead of below it. */
  horizontalLayout?:boolean;
  timezones?:string[];
  /** Locks the calendar to one timezone, shown as read-only text. */
  pinnedTimezone?:string;
  locale?:string;
}
const dayOnly=(date:Date)=>new Date(date.getFullYear(),date.getMonth(),date.getDate());
const sameDay=(a?:Date|null,b?:Date|null)=>!!a&&!!b&&dayOnly(a).getTime()===dayOnly(b).getTime();
const addDays=(date:Date,days:number)=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+days);
const addMonths=(date:Date,months:number)=>{const last=new Date(date.getFullYear(),date.getMonth()+months+1,0).getDate();return new Date(date.getFullYear(),date.getMonth()+months,Math.min(date.getDate(),last));};
export function Calendar({value,defaultValue=null,onChange,label='Rango de fechas',placeholder='Seleccionar fechas',min,max,presets,presetsLayout='compact',size='md',horizontalLayout=false,timezones,pinnedTimezone,locale='es'}:CalendarProps){
  const id=useId();
  const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);const panel=useRef<HTMLDivElement>(null);const grid=useRef<HTMLTableElement>(null);
  const [open,setOpen]=useState(false);
  const [internal,setInternal]=useState(defaultValue);
  const range=value!==undefined?value:internal;
  const [anchor,setAnchor]=useState<Date|null>(null);
  const [cursor,setCursor]=useState(()=>dayOnly(range?.start??new Date()));
  const [timezone,setTimezone]=useState(()=>pinnedTimezone??timezones?.[0]);
  const [focusDay,setFocusDay]=useState(false);
  const allowed=(date:Date)=>(!min||dayOnly(date)>=dayOnly(min))&&(!max||dayOnly(date)<=dayOnly(max));
  const inRange=(date:Date)=>{const start=anchor??range?.start;const end=anchor?null:range?.end;return !!start&&!!end&&dayOnly(date)>=dayOnly(start)&&dayOnly(date)<=dayOnly(end);};
  const weeks=useMemo(()=>{
    const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);
    const start=addDays(first,-((first.getDay()+6)%7));
    return Array.from({length:6},(_,week)=>Array.from({length:7},(_,day)=>addDays(start,week*7+day)));
  },[cursor.getFullYear(),cursor.getMonth()]);
  const dateText=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric'});
  const monthText=new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}).format(cursor);
  const dayText=new Intl.DateTimeFormat(locale,{dateStyle:'full'});
  const weekdays=Array.from({length:7},(_,index)=>new Date(2024,0,1+index));
  const weekdayLong=new Intl.DateTimeFormat(locale,{weekday:'long'});const weekdayShort=new Intl.DateTimeFormat(locale,{weekday:'short'});
  function commit(next:CalendarRange|null){if(value===undefined)setInternal(next);onChange?.(next);}
  function close(restore=true){setOpen(false);setAnchor(null);if(restore)trigger.current?.focus();}
  function pick(date:Date){
    if(!allowed(date))return;
    setCursor(date);
    if(!anchor){setAnchor(date);setFocusDay(true);return;}
    const [start,end]=date<anchor?[date,anchor]:[anchor,date];
    setAnchor(null);commit({start,end});close();
  }
  function moveCursor(next:Date){const bounded=min&&next<dayOnly(min)?dayOnly(min):max&&next>dayOnly(max)?dayOnly(max):next;setCursor(bounded);setFocusDay(true);}
  function onGridKey(event:KeyboardEvent){
    const moves:Record<string,()=>Date>={ArrowLeft:()=>addDays(cursor,-1),ArrowRight:()=>addDays(cursor,1),ArrowUp:()=>addDays(cursor,-7),ArrowDown:()=>addDays(cursor,7),Home:()=>addDays(cursor,-((cursor.getDay()+6)%7)),End:()=>addDays(cursor,6-((cursor.getDay()+6)%7)),PageUp:()=>addMonths(cursor,event.shiftKey?-12:-1),PageDown:()=>addMonths(cursor,event.shiftKey?12:1)};
    const move=moves[event.key];
    if(move){event.preventDefault();moveCursor(move());}
  }
  useEffect(()=>{if(focusDay){grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();setFocusDay(false);}},[focusDay,cursor]);
  useLayoutEffect(()=>{
    if(!open)return;
    function place(){
      const box=trigger.current?.getBoundingClientRect();const node=panel.current;if(!box||!node)return;
      const edge=8;const gap=8;const {width,height}=node.getBoundingClientRect();
      const top=box.bottom+gap+height>innerHeight-edge&&box.top-gap-height>=edge?box.top-gap-height:box.bottom+gap;
      Object.assign(node.style,{left:`${Math.max(edge,Math.min(box.left,innerWidth-width-edge))}px`,top:`${Math.max(edge,Math.min(top,innerHeight-height-edge))}px`,visibility:'visible'});
    }
    place();
    grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    return ()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:Event)=>{if(!root.current?.contains(event.target as Node))close(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);};
  },[open]);
  const summary=range?(sameDay(range.start,range.end)?dateText.format(range.start):`${dateText.format(range.start)} – ${dateText.format(range.end)}`):placeholder;
  const activePreset=presets?.findIndex(preset=>sameDay(preset.range.start,range?.start)&&sameDay(preset.range.end,range?.end))??-1;
  return <div ref={root} className={`mk-calendar mk-calendar-${size}${presets?` has-presets mk-calendar-${presetsLayout}`:''}`}>
    <span id={`${id}-label`} className="mk-calendar-label">{label}</span>
    <div className="mk-calendar-controls">
      {presets&&<select className="mk-calendar-presets" aria-label={`${label}: rangos habituales`} value={activePreset<0?'':activePreset} onChange={event=>{const preset=presets[Number(event.target.value)];if(preset){commit(preset.range);setCursor(dayOnly(preset.range.start));}}}><option value="" disabled>Rangos habituales</option>{presets.map((preset,index)=><option key={preset.label} value={index}>{preset.label}</option>)}</select>}
      <button ref={trigger} type="button" className="mk-calendar-trigger" aria-labelledby={`${id}-label ${id}-summary`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>open?close():setOpen(true)} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);}}}><Icon name="calendar" size={20}/><span id={`${id}-summary`} data-empty={!range||undefined}>{summary}</span></button>
    </div>
    {open&&<div ref={panel} role="dialog" aria-label={label} className={`mk-calendar-panel${horizontalLayout?' is-horizontal':''}`} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}}}>
      <div className="mk-calendar-month">
        <div className="mk-calendar-nav"><button type="button" aria-label="Mes anterior" onClick={()=>setCursor(addMonths(cursor,-1))}><Icon name="chevron"/></button><strong aria-live="polite">{monthText}</strong><button type="button" aria-label="Mes siguiente" onClick={()=>setCursor(addMonths(cursor,1))}><Icon name="chevron"/></button></div>
        <table ref={grid} role="grid" aria-label={monthText} onKeyDown={onGridKey}><thead><tr>{weekdays.map(day=><th key={day.getDay()} scope="col" abbr={weekdayLong.format(day)}>{weekdayShort.format(day).slice(0,2)}</th>)}</tr></thead>
          <tbody>{weeks.map((week,index)=><tr key={index}>{week.map(day=>{
            const selected=sameDay(day,anchor)||sameDay(day,range?.start)&&!anchor||sameDay(day,range?.end)&&!anchor;
            return <td key={day.getTime()} role="gridcell" aria-selected={selected||inRange(day)}><button type="button" tabIndex={sameDay(day,cursor)?0:-1} disabled={!allowed(day)} aria-label={dayText.format(day)} aria-current={sameDay(day,new Date())?'date':undefined} className={`${day.getMonth()!==cursor.getMonth()?'is-outside ':''}${selected?'is-edge ':''}${inRange(day)?'is-range':''}`} onClick={()=>pick(day)}>{day.getDate()}</button></td>;
          })}</tr>)}</tbody></table>
        <p className="mk-sr-only" role="status">{anchor?`Inicio: ${dayText.format(anchor)}. Elige la fecha final.`:''}</p>
      </div>
      {(timezones||pinnedTimezone)&&<div className="mk-calendar-side">{pinnedTimezone?<p><span>Zona horaria</span><strong>{pinnedTimezone}</strong></p>:<label><span>Zona horaria</span><select value={timezone} onChange={event=>setTimezone(event.target.value)}>{timezones?.map(zone=><option key={zone}>{zone}</option>)}</select></label>}</div>}
      <div className="mk-calendar-footer"><Button size="sm" variant="ghost" onClick={()=>{setAnchor(null);commit(null);close();}}>Limpiar</Button></div>
    </div>}
  </div>;
}
