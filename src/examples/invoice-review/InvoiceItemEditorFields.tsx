import type {Dispatch,SetStateAction} from 'react';
import {Button,FormGrid,Input,Select} from '../../index';
import {formatAmount,type InvoiceCellKey} from './invoice-data';
import {expectedTotal} from './invoice-review-state';

export interface InvoiceDraft {value:string;reference:string;description:string;quantity:string;unit:string;price:string;total:string}
export function InvoiceItemEditorFields({draft,onChange,focus='description'}:{draft:InvoiceDraft;onChange:Dispatch<SetStateAction<InvoiceDraft>>;focus?:InvoiceCellKey}){
  const calculated=expectedTotal({quantity:Number(draft.quantity),price:Number(draft.price)});
  const mismatch=Number.isFinite(calculated)&&draft.total.trim()!==''&&Math.abs(Number(draft.total)-calculated)>.005;
  return <>
    <Input label="Referencia" autoFocus={focus==='reference'} value={draft.reference} onValueChange={reference=>onChange(current=>({...current,reference}))}/>
    <Input label="Descripción" autoFocus={focus==='description'} value={draft.description} onValueChange={description=>onChange(current=>({...current,description}))}/>
    <FormGrid><Input type="number" label="Cantidad" min="1" step="any" autoFocus={focus==='quantity'} value={draft.quantity} onValueChange={quantity=>onChange(current=>({...current,quantity}))}/><Select label="Unidad" autoFocus={focus==='unit'} value={draft.unit} onValueChange={unit=>onChange(current=>({...current,unit}))} options={['PCS','KG','M','SET'].map(value=>({value,label:value}))}/></FormGrid>
    <FormGrid><Input type="number" label="Precio unitario (USD)" min="0" step="0.01" autoFocus={focus==='price'} value={draft.price} onValueChange={price=>onChange(current=>({...current,price}))}/><Input type="number" label="Valor total (USD)" min="0" step="0.01" autoFocus={focus==='total'} value={draft.total} onValueChange={total=>onChange(current=>({...current,total}))} error={mismatch?`El total calculado es ${formatAmount(calculated)} USD.`:undefined}/></FormGrid>
    <div className="ir-editor-total"><span>Validación: cantidad × precio unitario</span><Button size="sm" variant="outline" prefix="refresh" disabled={!Number.isFinite(calculated)} onClick={()=>onChange(current=>({...current,total:String(calculated)}))}>Recalcular total</Button></div>
  </>;
}
