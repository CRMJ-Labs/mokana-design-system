import type {ComponentPropsWithRef,CSSProperties} from 'react';
import './charts.css';

function points(values:number[],width=100,height=32){
  const safe=values.length?values:[0];const min=Math.min(...safe),max=Math.max(...safe),range=max-min||1;
  return safe.map((value,index)=>`${safe.length===1?width/2:index/(safe.length-1)*width},${height-(value-min)/range*(height-4)-2}`).join(' ');
}

export interface SparklineProps extends Omit<ComponentPropsWithRef<'svg'>,'children'|'values'> {values:number[];label:string;color?:string}
export function Sparkline({values,label,color='var(--accent-text)',className='',...props}:SparklineProps){return <svg {...props} className={`mk-sparkline ${className}`} viewBox="0 0 100 32" preserveAspectRatio="none" role="img" aria-label={label}><polyline points={points(values)} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>}

export interface BarChartSeries {label:string;values:number[];color?:string}
export interface BarChartProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {labels:string[];series:BarChartSeries[];label:string}
export function BarChart({labels,series,label,className='',...props}:BarChartProps){const max=Math.max(1,...series.flatMap(item=>item.values));return <div {...props} className={`mk-bar-chart ${className}`} role="img" aria-label={label}><div className="mk-chart-plot">{labels.map((tick,index)=><div className="mk-bar-group" key={`${tick}-${index}`}><div className="mk-bar-pair">{series.map(item=><i key={item.label} title={`${item.label}: ${item.values[index]??0}`} style={{height:`${(item.values[index]??0)/max*100}%`,background:item.color??'var(--accent-text)'}}/>)}</div><span>{tick}</span></div>)}</div><div className="mk-chart-legend" aria-hidden="true">{series.map(item=><span key={item.label}><i style={{background:item.color??'var(--accent-text)'}}/>{item.label}</span>)}</div></div>}

export interface LineChartSeries extends BarChartSeries {}
export interface LineChartProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {labels:string[];series:LineChartSeries[];label:string}
export function LineChart({labels,series,label,className='',...props}:LineChartProps){const all=series.flatMap(item=>item.values),min=Math.min(...all),max=Math.max(...all),range=max-min||1;const line=(values:number[])=>values.map((value,index)=>`${values.length===1?50:index/(values.length-1)*100},${38-(value-min)/range*34}`).join(' ');return <div {...props} className={`mk-line-chart ${className}`} role="img" aria-label={label}><svg viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true"><g className="mk-line-grid"><line x1="0" y1="4" x2="100" y2="4"/><line x1="0" y1="21" x2="100" y2="21"/><line x1="0" y1="38" x2="100" y2="38"/></g>{series.map(item=><polyline key={item.label} points={line(item.values)} fill="none" stroke={item.color??'var(--accent-text)'} strokeWidth="2" vectorEffect="non-scaling-stroke"/>)}</svg><div className="mk-chart-axis" aria-hidden="true">{labels.map(label=><span key={label}>{label}</span>)}</div><div className="mk-chart-legend" aria-hidden="true">{series.map(item=><span key={item.label}><i style={{background:item.color??'var(--accent-text)'}}/>{item.label}</span>)}</div></div>}

export interface DonutSegment {label:string;value:number;color:string}
export interface DonutChartProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {segments:DonutSegment[];label:string;center?:string}
export function DonutChart({segments,label,center,className='',style,...props}:DonutChartProps){const total=Math.max(1,segments.reduce((sum,item)=>sum+Math.max(0,item.value),0));let cursor=0;const stops=segments.map(item=>{const start=cursor;cursor+=Math.max(0,item.value)/total*100;return `${item.color} ${start}% ${cursor}%`;}).join(',');return <div {...props} className={`mk-donut-chart ${className}`} role="img" aria-label={label} style={{...style,'--donut-stops':stops} as CSSProperties}><div className="mk-donut" aria-hidden="true"><span>{center}</span></div><div className="mk-chart-legend">{segments.map(item=><span key={item.label}><i style={{background:item.color}}/>{item.label} · {item.value}</span>)}</div></div>}

export interface FunnelStep {label:string;value:number;color?:string}
export interface FunnelChartProps extends Omit<ComponentPropsWithRef<'div'>,'children'> {steps:FunnelStep[];label:string}
export function FunnelChart({steps,label,className='',...props}:FunnelChartProps){const max=Math.max(1,...steps.map(item=>item.value));return <div {...props} className={`mk-funnel-chart ${className}`} role="img" aria-label={label}>{steps.map((item,index)=><div className="mk-funnel-step" key={item.label}><span style={{width:`${Math.max(24,item.value/max*100)}%`,background:item.color??`color-mix(in oklab,var(--accent-text) ${100-index*15}%,var(--surface))`}} aria-hidden="true"/><div><strong>{item.value}</strong><small>{item.label}</small></div></div>)}</div>}
