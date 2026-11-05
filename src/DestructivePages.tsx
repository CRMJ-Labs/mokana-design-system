import {CodeDisclosure} from './CodeComponents';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Button} from './components';
import {DestructiveActionModal} from './DestructiveActionModal';
import {DestructiveConfirmationInput} from './DestructiveConfirmationInput';
import {DotsMenu} from './DotsMenu';
import {ToastProvider,useToasts} from './Toast';
import type {MenuEntry} from './Menu';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section id={id} className="mk-destructive-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-destructive-preview">{children}</div><CodeDisclosure code={code}/></section>;
}
function Page({title,description,sections,children}:{title:string;description:string;sections:[string,string][];children:ReactNode}){
  return <article className="mk-docs-component-page" data-page-sections={JSON.stringify(sections)}><header><p className="mk-eyebrow">COMPONENTE</p><h1>{title}</h1><p>{description}</p></header>{children}</article>;
}
function Guidelines({slug,children}:{slug:string;children:ReactNode}){return <section className="mk-destructive-guidelines"><h2>Uso y accesibilidad</h2>{children}<a href={`https://vercel.com/geist/${slug}`} target="_blank" rel="noreferrer">Referencia: Geist</a></section>;}

function ModalExamples(){
  const [open,setOpen]=useState(false);const [mode,setMode]=useState('default');
  const [loading,setLoading]=useState(false);const [error,setError]=useState<string>();
  const [message,setMessage]=useState('Las acciones de estos ejemplos son simuladas.');
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const attempted=useRef(false);
  const toasts=useToasts();
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function show(next:string){setMode(next);setError(undefined);attempted.current=false;setOpen(true);}
  function confirm(){
    if(timer.current)return;setLoading(true);setError(undefined);
    timer.current=setTimeout(()=>{
      timer.current=null;setLoading(false);
      if(mode==='error'&&!attempted.current){attempted.current=true;setError('No se pudo eliminar el proyecto. Vuelve a intentarlo.');return;}
      setOpen(false);const result=mode==='reversible'?'Protección desactivada':'Proyecto eliminado';setMessage(`${result} en la demostración.`);toasts.success(result);
    },mode==='loading'?1800:700);
  }
  const reversible=mode==='reversible';
  return <Page title="Destructive Action Modal" description="Confirma acciones de alto impacto escribiendo una frase exacta antes de continuar." sections={[["default","Predeterminado"],["reversible","Reversible"],["loading","Cargando"],["error","Con error"]]}>
    <Example id="default" title="Predeterminado" description="Escribe mok-design para habilitar Eliminar proyecto. La banda inferior explica la consecuencia irreversible." code={'<DestructiveActionModal\n  open={open} onOpenChange={setOpen}\n  title="Eliminar proyecto" confirmLabel="Eliminar proyecto"\n  description={<>Se eliminará <b>mok-design</b> y sus despliegues.</>}\n  verificationPhrase="mok-design" verificationLabel="el nombre del proyecto"\n  irreversibleDescription="Eliminar mok-design no se puede deshacer."\n  loading={loading} error={error} onConfirm={deleteProject}\n/>'}><Button variant="error" onClick={()=>show('default')}>Eliminar proyecto</Button></Example>
    <Example id="reversible" title="Reversible" description="Mantiene la confirmación escrita, pero omite la banda irreversible cuando la operación se puede revertir." code={'<DestructiveActionModal\n  open={open} onOpenChange={setOpen}\n  title="Desactivar protección" confirmLabel="Desactivar protección"\n  description="El acceso al proyecto dejará de requerir autenticación."\n  verificationPhrase="desactivar protección"\n  loading={loading} onConfirm={disableProtection}\n/>'}><Button variant="error" onClick={()=>show('reversible')}>Desactivar protección</Button></Example>
    <Example id="loading" title="Cargando" description="Confirma para simular una solicitud de 1,8 segundos. Durante la carga se bloquean nuevas confirmaciones y el cierre del diálogo." code={'<DestructiveActionModal {...props} loading={loading} onConfirm={deleteProject} />'}><Button variant="error" onClick={()=>show('loading')}>Eliminar proyecto</Button></Example>
    <Example id="error" title="Con error" description="La primera confirmación simula un fallo. El diálogo conserva la frase y el foco para volver a intentarlo; el segundo intento se completa." code={'<DestructiveActionModal {...props} error={error} onConfirm={retryDelete} />'}><Button variant="error" onClick={()=>show('error')}>Eliminar proyecto</Button></Example>
    <p className="mk-destructive-feedback" role="status">{message}</p>
    <DestructiveActionModal open={open} onOpenChange={setOpen} title={reversible?'Desactivar protección':'Eliminar proyecto'} confirmLabel={reversible?'Desactivar protección':'Eliminar proyecto'} description={reversible?<>El acceso a <b>mok-design</b> dejará de requerir autenticación. Puedes volver a activar la protección.</>:<>Se eliminará <b>mok-design</b> y todos sus despliegues permanentemente.</>} verificationPhrase={reversible?'desactivar protección':'mok-design'} verificationLabel={reversible?'el texto':'el nombre del proyecto'} irreversibleDescription={reversible?undefined:'Eliminar mok-design y sus despliegues no se puede deshacer.'} loading={loading} error={error} onConfirm={confirm}/>
    <Guidelines slug="destructive-action-modal"><p>Importa DestructiveActionModal y DestructiveActionModalProps. La aplicación controla open, loading, error y onConfirm. El modal no se cierra automáticamente al confirmar: ciérralo tras completar la operación y conserva el diálogo abierto si falla.</p><p>La comparación distingue mayúsculas y espacios. Enter solo confirma si la frase coincide. Cancelar, Escape o clic fuera cierran cuando no hay una solicitud en curso. El foco vuelve al activador al cerrar y la frase se borra al abrir de nuevo.</p><p>Usa el nombre real del recurso como verificationPhrase. Omite irreversibleDescription para operaciones reversibles. Los errores aceptan una cadena o un Error nativo; solo se muestra el mensaje.</p></Guidelines>
  </Page>;
}
export function DestructiveActionModalPage(){return <ToastProvider><ModalExamples/></ToastProvider>;}

