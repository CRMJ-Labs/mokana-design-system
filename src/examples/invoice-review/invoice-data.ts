export type InvoiceCellKey='reference'|'description'|'quantity'|'unit'|'price'|'total';
export interface InvoiceItem {
  id:number;reference:string;description:string;quantity:number;unit:string;price:number;total:number;
  review?:Partial<Record<InvoiceCellKey,string>>;
  edits?:Partial<Record<InvoiceCellKey,string|number>>;
}
export interface InvoiceField {id:string;label:string;value:string;group:'Proveedor'|'Factura'|'Comprador';page:number}
const descriptions=['Hex bolt M4 stainless 304','Hex nut M4 zinc plated','Flat washer M4 stainless 304','Spring washer M4 black oxide','Socket cap screw M4 zinc plated','Carriage bolt M4 stainless 304','Threaded rod 1m M4 black oxide','Expansion anchor M4 zinc plated','Hinge 3in M4 stainless 304','Door handle M4 black oxide','Cable gland M4 stainless 304','Pipe fitting elbow M4 black oxide','Ball bearing M4 zinc plated','Hinge 3in M4 stainless 304','Door handle M4 black oxide','Drawer slide 350mm M4 zinc plated','Padlock 40mm M4 stainless 304','Steel chain 6mm (m) M4 black oxide','Eye bolt M4 zinc plated','Turnbuckle M4 stainless 304'];
const quantities=[2000,4000,800,250,1000,1500,5000,500,300,100];
const prices=[.26,.85,.16,.53,.48,.31,1.3,1.35,1.9,3.48,.95,.2,1.73,.07,.03];
/** Recreated demonstration data, not an extraction from the original invoice. */
export const invoiceSourceItems:InvoiceItem[]=Array.from({length:520},(_,index)=>({id:index+1,reference:`NZ-${10000+index*3}`,description:descriptions[index%descriptions.length],quantity:quantities[index%quantities.length],unit:'PCS',price:prices[index%prices.length],total:Math.round(quantities[index%quantities.length]*prices[index%prices.length]*100)/100}));
invoiceSourceItems[17]={...invoiceSourceItems[17],quantity:2000,price:.95,total:1900};
export const initialInvoiceItems=invoiceSourceItems.map(item=>({...item}));
initialInvoiceItems[17]={...initialInvoiceItems[17],review:{description:'La descripción tiene confianza media. Compárala con el documento antes de confirmarla.'}};
initialInvoiceItems[19]={...initialInvoiceItems[19],total:initialInvoiceItems[19].total+12};
initialInvoiceItems[20]={...initialInvoiceItems[20],review:{quantity:'La cantidad es poco legible en el documento. Confirma que el valor extraído sea correcto.'}};
initialInvoiceItems[21]={...initialInvoiceItems[21],price:.99,total:Math.round(initialInvoiceItems[21].quantity*.99*100)/100,edits:{price:invoiceSourceItems[21].price,total:invoiceSourceItems[21].total}};
export const initialInvoiceFields:InvoiceField[]=[
  {id:'supplier',label:'Razón social',value:'Ningbo Zhongtai Hardware Trading Co., Ltd.',group:'Proveedor',page:1},
  {id:'tax-id',label:'NIT / tax ID del proveedor',value:'',group:'Proveedor',page:1},
  {id:'country',label:'País de origen',value:'China',group:'Proveedor',page:1},
  {id:'city',label:'Ciudad',value:'Ningbo',group:'Proveedor',page:1},
  {id:'address',label:'Dirección',value:'88 Industrial Road, Ningbo, Zhejiang',group:'Proveedor',page:1},
  {id:'contact',label:'Contacto comercial',value:'Export Department',group:'Proveedor',page:1},
  {id:'number',label:'Número de factura',value:'NB-2611-0520',group:'Factura',page:1},
  {id:'date',label:'Fecha de emisión',value:'5 de noviembre de 2026',group:'Factura',page:1},
  {id:'currency',label:'Moneda',value:'USD · Dólar estadounidense',group:'Factura',page:1},
  {id:'incoterm',label:'Incoterm',value:'FOB Ningbo',group:'Factura',page:1},
  {id:'payment',label:'Condición de pago',value:'T/T in advance',group:'Factura',page:17},
  {id:'port',label:'Puerto de salida',value:'Ningbo, China',group:'Factura',page:1},
  {id:'destination',label:'País de destino',value:'Colombia',group:'Factura',page:1},
  {id:'items',label:'Cantidad de ítems',value:'520',group:'Factura',page:17},
  {id:'pages',label:'Páginas del documento',value:'17',group:'Factura',page:17},
  {id:'buyer',label:'Razón social del comprador',value:'GPS CARGO S.A.S.',group:'Comprador',page:1},
  {id:'buyer-country',label:'País del comprador',value:'Colombia',group:'Comprador',page:1},
  {id:'buyer-city',label:'Ciudad del comprador',value:'Bogotá D. C.',group:'Comprador',page:1},
  {id:'shipping',label:'Modalidad de transporte',value:'Marítimo',group:'Comprador',page:1},
  {id:'purchase',label:'Referencia de compra',value:'PO-2026-1182',group:'Comprador',page:1},
];
export const invoiceFileName='SINT-11 Invoice masiva 520 items FOB Ningbo.pdf';
export const formatNumber=(value:number)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(value);
export const formatMoney=(value:number)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(value);
export const formatAmount=(value:number)=>new Intl.NumberFormat('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
