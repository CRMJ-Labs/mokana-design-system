import {formatAmount,formatNumber,type InvoiceCellKey,type InvoiceItem} from './invoice-data';

export const invoiceCellKeys:InvoiceCellKey[]=['reference','description','quantity','unit','price','total'];
export const cellLabels:Record<InvoiceCellKey,string>={reference:'Referencia',description:'Descripción',quantity:'Cantidad',unit:'Unidad',price:'Precio unitario',total:'Valor total'};
export type ReviewState='correct'|'review'|'failed'|'edited';
export const stateLabels:Record<ReviewState,string>={correct:'Correcto',review:'Por revisar',failed:'Regla fallida',edited:'Editado'};
export function expectedTotal(item:Pick<InvoiceItem,'quantity'|'price'>){return Math.round((item.quantity*item.price+Number.EPSILON)*100)/100;}
export function cellRuleError(item:InvoiceItem,key:InvoiceCellKey):string|undefined{
  if(key==='total'&&Math.abs(item.total-expectedTotal(item))>.005)return `El total no coincide con cantidad × precio unitario. Se esperaba ${formatAmount(expectedTotal(item))} USD y se extrajo ${formatAmount(item.total)} USD.`;
  if(key==='quantity'&&(!Number.isFinite(item.quantity)||item.quantity<=0))return 'La cantidad debe ser mayor que cero.';
  if((key==='price'||key==='total')&&(!Number.isFinite(item[key])||item[key]<0))return 'El importe debe ser un número positivo o cero.';
}
/** Errors take precedence over review flags and edit provenance. */
export function cellState(item:InvoiceItem,key:InvoiceCellKey):ReviewState{
  if(cellRuleError(item,key))return 'failed';
  if(item.review?.[key])return 'review';
  if(item.edits&&Object.hasOwn(item.edits,key))return 'edited';
  return 'correct';
}
export function itemStates(item:InvoiceItem){const states=invoiceCellKeys.map(key=>cellState(item,key));return {review:states.filter(state=>state==='review').length,failed:states.filter(state=>state==='failed').length,edited:Object.keys(item.edits??{}).length};}
export function formatCellValue(value:string|number,key:InvoiceCellKey){return typeof value==='number'?(key==='price'||key==='total'?formatAmount(value):formatNumber(value)):value;}
export function updateInvoiceItem(item:InvoiceItem,values:Pick<InvoiceItem,InvoiceCellKey>):InvoiceItem{
  const edits={...item.edits},review={...item.review};
  for(const key of invoiceCellKeys)if(values[key]!==item[key]){if(!Object.hasOwn(edits,key))edits[key]=item[key];delete review[key];}
  return {...item,...values,edits,review};
}
