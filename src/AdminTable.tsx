import type {ReactNode} from 'react';
import {DotsMenu} from './DotsMenu';
import type {MenuEntry} from './Menu';
import {Table,type Column,type TableProps} from './Table';

export interface AdminTableProps<T> extends Omit<TableProps<T>,'columns'> {
  columns:Column<T>[];
  /** Actions for one row. Empty arrays omit the trigger. */
  rowActions:(row:T)=>MenuEntry[];
  /** Accessible name that identifies the row, for example `Acciones de Equipo 01`. */
  rowActionLabel:(row:T)=>string;
  rowActionsDisabled?:(row:T)=>boolean;
  actionsHeader?:ReactNode;
}

/** Operational table with compact density and one consistent row-actions menu. */
export function AdminTable<T>({columns,rowActions,rowActionLabel,rowActionsDisabled,actionsHeader=<span className="mk-sr-only">Acciones</span>,density='compact',variant='primary',className='',...props}:AdminTableProps<T>){
  const actionColumn:Column<T>={
    key:'__admin-actions',header:actionsHeader,align:'right',width:56,minWidth:56,responsivePriority:'primary',
    render:row=>{const items=rowActions(row);return items.length?<DotsMenu size="sm" position="bottom-end" label={rowActionLabel(row)} disabled={rowActionsDisabled?.(row)} items={items}/>:null;},
  };
  return <Table {...props} columns={[...columns,actionColumn]} density={density} variant={variant} className={`mk-admin-table${className?` ${className}`:''}`}/>;
}