function ConfirmationDemo({withError=false}:{withError?:boolean}){
  const phrase=withError?'mok-design':'mok-site.com';
  const [value,setValue]=useState(withError?'MOK-Design':'');
  const [done,setDone]=useState(false);
  const mismatch=withError&&value!==phrase;
  return <div className="mk-destructive-sample"><DestructiveConfirmationInput verificationPhrase={phrase} verificationLabel={withError?'el nombre del proyecto':'el nombre del dominio'} value={value} onChange={event=>{setValue(event.target.value);setDone(false);}} error={mismatch?'El nombre del proyecto debe coincidir exactamente.':undefined}/><Button variant="error" disabled={value!==phrase} onClick={()=>setDone(true)}>Confirmar demostración</Button><p role="status">{done?'Frase confirmada. No se modificó ningún recurso.':value===phrase?'La frase coincide exactamente.':'Escribe la frase para habilitar la confirmación.'}</p></div>;
}
export function DestructiveConfirmationInputPage(){
  return <Page title="Destructive Confirmation Input" description="Un campo de confirmación que conserva la frase y el texto escrito exactamente como son." sections={[["default","Predeterminado"],["error","Con error"]]}>
    <Example id="default" title="Predeterminado" description="La aplicación controla el valor y compara con ===. No se eliminan espacios ni se cambian las mayúsculas." code={'<DestructiveConfirmationInput\n  verificationPhrase="mok-site.com" verificationLabel="el nombre del dominio"\n  value={value} onChange={event => setValue(event.target.value)}\n/>\n<Button disabled={value !== "mok-site.com"}>Confirmar demostración</Button>'}><ConfirmationDemo/></Example>
    <Example id="error" title="Con error" description="El ejemplo comienza con una diferencia de mayúsculas. Corrige el nombre a mok-design para desbloquear la confirmación." code={'<DestructiveConfirmationInput\n  verificationPhrase="mok-design" verificationLabel="el nombre del proyecto"\n  value={value} onChange={event => setValue(event.target.value)}\n  error={value !== "mok-design" ? "El nombre del proyecto debe coincidir exactamente." : undefined}\n/>'}><ConfirmationDemo withError/></Example>
    <Guidelines slug="destructive-confirmation-input"><p>Importa DestructiveConfirmationInput y DestructiveConfirmationInputProps. Acepta atributos nativos y ref en el input. La etiqueta se asocia mediante htmlFor y aria-labelledby; el mensaje de error se conecta mediante aria-describedby.</p><p>La frase conserva su escritura: se desactivan traducción, autocorrección, capitalización automática, autocompletado y revisión ortográfica. El input y la frase usan lang="zxx" y dir="ltr" para identificadores literales.</p><p>Usa este campo en flujos personalizados. Para la confirmación estándar, utiliza DestructiveActionModal.</p></Guidelines>
  </Page>;
}

