import type {ComponentPropsWithRef,CSSProperties} from 'react';
import './metrics-layout.css';

export type GridResponsive<T>=T|{sm:T;md?:T;lg?:T};
export interface GridProps extends ComponentPropsWithRef<'div'> {
  columns?:GridResponsive<number>;
  rows?:GridResponsive<number>;
  hideRowGuides?:boolean;
  hideColumnGuides?:boolean;
  dashed?:boolean;
  cross?:boolean;
}
function resolve<T,>(value:GridResponsive<T>):[T,T,T]{if(typeof value==='object'&&value!==null&&'sm' in value)return [value.sm,value.md??value.sm,value.lg??value.md??value.sm];return [value as T,value as T,value as T];}
const count=(value:number)=>Number.isFinite(value)?Math.max(1,Math.min(12,Math.floor(value))):1;
export function Grid({columns=3,rows=2,hideRowGuides=false,hideColumnGuides=false,dashed=false,cross=false,children,className='',style,...props}:GridProps){
  const cols=resolve(columns).map(count);const rowCounts=resolve(rows).map(count);
  const vars=Object.fromEntries(['sm','md','lg'].flatMap((key,index)=>[[`--grid-cols-${key}`,cols[index]],[`--grid-rows-${key}`,rowCounts[index]]]));
  return <div {...props} className={`mk-layout-grid${dashed?' mk-layout-grid-dashed':''} ${className}`} style={{...vars,...style} as CSSProperties}>
    {['sm','md','lg'].map((breakpoint,index)=><div key={breakpoint} className={`mk-layout-guides mk-layout-guides-${breakpoint}`} aria-hidden="true">
      {!hideColumnGuides&&Array.from({length:cols[index]+1},(_,x)=><i className="mk-grid-column-guide" key={`x${x}`} style={{left:`${x/cols[index]*100}%`}}/>)}
      {!hideRowGuides&&Array.from({length:rowCounts[index]+1},(_,y)=><i className="mk-grid-row-guide" key={`y${y}`} style={{top:`${y/rowCounts[index]*100}%`}}/>)}
      {cross&&Array.from({length:cols[index]+1},(_,x)=>Array.from({length:rowCounts[index]+1},(_,y)=><i className="mk-grid-cross" key={`${x}-${y}`} style={{left:`${x/cols[index]*100}%`,top:`${y/rowCounts[index]*100}%`}}/>))}
    </div>)}{children}
  </div>;
}
export interface GridCellProps extends ComponentPropsWithRef<'div'> {
  column?:GridResponsive<number>;
  row?:GridResponsive<number>;
  columnSpan?:GridResponsive<number>;
  rowSpan?:GridResponsive<number>;
  solid?:GridResponsive<boolean>;
}
export function GridCell({column,row,columnSpan=1,rowSpan=1,solid=false,children,className='',style,...props}:GridCellProps){
  const variables:Record<string,string|number>={};
  for(const [name,values] of [['column',column],['row',row],['column-span',columnSpan],['row-span',rowSpan]] as const){resolve(values??'auto').forEach((value,index)=>variables[`--cell-${name}-${['sm','md','lg'][index]}`]=typeof value==='number'?count(value):value);}
  resolve(solid).forEach((value,index)=>{variables[`--cell-bg-${['sm','md','lg'][index]}`]=value?'var(--surface)':'transparent';variables[`--cell-border-${['sm','md','lg'][index]}`]=value?'var(--line)':'transparent';});
  return <div {...props} className={`mk-layout-cell ${className}`} style={{...variables,...style} as CSSProperties}>{children}</div>;
}
