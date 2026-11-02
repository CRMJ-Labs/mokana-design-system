import {useId,useState,type ReactNode} from 'react';
import {Button} from './components';
import {Input} from './Input';
import {Icon} from './Icon';
import {Table,sortTableRows,type TableProps,type TableSort} from './Table';

export interface DataTableProps<T> extends Omit<TableProps<T>,'sort'|'defaultSort'|'onSortChange'|'sortMode'|'toolbar'|'footer'>{
  searchText?:(row:T)=>string;
  searchLabel?:string;
  pageSize?:number;
  defaultSort?:TableSort;
  actions?:ReactNode;
  selectionActions?:ReactNode;
}

/** Local filtering, sorting and pagination. Use Table for server-driven data. */
export function DataTable<T>({rows,columns,searchText,searchLabel='Buscar registros',pageSize=5,defaultSort,actions,selectionActions,selection,loading,error,...props}:DataTableProps<T>){
  const [query,setQuery]=useState('');const [page,setPage]=useState(1);const [sort,setSort]=useState<TableSort|null>(defaultSort??null);
  const regionId=useId();
  const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
  const filtered=searchText?rows.filter(row=>normalize(searchText(row)).includes(normalize(query))):rows;
  const ordered=sortTableRows(filtered,columns,sort);
  const size=Number.isFinite(pageSize)?Math.max(1,Math.floor(pageSize)):5;
  const pages=Math.max(1,Math.ceil(ordered.length/size));const current=Math.min(page,pages);
  const visible=ordered.slice((current-1)*size,current*size);
  const selectedCount=rows.filter(row=>selection?.selectedKeys.includes(props.rowKey(row))).length;
  const busy=loading||!!error;
  return <Table {...props} columns={columns} rows={visible} sort={sort} onSortChange={next=>{setSort(next);setPage(1);}} sortMode="manual" selection={selection} loading={loading} error={error}
    toolbar={<>
      {searchText&&<Input label={searchLabel} search value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}} placeholder="Buscar…"/>}
      <div className="mk-data-table-actions">{actions}</div>
      {selection&&selectedCount>0&&<div className="mk-data-table-selection"><span role="status">{selectedCount} seleccionados</span>{selectionActions}<Button type="button" variant="ghost" size="sm" onClick={()=>selection.onChange([])}>Limpiar selección</Button></div>}
    </>}
    footer={<><p id={regionId} role="status">{loading?'Cargando registros…':error?'No se pudieron cargar los registros.':`${ordered.length?((current-1)*size+1):0}–${Math.min(current*size,ordered.length)} de ${ordered.length} registros`}</p>
      <nav aria-label={`Paginación de ${props.caption}`} className="mk-data-table-pagination"><Button type="button" size="sm" variant="ghost" aria-label="Página anterior" aria-describedby={regionId} disabled={busy||current===1} onClick={()=>setPage(current-1)}><Icon name="chevron-left" size={16}/></Button><span>Página {current} de {pages}</span><Button type="button" size="sm" variant="ghost" aria-label="Página siguiente" aria-describedby={regionId} disabled={busy||current===pages} onClick={()=>setPage(current+1)}><Icon name="chevron-right" size={16}/></Button></nav>
    </>}
  />;
}
