import type {ComponentPropsWithRef,CSSProperties,ReactNode} from 'react';
import {Button,ButtonLink,Icon} from './components';
import './status-components.css';

export interface SpinnerProps extends ComponentPropsWithRef<'span'> {
  size?:number;
  color?:string;
  label?:string;
}
export function Spinner({size=20,color,label='Cargando',className='',style,...props}:SpinnerProps){
  return <span role="status" aria-label={label} {...props} className={`mk-spinner-indicator${className?` ${className}`:''}`} style={{'--spinner-size':`${size}px`,color,...style} as CSSProperties}/>;
}

export interface LoadingDotsProps extends ComponentPropsWithRef<'span'> {
  /** Dot diameter in pixels. */
  size?:number;
}
/** Text before the dots carries the meaning; the dots themselves stay decorative. */
export function LoadingDots({size=4,children,className='',style,...props}:LoadingDotsProps){
  return <span {...props} className={`mk-loading-dots${className?` ${className}`:''}`} style={{'--dot-size':`${size}px`,...style} as CSSProperties}>{children}<span className="mk-loading-dots-marks" aria-hidden="true"><i/><i/><i/></span></span>;
}

export type StatusDotState='queued'|'building'|'ready'|'error'|'canceled'|'deleted';
const statusLabels:Record<StatusDotState,string>={queued:'En cola',building:'Compilando',ready:'Listo',error:'Error',canceled:'Cancelado',deleted:'Eliminado'};
export interface StatusDotProps extends ComponentPropsWithRef<'span'> {
  state:StatusDotState;
  /** Shows the state name next to the dot. */
  label?:boolean;
  titlePrefix?:string;
}
/** Each state has its own shape, so it never depends on color alone. */
export function StatusDot({state,label=false,titlePrefix='Este despliegue',className='',...props}:StatusDotProps){
  const name=statusLabels[state];
  return <span role="img" aria-label={`${titlePrefix}: ${name}`} title={`${titlePrefix}: ${name}`} {...props} className={`mk-status-dot mk-status-dot-${state}${className?` ${className}`:''}`}><i aria-hidden="true"/>{label&&<span aria-hidden="true">{name}</span>}</span>;
}

export interface PieGaugeProps extends Omit<ComponentPropsWithRef<'svg'>,'width'|'height'|'color'> {
  value:number;
  size?:number;
  width?:number;
  height?:number;
  color?:string;
  label?:string;
}
export function PieGauge({value,size=16,width,height,color,label,className='',style,...props}:PieGaugeProps){
  const percentage=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
  const angle=percentage/100*Math.PI*2;
  const x=8+5*Math.sin(angle);const y=8-5*Math.cos(angle);
  return <svg role="img" aria-label={label??`${Math.round(percentage)} %`} viewBox="0 0 16 16" width={width??size} height={height??size} fill="none" {...props} className={`mk-pie-gauge${className?` ${className}`:''}`} style={{color,...style}}>
    <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5"/>
    {percentage>=100?<circle cx="8" cy="8" r="5" fill="currentColor"/>:percentage>0&&<path d={`M8 8V3A5 5 0 ${percentage>50?1:0} 1 ${x.toFixed(3)} ${y.toFixed(3)}Z`} fill="currentColor"/>}
  </svg>;
}

export type NoteTone='default'|'success'|'warning'|'error';
const noteLabels:Record<NoteTone,string>={default:'Nota',success:'Correcto',warning:'Advertencia',error:'Error'};
export interface NoteProps extends ComponentPropsWithRef<'div'> {
  tone?:NoteTone;
  size?:'sm'|'md';
  filled?:boolean;
  action?:ReactNode;
}
export function Note({tone='default',size='md',filled=false,action,children,className='',...props}:NoteProps){
  return <div {...props} className={`mk-note mk-note-${tone} mk-note-${size}${filled?' mk-note-filled':''}${className?` ${className}`:''}`}>
    <span className="mk-note-symbol"><Icon name={tone==='success'?'check':tone==='default'?'info':'warning'}/><span className="mk-sr-only">{noteLabels[tone]}: </span></span>
    <div className="mk-note-body">{children}</div>
    {action&&<div className="mk-note-action">{action}</div>}
  </div>;
}

export interface ProjectBannerAction {label:string;href?:string;onClick?:()=>void}
export interface ProjectBannerProps extends ComponentPropsWithRef<'div'> {
  tone?:NoteTone;
  action?:ProjectBannerAction;
}
/** Not dismissible by design: it stays until the project state is resolved. */
export function ProjectBanner({tone='default',action,children,className='',...props}:ProjectBannerProps){
  return <div role={tone==='error'?'alert':'status'} {...props} className={`mk-project-banner mk-project-banner-${tone}${className?` ${className}`:''}`}>
    <span className="mk-project-banner-text"><Icon name={tone==='success'?'check':tone==='default'?'info':'warning'}/><span className="mk-sr-only">{noteLabels[tone]}: </span><span>{children}</span></span>
    {action&&(action.href?<ButtonLink href={action.href} size="sm" variant="secondary" onClick={action.onClick}>{action.label}</ButtonLink>:<Button size="sm" variant="secondary" onClick={action.onClick}>{action.label}</Button>)}
  </div>;
}
