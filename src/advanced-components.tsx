import { useId, type ComponentPropsWithRef } from 'react';
import { Button, Icon, type IconName } from './components';
import {Menu} from './Menu';

export {Checkbox, type CheckboxProps} from './Checkbox';
export {Radio,type RadioProps} from './Radio';

export {Textarea,type TextareaProps} from './Textarea';
export interface DatePickerProps extends Omit<ComponentPropsWithRef<'input'>,'type'>{label:string;hint?:string;error?:string;onValueChange?:(value:string)=>void;rootProps?:ComponentPropsWithRef<'div'>}
export function DatePicker({label,hint,error,id:givenId,onChange,onValueChange,rootProps={},...props}:DatePickerProps){const generated=useId();const id=givenId??generated;return <div {...rootProps} className={`mk-date-picker ${rootProps.className??''}`}><label htmlFor={id}>{label}<span className="mk-input-icon"><input {...props} id={id} type="date" aria-invalid={error?true:props['aria-invalid']} aria-describedby={[props['aria-describedby'],hint||error?`${id}-help`:null].filter(Boolean).join(' ')||undefined} onChange={event=>{onChange?.(event);if(!event.defaultPrevented)onValueChange?.(event.target.value);}}/><Icon name="chevron"/></span></label>{(error||hint)&&<span className="mk-help" id={`${id}-help`}>{error||hint}</span>}</div>}

export {Combobox,type ComboboxProps} from './Combobox';
export interface FileUploadProps extends Omit<ComponentPropsWithRef<'input'>,'type'|'children'> {label?:string;hint?:string;onFiles?:(files:FileList|null)=>void;onValueChange?:(files:FileList|null)=>void;rootProps?:ComponentPropsWithRef<'label'>}
export function FileUpload({label='Subir archivo',hint='PNG, JPG o PDF',id:givenId,onFiles,onChange,onValueChange,rootProps={},...props}:FileUploadProps){const generated=useId();const id=givenId??generated;return <label {...rootProps} className={`mk-upload ${rootProps.className??''}`} htmlFor={id}><input {...props} id={id} type="file" aria-label={props['aria-label']??label} aria-describedby={[props['aria-describedby'],hint?`${id}-help`:null].filter(Boolean).join(' ')||undefined} onChange={e=>{onChange?.(e);if(!e.defaultPrevented){onFiles?.(e.target.files);onValueChange?.(e.target.files);}}}/><Icon name="plus"/><strong>{label}</strong>{hint&&<span id={`${id}-help`}>{hint}</span>}</label>}

export {Tooltip,type TooltipProps} from './Tooltip';
export {Popover,type PopoverProps} from './Popover';
export type MenuItem={label:string;icon?:IconName;disabled?:boolean;danger?:boolean;onSelect?:()=>void};
export interface DropdownMenuProps extends Omit<ComponentPropsWithRef<'span'>,'children'> {label?:string;items:MenuItem[];open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void}
export function DropdownMenu({label='Abrir menú',items,open,defaultOpen=false,onOpenChange,className='',...props}:DropdownMenuProps){
  return <span {...props} className={`mk-dropdown ${className}`}><Menu label={label} items={items.map((item,index)=>({id:String(index),label:item.label,disabled:item.disabled,danger:item.danger,onSelect:item.onSelect,prefix:item.icon?<Icon name={item.icon}/>:undefined}))} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} chevron position="bottom-end" buttonProps={{variant:'ghost'}}/></span>;
}

export {Tabs,type TabsProps,type TabItem} from './Tabs';
export {Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem} from './Breadcrumbs';
export interface PaginationProps extends Omit<ComponentPropsWithRef<'nav'>,'children'|'onChange'> {page:number;pages:number;onChange?:(page:number)=>void;onPageChange?:(page:number)=>void}
export function Pagination({page,pages,onChange,onPageChange,className='',...props}:PaginationProps){const total=Math.max(1,Math.floor(pages)||1);const current=Math.max(1,Math.min(Math.floor(page)||1,total));const visible=Array.from({length:Math.min(total,5)},(_,i)=>Math.max(1,Math.min(current-2,total-4))+i);const change=(next:number)=>{onChange?.(next);onPageChange?.(next);};return <nav {...props} className={`mk-pagination ${className}`} aria-label={props['aria-label']??'Paginación'}><button type="button" disabled={current===1} onClick={()=>change(current-1)} aria-label="Página anterior"><Icon name="chevron-left" size={16}/></button>{visible.map(n=><button type="button" key={n} aria-current={n===current?'page':undefined} onClick={()=>change(n)}>{n}</button>)}<button type="button" disabled={current===total} onClick={()=>change(current+1)} aria-label="Página siguiente"><Icon name="chevron-right" size={16}/></button></nav>}

export {Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps} from './Avatar';
export interface SkeletonProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {kind?:'text'|'card'|'table';lines?:number}
export function Skeleton({kind='text',lines=3,className='',...props}:SkeletonProps){return <div {...props} className={`mk-skeleton mk-skeleton-${kind} ${className}`} aria-hidden="true">{Array.from({length:kind==='text'?lines:1},(_,i)=><span key={i}/>)}</div>}
export interface ProgressBarProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {value?:number;state?:'default'|'success'|'error';label?:string}
export function ProgressBar({value,state='default',label='Progreso',className='',...props}:ProgressBarProps){const determinate=value!==undefined;const percent=determinate?Math.max(0,Math.min(100,Number.isFinite(value)?value:0)):undefined;return <div {...props} className={`mk-progress mk-progress-${state} ${className}`}><div><span>{label}</span>{determinate&&<strong>{percent}%</strong>}</div><div role="progressbar" aria-label={props['aria-label']??label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={determinate?{width:`${percent}%`}:undefined}/></div></div>}
export {Toast, type ToastProps} from './Toast';

export {Drawer,type DrawerProps} from './Drawer';
export {CollapseGroup as Accordion} from './Collapse';