export function DotsMenuPage(){
  const [message,setMessage]=useState('Selecciona una acción del proyecto.');
  const items:MenuEntry[]=[{id:'edit',label:'Editar proyecto',onSelect:()=>setMessage('Editar proyecto seleccionado.')},{id:'duplicate',label:'Duplicar proyecto',onSelect:()=>setMessage('Duplicar proyecto seleccionado.')},{id:'archive',label:'Archivar proyecto',onSelect:()=>setMessage('Archivar proyecto seleccionado.')}];
  return <Page title="Dots Menu" description="Un menú de acciones adicionales con un activador compacto de tres puntos." sections={[["default","Predeterminado"],["sizes","Tamaños"],["disabled","Deshabilitado"],["disabled-item","Opción deshabilitada"]]}>
    <Example id="default" title="Predeterminado" description="El botón identifica su contexto mediante una etiqueta accesible." code={'<DotsMenu label="Acciones del proyecto MOK" items={items} />'}><DotsMenu label="Acciones del proyecto MOK" items={items}/></Example>
    <Example id="sizes" title="Tamaños" description="Tres tamaños para filas compactas, tarjetas y acciones más amplias." code={'<DotsMenu size="sm" items={items} />\n<DotsMenu size="md" items={items} />\n<DotsMenu size="lg" items={items} />'}>{(['sm','md','lg'] as const).map(size=><DotsMenu key={size} size={size} label={`Acciones ${size}`} items={items}/>)}</Example>
    <Example id="disabled" title="Deshabilitado" description="El activador no permite abrir el menú cuando las acciones no están disponibles." code={'<DotsMenu disabled items={items} />'}><DotsMenu disabled items={items}/></Example>
    <Example id="disabled-item" title="Opción deshabilitada" description="Las opciones no disponibles se muestran atenuadas y se omiten al navegar con el teclado." code={'<DotsMenu items={[...items, { id: "export", label: "Exportar proyecto", disabled: true }]} />'}><DotsMenu items={[...items,{id:'export',label:'Exportar proyecto',disabled:true}]}/></Example>
    <p className="mk-destructive-feedback" role="status">{message}</p>
    <Guidelines slug="dots-menu"><p>Importa DotsMenu y DotsMenuProps. items utiliza MenuEntry y admite secciones, enlaces, prefijos, sufijos y opciones bloqueadas. position configura la posición preferida y el menú se ajusta a la ventana.</p><p>Enter, Espacio o las flechas abren el menú. Usa flechas, Inicio, Fin o escribe para buscar. Escape cierra y devuelve el foco al botón. El comportamiento se comparte con Menu.</p></Guidelines>
  </Page>;
}
