import {useEffect,useState,type FormEvent} from 'react';
import {FileUpload} from './advanced-components';
import {Alert,Button,Input,Modal,Select} from './components';
import {Fieldset} from './Fieldset';
import {FormErrorSummary,FormGrid,FormLayout,FormReadOnly,type FormErrorItem} from './FormLayout';
import {Textarea} from './Textarea';
import {Toggle} from './Toggle';
import './form-pattern.css';

type Values={name:string;code:string;owner:string;description:string;external:boolean;partner:string};
const empty:Values={name:'',code:'',owner:'',description:'',external:false,partner:''};
const owners=[{value:'',label:'Selecciona una persona',disabled:true},{value:'ana',label:'Ana Torres'},{value:'carlos',label:'Carlos Ruiz'},{value:'laura',label:'Laura Gómez'}];

function validate(value:Values):FormErrorItem[]{
  const errors:FormErrorItem[]=[];
  if(!value.name.trim())errors.push({id:'complete-name',label:'Nombre',message:'Escribe un nombre para el proyecto.'});
  if(!/^PR-\d{4}$/.test(value.code.trim()))errors.push({id:'complete-code',label:'Código',message:'Usa el formato PR-0000.'});
  if(!value.owner)errors.push({id:'complete-owner',label:'Responsable',message:'Selecciona una persona.'});
  if(value.external&&!value.partner.trim())errors.push({id:'complete-partner',label:'Proveedor',message:'Identifica el proveedor externo.'});
  return errors;
}

export function FormPattern(){
  const [value,setValue]=useState(empty);
  const [errors,setErrors]=useState<FormErrorItem[]>([]);
  const [submitting,setSubmitting]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [saved,setSaved]=useState(false);
  const [discardOpen,setDiscardOpen]=useState(false);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
  function update(patch:Partial<Values>){setValue(current=>({...current,...patch}));setDirty(true);setSaved(false)}
  async function submit(event:FormEvent){
    event.preventDefault();
    const clientErrors=validate(value);setErrors(clientErrors);setSaved(false);
    if(clientErrors.length)return;
    setSubmitting(true);await new Promise(resolve=>window.setTimeout(resolve,650));
    if(value.code.toUpperCase()==='PR-0000'){setErrors([{id:'complete-code',label:'Código',message:'Este código ya está en uso.'}]);setSubmitting(false);return}
    setSubmitting(false);setDirty(false);setSaved(true);
  }
  function reset(){setValue(empty);setErrors([]);setDirty(false);setSaved(false);setDiscardOpen(false)}
  const errorFor=(id:string)=>errors.find(error=>error.id===id)?.message;
  return <article className="mk-docs-component-page mk-form-pattern"><header><p className="mk-eyebrow">PATRÓN ESTABLE</p><h1>Formularios completos</h1><p>Captura, valida y guarda información sin perder el contexto ni ocultar errores recuperables.</p></header>
    <nav className="mk-pending-index" aria-label="Secciones del patrón"><a href="#complete-form">Ejemplo completo</a><a href="#form-states">Estados</a><a href="#form-rules">Reglas</a></nav>
    <section id="complete-form"><h2>Crear proyecto</h2><p>Envía vacío para comprobar el resumen y el foco. Usa <code>PR-0000</code> para simular un error del servidor.</p>
      <div className="mk-form-pattern-demo">
        <FormLayout noValidate onSubmit={submit} feedback={<><FormErrorSummary errors={errors}/>{saved&&<Alert tone="success" title="Proyecto guardado">Los cambios de esta demostración permanecen únicamente durante la sesión.</Alert>}</>} actions={<><Button type="submit" loading={submitting}>{submitting?'Guardando':'Guardar proyecto'}</Button><Button variant="ghost" disabled={submitting||!dirty} onClick={()=>setDiscardOpen(true)}>Descartar cambios</Button></>}>
          <Fieldset title="Información general" description="Identifica el proyecto con valores estables y comprensibles.">
            <FormGrid><Input id="complete-name" label="Nombre" value={value.name} onValueChange={name=>update({name})} error={errorFor('complete-name')} required/><Input id="complete-code" label="Código" value={value.code} onValueChange={code=>update({code})} error={errorFor('complete-code')} hint="Formato PR-0000" required/></FormGrid>
            <Textarea id="complete-description" label="Descripción" value={value.description} onValueChange={description=>update({description})} maxLength={240} showCount hint="Explica el resultado esperado."/>
          </Fieldset>
          <Fieldset title="Responsabilidad" description="Asigna una persona interna o registra apoyo externo.">
            <FormGrid><Select id="complete-owner" label="Responsable" value={value.owner} onValueChange={owner=>update({owner})} error={errorFor('complete-owner')} options={owners} required/><FormReadOnly label="Organización" value="MOK Operaciones"/></FormGrid>
            <Toggle label="Participa un proveedor externo" description="Muestra información adicional solo cuando es necesaria." checked={value.external} onCheckedChange={external=>update({external,partner:external?value.partner:''})}/>
            {value.external&&<Input id="complete-partner" label="Proveedor" value={value.partner} onValueChange={partner=>update({partner})} error={errorFor('complete-partner')} required/>}
            <FileUpload label="Adjuntar documento" hint="PDF o imagen, máximo definido por la aplicación" onValueChange={()=>setDirty(true)}/>
          </Fieldset>
          <Fieldset title="Auditoría" description="Los valores calculados se muestran como información, no como controles deshabilitados."><FormGrid><FormReadOnly label="Creado por" value="Karina Molina"/><FormReadOnly label="Última actualización" value="Todavía sin guardar"/></FormGrid></Fieldset>
        </FormLayout>
      </div>
    </section>
    <section id="form-states"><h2>Estados obligatorios</h2><ul><li>Inicial y sin cambios.</li><li>Cambios pendientes antes de abandonar.</li><li>Envío bloqueando el doble submit.</li><li>Error local junto al campo y en el resumen.</li><li>Error remoto asociado al campo cuando sea posible.</li><li>Error general persistente cuando no pertenece a un campo.</li><li>Éxito con un siguiente paso claro.</li><li>Solo lectura y sin permiso sin fingir controles editables.</li></ul></section>
    <section id="form-rules"><h2>Responsabilidad de integración</h2><p>La aplicación conecta la mutación, el bloqueo del router, permisos, archivos y errores del servidor. MOK controla estructura, asociación accesible, foco, feedback y comportamiento responsive.</p></section>
    <Modal open={discardOpen} onClose={()=>setDiscardOpen(false)} title="Descartar cambios" footer={<><Button variant="danger" onClick={reset}>Descartar</Button><Button variant="ghost" onClick={()=>setDiscardOpen(false)}>Continuar editando</Button></>}><p>Los valores no guardados volverán al estado inicial.</p></Modal>
  </article>;
}
