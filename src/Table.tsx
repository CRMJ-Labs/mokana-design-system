import {Fragment,useEffect,useId,useLayoutEffect,useRef,useState,type ComponentPropsWithRef,type CSSProperties,type ReactNode} from 'react';
import {Icon} from './Icon';
import {Checkbox} from './Checkbox';
import './table.css';

export type TableSort={key:string;direction:'asc'|'desc'};
export type TableDensity='compact'|'normal'|'comfortable';
export type TableVariant='primary'|'secondary'|'bordered'|'plain'|'striped';
export interface Column<T>{
  key:string;
  header:ReactNode;
  render:(row:T)=>ReactNode;
  align?:'left'|'center'|'right';
  width?:CSSProperties['width'];
  minWidth?:CSSProperties['minWidth'];
  /** Enables pointer and keyboard resizing for this column. */
  resizable?:boolean;
  defaultWidth?:number;
  maxWidth?:number;
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
export interface TableExpansion<T>{
  expandedKeys:readonly string[];
  onChange:(keys:string[])=>void;
  rowLabel:(row:T)=>string;
  render:(row:T)=>ReactNode;
  isDisabled?:(row:T)=>boolean;
}
export interface TableLoadMore{
  hasMore:boolean;
  loading?:boolean;
  onLoadMore:()=>void;
  /** Automatically request the next batch when its row becomes visible. */
  autoLoad?:boolean;
  label?:string;
  loadingLabel?:string;
  error?:ReactNode;
  onRetry?:()=>void;
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
  expansion?:TableExpansion<T>;
  loadMore?:TableLoadMore;
  onColumnWidthsChange?:(widths:Record<string,number>)=>void;
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
  return <Checkbox className="mk-table-checkbox" label={label} checked={checked} indeterminate={mixed} disabled={disabled} onChange={onChange}/>;
}

export function Table<T>({caption,columns,rows,rowKey,empty='No hay registros.',density='normal',variant='primary',stickyHeader=false,maxHeight,sort:controlledSort,defaultSort,onSortChange,sortMode='client',selection,expansion,loadMore,onColumnWidthsChange,loading=false,loadingLabel='Cargando registros…',error,onRetry,toolbar,footer,className='',...props}:TableProps<T>){
  const [localSort,setLocalSort]=useState<TableSort|null>(defaultSort??null);
  const id=useId(),table=useRef<HTMLTableElement>(null),scroll=useRef<HTMLDivElement>(null),sentinel=useRef<HTMLTableRowElement>(null);
  const [widths,setWidths]=useState<Record<string,number>>({}),[resizing,setResizing]=useState<string|null>(null);
  const drag=useRef<{key:string;x:number;width:number;direction:number;widths:Record<string,number>}|null>(null);
  const requestedCount=useRef<number|null>(null);
  const resizable=columns.some(column=>column.resizable);
  const columnKeys=JSON.stringify(columns.map(column=>[column.key,column.resizable,column.minWidth,column.maxWidth]));
  const controlColumns=Number(!!selection)+Number(!!expansion);
  const initialWidth=(column:Column<T>)=>column.defaultWidth??(typeof column.width==='number'?column.width:200);
  const minWidth=(column:Column<T>)=>Math.max(40,typeof column.minWidth==='number'?column.minWidth:80);
  const maxWidth=(column:Column<T>)=>Math.max(minWidth(column),column.maxWidth??1000);
  const clampWidth=(column:Column<T>,width:number)=>Math.min(maxWidth(column),Math.max(minWidth(column),width));
  function measuredWidths(){
    const cells=table.current?.tHead?.rows[0]?.cells;
    return Object.fromEntries(columns.map((column,index)=>[column.key,cells?.[index+controlColumns]?.getBoundingClientRect().width??initialWidth(column)]));
  }
  useLayoutEffect(()=>{
    if(!resizable)return;
    const measured=measuredWidths();
    setWidths(current=>Object.fromEntries(columns.map(column=>{
      const width=current[column.key]??measured[column.key];
      return [column.key,column.resizable?clampWidth(column,width):width];
    })));
  // Keep widths across row, sort and selection updates; honor changed limits.
  },[columnKeys,resizable,controlColumns]);
  function resizeColumn(column:Column<T>,width:number,base=measuredWidths()){
    const next={...base,[column.key]:clampWidth(column,width)};
    setWidths(next);onColumnWidthsChange?.(next);
  }
  const sort=controlledSort===undefined?localSort:controlledSort;
  const displayed=sortMode==='client'?sortTableRows(rows,columns,sort):rows;
  const selected=new Set(selection?.selectedKeys);
  const selectable=rows.filter(row=>!selection?.isDisabled?.(row)).map(rowKey);
  const selectedVisible=selectable.filter(key=>selected.has(key)).length;
  const busy=loading||!!error;
  const colspan=Math.max(1,columns.length+controlColumns);
  useEffect(()=>{
    if(!loadMore?.hasMore){requestedCount.current=null;return;}
    if(busy||loadMore.loading||loadMore.error||loadMore.autoLoad===false||!sentinel.current)return;
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)&&requestedCount.current!==rows.length){
        requestedCount.current=rows.length;loadMore.onLoadMore();
      }
    },{root:scroll.current,rootMargin:'0px 0px 48px 0px'});
    observer.observe(sentinel.current);return ()=>observer.disconnect();
  },[loadMore,busy,rows.length]);
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
    {resizable&&<span id={`${id}-resize-help`} className="mk-sr-only">Usa las flechas izquierda y derecha para ajustar el ancho; Mayús acelera el ajuste. Inicio y Fin aplican el ancho mínimo y máximo.</span>}
    <div className="mk-table-frame" data-resizing={resizing?true:undefined}>
    <div ref={scroll} className="mk-table-scroll" role="region" aria-label={caption} tabIndex={0} style={{maxHeight}}>
      <table ref={table} className="mk-table" aria-busy={loading||loadMore?.loading||undefined} style={resizable?{tableLayout:'fixed',width:Object.keys(widths).length?columns.reduce((sum,column)=>sum+(widths[column.key]??initialWidth(column)),controlColumns*48):'100%'}:undefined}>
        <caption>{caption}</caption>
        {resizable&&<colgroup>{Array.from({length:controlColumns},(_,index)=><col key={`control-${index}`} style={{width:48}}/>)}{columns.map(column=><col key={column.key} style={{width:widths[column.key]??column.width??clampWidth(column,initialWidth(column))}}/>)}</colgroup>}
        <thead><tr>{selection&&<th className="mk-table-selection" scope="col"><SelectionCheckbox label={`Seleccionar filas de ${caption}`} checked={selectable.length>0&&selectedVisible===selectable.length} mixed={selectedVisible>0&&selectedVisible<selectable.length} disabled={busy||!selectable.length} onChange={toggleAll}/></th>}
          {expansion&&<th className="mk-table-expansion" scope="col"><span className="mk-sr-only">Detalles</span></th>}
          {columns.map(column=><th key={column.key} scope="col" data-align={column.align??'left'} data-allows-sorting={!!column.sortValue||undefined} style={resizable?undefined:{width:column.width,minWidth:column.minWidth}} aria-sort={column.sortValue?(sort?.key===column.key?(sort.direction==='asc'?'ascending':'descending'):'none'):undefined}>
            {column.sortValue?<button type="button" className="mk-table-sort" disabled={busy} onClick={()=>changeSort(column.key)} aria-label={`Ordenar por ${column.sortLabel??(typeof column.header==='string'?column.header:column.key)}`}>
              {column.header}<Icon name={sort?.key===column.key?(sort.direction==='asc'?'arrow-up':'arrow-down'):'chevron-down'} size={14}/>
            </button>:column.header}
            {column.resizable&&<div className="mk-table-resizer" role="separator" aria-orientation="vertical" aria-label={`Ancho de ${column.sortLabel??(typeof column.header==='string'?column.header:column.key)}`} aria-describedby={`${id}-resize-help`} aria-valuemin={minWidth(column)} aria-valuemax={maxWidth(column)} aria-valuenow={Math.round(widths[column.key]??initialWidth(column))} aria-valuetext={`${Math.round(widths[column.key]??initialWidth(column))} píxeles`} tabIndex={busy?-1:0} aria-disabled={busy||undefined} data-resizing={resizing===column.key||undefined}
              onPointerDown={event=>{if(busy||event.button!==0)return;event.preventDefault();event.currentTarget.focus();event.currentTarget.setPointerCapture(event.pointerId);const measured=measuredWidths();drag.current={key:column.key,x:event.clientX,width:measured[column.key],direction:getComputedStyle(table.current!).direction==='rtl'?-1:1,widths:measured};setResizing(column.key);}}
              onPointerMove={event=>{const current=drag.current;if(current?.key===column.key)resizeColumn(column,current.width+(event.clientX-current.x)*current.direction,current.widths);}}
              onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);drag.current=null;setResizing(null);}}
              onLostPointerCapture={()=>{drag.current=null;setResizing(null);}}
              onPointerCancel={()=>{drag.current=null;setResizing(null);}}
              onKeyDown={event=>{if(busy||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const measured=measuredWidths(),direction=getComputedStyle(table.current!).direction==='rtl'?-1:1;resizeColumn(column,event.key==='Home'?minWidth(column):event.key==='End'?maxWidth(column):measured[column.key]+(event.key==='ArrowRight'?1:-1)*direction*(event.shiftKey?50:10),measured);}}
            />}
          </th>)}
        </tr></thead>
        <tbody>{loading?<tr><td colSpan={colspan} className="mk-table-state"><div role="status" className="mk-table-state-content"><Icon name="loading" className="mk-table-loading" size={20}/><span>{loadingLabel}</span></div></td></tr>:error?<tr><td colSpan={colspan} className="mk-table-state"><div role="alert" className="mk-table-state-content"><Icon name="warning" size={20}/><div>{error}</div>{onRetry&&<button type="button" className="mk-table-retry" onClick={onRetry}>Reintentar</button>}</div></td></tr>:displayed.length?displayed.map(row=>{
          const key=rowKey(row);const checked=selected.has(key);
          const expanded=expansion?.expandedKeys.includes(key)??false;
          const detailId=`${id}-details-${encodeURIComponent(key)}`;
          return <Fragment key={key}><tr data-selected={selection?checked:undefined} data-selection-disabled={selection?.isDisabled?.(row)||undefined}>
            {selection&&<td className="mk-table-selection"><SelectionCheckbox label={`Seleccionar ${selection.rowLabel(row)}`} checked={checked} disabled={selection.isDisabled?.(row)} onChange={()=>{const next=new Set(selection.selectedKeys);if(checked)next.delete(key);else next.add(key);selection.onChange([...next]);}}/></td>}
            {expansion&&<td className="mk-table-expansion"><button type="button" className="mk-table-expand" aria-expanded={expanded} aria-controls={expanded?detailId:undefined} aria-label={`${expanded?'Ocultar':'Mostrar'} detalles de ${expansion.rowLabel(row)}`} disabled={expansion.isDisabled?.(row)} onClick={()=>{const next=new Set(expansion.expandedKeys);if(expanded)next.delete(key);else next.add(key);expansion.onChange([...next]);}}><Icon name="chevron-right" size={16}/></button></td>}
            {columns.map(column=><td key={column.key} data-align={column.align??'left'}>{column.render(row)}</td>)}
          </tr>{expansion&&expanded&&<tr className="mk-table-detail-row"><td colSpan={colspan}><div id={detailId} role="region" aria-label={`Detalles de ${expansion.rowLabel(row)}`} className="mk-table-detail">{expansion.render(row)}</div></td></tr>}</Fragment>;
        }):<tr><td colSpan={colspan} className="mk-table-state"><div className="mk-table-state-content"><Icon name="database" size={24}/><div>{empty}</div></div></td></tr>}
        {!busy&&loadMore&&(loadMore.hasMore||loadMore.loading||loadMore.error)&&<tr ref={sentinel} className="mk-table-load-more"><td colSpan={colspan}><div className="mk-table-load-more-content">{loadMore.loading?<span role="status"><Icon name="loading" className="mk-table-loading" size={18}/>{loadMore.loadingLabel??'Cargando más registros…'}</span>:loadMore.error?<><span role="alert">{loadMore.error}</span><button type="button" className="mk-table-retry" onClick={loadMore.onRetry??loadMore.onLoadMore}>Reintentar carga</button></>:<button type="button" className="mk-table-retry" onClick={loadMore.onLoadMore}>{loadMore.label??'Cargar más registros'}</button>}</div></td></tr>}
        </tbody>
      </table>
    </div>
    {footer&&<div className="mk-table-footer">{footer}</div>}
    </div>
  </div>;
}
