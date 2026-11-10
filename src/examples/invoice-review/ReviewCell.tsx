import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Button,Icon,Popover,type IconName} from '../../index';
import type {InvoiceCellKey,InvoiceItem} from './invoice-data';
import {cellLabels,cellRuleError,cellState,expectedTotal,formatCellValue,stateLabels} from './invoice-review-state';

interface ReviewCellProps{
  item:InvoiceItem;field:InvoiceCellKey;children:ReactNode;open:boolean;disabled:boolean;
  onOpenChange:(open:boolean)=>void;onSource:()=>void;onEdit:()=>void;onConfirm:()=>void;onRecalculate:()=>void;
}
const icons:Record<string,IconName>={correct:'check',review:'warning',failed:'error',edited:'edit'};
export function ReviewCell({item,field,children,open,disabled,onOpenChange,onSource,onEdit,onConfirm,onRecalculate}:ReviewCellProps){
  const state=cellState(item,field),label=stateLabels[state];
  const trigger=useRef<HTMLButtonElement>(null),[anchorVisible,setAnchorVisible]=useState(false);
  useLayoutEffect(()=>{
    if(!open||!trigger.current)return;
    const update=()=>setAnchorVisible(Boolean(trigger.current?.getClientRects().length));
    update();const observer=new ResizeObserver(update);observer.observe(trigger.current);return ()=>observer.disconnect();
  },[open]);
  const indicator=state==='correct'?<span className="ir-cell-correct" title={`${cellLabels[field]}: correcto`}><Icon name="check" label="Correcto" size={13}/></span>:
    <Popover className="ir-cell-popover" open={open&&anchorVisible} onOpenChange={onOpenChange} title={`${cellLabels[field]} · ${label}`} trigger={<Button ref={trigger} className="ir-cell-trigger" size="sm" shape="rounded" variant="ghost" svgOnly prefix={icons[state]} aria-label={`${cellLabels[field]} de ${item.reference}: ${label}`}/>}>
      <div className="ir-cell-detail"><span>{item.reference} · Página {Math.floor((item.id-1)/32)+1}</span>
        {state==='review'&&<p>{item.review?.[field]}</p>}
        {state==='failed'&&<p>{cellRuleError(item,field)}</p>}
        {state==='edited'&&<><p>Este dato fue modificado manualmente y cumple las validaciones.</p><dl><div><dt>Antes</dt><dd>{formatCellValue(item.edits![field]!,field)}</dd></div><div><dt>Ahora</dt><dd>{formatCellValue(item[field],field)}</dd></div></dl></>}
        {state==='failed'&&item.edits&&Object.hasOwn(item.edits,field)&&<p>El dato fue editado, pero la regla sigue fallando.</p>}
        <div className="ir-cell-detail-actions">
          {state==='review'&&<Button size="sm" prefix="check" disabled={disabled} onClick={onConfirm}>Confirmar dato</Button>}
          {state==='failed'&&field==='total'&&<Button size="sm" prefix="check" disabled={disabled} onClick={onRecalculate}>Usar total calculado ({formatCellValue(expectedTotal(item),'total')})</Button>}
          <Button size="sm" variant="outline" prefix="eye" onClick={onSource}>Ver en documento</Button>
          <Button size="sm" variant="ghost" prefix="edit" disabled={disabled} onClick={onEdit}>Editar dato</Button>
        </div>
      </div>
    </Popover>;
  return <div className="ir-review-cell" data-state={state} data-field={field}><span className="ir-review-cell-value">{children}</span>{indicator}</div>;
}
