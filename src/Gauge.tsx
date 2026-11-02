import type {ComponentPropsWithRef,CSSProperties} from 'react';
import './metrics-layout.css';

export interface GaugeColorStop {at:number;color:string}
export interface GaugeProps extends Omit<ComponentPropsWithRef<'div'>,'role'|'aria-valuemin'|'aria-valuemax'|'aria-valuenow'> {
  value?:number;
  size?:number;
  showValue?:boolean;
  indeterminate?:boolean;
  arc?:'primary'|'equal';
  color?:string;
  colorScale?:GaugeColorStop[];
  secondaryColor?:string;
  label?:string;
}
const defaultScale=[{at:0,color:'var(--action-secondary)'},{at:80,color:'var(--info-text)'},{at:95,color:'var(--foreground)'}];
export function Gauge({value=0,size=64,showValue=false,indeterminate=false,arc='primary',color,colorScale=defaultScale,secondaryColor='var(--line)',label='Porcentaje',children,className='',style,...props}:GaugeProps){
  const percentage=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
  const pixels=Number.isFinite(size)?Math.max(24,size):64;
  const selected=[...colorScale].filter(stop=>Number.isFinite(stop.at)&&stop.at<=percentage).sort((a,b)=>a.at-b.at).at(-1)?.color??defaultScale[0].color;
  return <div {...props} className={`mk-gauge${indeterminate?' mk-gauge-indeterminate':''} ${className}`} role="progressbar" aria-label={props['aria-labelledby']?undefined:props['aria-label']??label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={indeterminate?undefined:percentage} aria-busy={indeterminate||undefined} style={{'--gauge-size':`${pixels}px`,'--gauge-text':`${Math.max(10,pixels*.23)}px`,...style} as CSSProperties}>
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="42" stroke={secondaryColor} strokeWidth="8"/>{(percentage>0||indeterminate)&&<circle className="mk-gauge-arc" cx="50" cy="50" r="42" pathLength="100" stroke={color??selected} strokeWidth="8" strokeLinecap={arc==='equal'?'butt':'round'} strokeDasharray={indeterminate?'25 75':`${percentage} ${100-percentage}`} transform="rotate(-90 50 50)"/>}</svg>
    <span className="mk-gauge-center" aria-hidden="true">{children??(showValue&&!indeterminate?Number(percentage.toFixed(1)):null)}</span>
  </div>;
}
