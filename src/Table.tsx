import {useState,type ComponentPropsWithRef,type CSSProperties,type ReactNode} from 'react';
import {Icon} from './Icon';
import './table.css';

export type TableSort={key:string;direction:'asc'|'desc'};
export type TableDensity='compact'|'normal'|'comfortable';
export type TableVariant='bordered'|'plain'|'striped';
export interface Column<T>{
  key:string;
  header:ReactNode;
  render:(row:T)=>ReactNode;
  align?:'left'|'center'|'right';
  width?:CSSProperties['width'];
  minWidth?:CSSProperties['minWidth'];
  /** Providing an accessor enables sorting. Numbers remain numeric. */
  sortValue?:(row:T)=>string|number|null|undefined;
  sortLabel?:string;
}
export interface TableSelection<T>{
  selectedKeys:readonly string[];
  onChange:(keys:string[])=>void;
  rowLabel:(row:T)=>string;
  isDisabled?:(row:T)=>boolean;
}
export interface TableProps<T> extends Omit<ComponentPropsWithRef<'div'>,'children'> {
  caption:string;
  columns:Column<T>[];
  rows:T[];
  rowKey:(row:T)=>string;
  empty?:ReactNode;
  density?:TableDensity;
  variant?:TableVariant;
  stickyHeader?:boolean;
  maxHeight?:CSSProperties['maxHeight'];
  sort?:TableSort|null;
  defaultSort?:TableSort;
  onSortChange?:(sort:TableSort)=>void;
  /** Manual mode exposes sorting controls while the application orders its data. */
  sortMode?:'client'|'manual';
  selection?:TableSelection<T>;
  loading?:boolean;
  loadingLabel?:string;
  error?:ReactNode;
  onRetry?:()=>void;
  toolbar?:ReactNode;
  footer?:ReactNode;
  className?:string;
}

const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
/** Stable, non-mutating sort shared by Table and DataTable. Null values go last. */
export function sortTableRows<T>(rows:T[],columns:Column<T>[],sort:TableSort|null|undefined):T[]{
  const accessor=columns.find(column=>column.key===sort?.key)?.sortValue;
  if(!sort||!accessor)return rows;
  return rows.map((row,index)=>({row,index})).sort((a,b)=>{
    const left=accessor(a.row);const right=accessor(b.row);
    if(left==null||right==null)return left==null&&right==null?a.index-b.index:left==null?1:-1;
    const comparison=typeof left==='number'&&typeof right==='number'?left-right:collator.compare(String(left),String(right));
    return comparison*(sort.direction==='asc'?1:-1)||a.index-b.index;
  }).map(entry=>entry.row);
}

function SelectionCheckbox({label,checked,mixed=false,disabled=false,onChange}:{label:string;checked:boolean;mixed?:boolean;disabled?:boolean;onChange:()=>void}){
  return <input className="mk-table-checkbox" type="checkbox" aria-label={label} checked={checked} disabled={disabled} ref={node=>{if(node)node.indeterminate=mixed;}} onChange={onChange}/>;
}

export function Table<T>({caption,columns,rows,rowKey,empty='No hay registros.',density='normal',variant='bordered',stickyHeader=false,maxHeight,sort:controlledSort,defaultSort,onSortChange,sortMode='client',selection,loading=false,loadingLabel='Cargando registros…',error,onRetry,toolbar,footer,className='',...props}:TableProps<T>){
  const [localSort,setLocalSort]=useState<TableSort|null>(defaultSort??null);
  const sort=controlledSort===undefined?localSort:controlledSort;
  const displayed=sortMode==='client'?sortTableRows(rows,columns,sort):rows;
  const selected=new Set(selection?.selectedKeys);
  const selectable=rows.filter(row=>!selection?.isDisabled?.(row)).map(rowKey);
  const selectedVisible=selectable.filter(key=>selected.has(key)).length;
  const busy=loading||!!error;
  const colspan=Math.max(1,columns.length+(selection?1:0));
  const toggleAll=()=>{
    if(!selection)return;
    const next=new Set(selection.selectedKeys);
    for(const key of selectable){if(selectedVisible===selectable.length)next.delete(key);else next.add(key);}
    selection.onChange([...next]);
  };
  function changeSort(key:string){
    const next:TableSort={key,direction:sort?.key===key&&sort.direction==='asc'?'desc':'asc'};
    if(controlledSort===undefined)setLocalSort(next);
    onSortChange?.(next);
  }
  return <div {...props} className={`mk-table-root mk-table-density-${density} mk-table-variant-${variant}${stickyHeader?' mk-table-sticky':''}${className?` ${className}`:''}`}>
    {toolbar&&<div className="mk-table-toolbar">{toolbar}</div>}
    <div className="mk-table-scroll" role="region" aria-label={caption} tabIndex={0} style={{maxHeight}}>
      <table className="mk-table" aria-busy={loading||undefined}>
        <caption>{caption}</caption>
        <thead><tr>{selection&&<th className="mk-table-selection" scope="col"><SelectionCheckbox label={`Seleccionar filas de ${caption}`} checked={selectable.length>0&&selectedVisible===selectable.length} mixed={selectedVisible>0&&selectedVisible<selectable.length} disabled={busy||!selectable.length} onChange={toggleAll}/></th>}
          {columns.map(column=><th key={column.key} scope="col" data-align={column.align??'left'} style={{width:column.width,minWidth:column.minWidth}} aria-sort={column.sortValue?(sort?.key===column.key?(sort.direction==='asc'?'ascending':'descending'):'none'):undefined}>
            {column.sortValue?<button type="button" className="mk-table-sort" disabled={busy} onClick={()=>changeSort(column.key)} aria-label={`Ordenar por ${column.sortLabel??(typeof column.header==='string'?column.header:column.key)}`}>
              {column.header}<Icon name={sort?.key===column.key?(sort.direction==='asc'?'arrow-up':'arrow-down'):'chevron-down'} size={14}/>
            </button>:column.header}
          </th>)}
        </tr></thead>
        <tbody>{loading?<tr><td colSpan={colspan} className="mk-table-state"><div role="status" className="mk-table-state-content"><Icon name="loading" className="mk-table-loading" size={20}/><span>{loadingLabel}</span></div></td></tr>:error?<tr><td colSpan={colspan} className="mk-table-state"><div role="alert" className="mk-table-state-content"><Icon name="warning" size={20}/><div>{error}</div>{onRetry&&<button type="button" className="mk-table-retry" onClick={onRetry}>Reintentar</button>}</div></td></tr>:displayed.length?displayed.map(row=>{
          const key=rowKey(row);const checked=selected.has(key);
          return <tr key={key} data-selected={selection?checked:undefined}>
            {selection&&<td className="mk-table-selection"><SelectionCheckbox label={`Seleccionar ${selection.rowLabel(row)}`} checked={checked} disabled={selection.isDisabled?.(row)} onChange={()=>{const next=new Set(selection.selectedKeys);if(checked)next.delete(key);else next.add(key);selection.onChange([...next]);}}/></td>}
            {columns.map(column=><td key={column.key} data-align={column.align??'left'}>{column.render(row)}</td>)}
          </tr>;
        }):<tr><td colSpan={colspan} className="mk-table-state"><div className="mk-table-state-content"><Icon name="database" size={24}/><div>{empty}</div></div></td></tr>}</tbody>
      </table>
    </div>
    {footer&&<div className="mk-table-footer">{footer}</div>}
  </div>;
}
