import {useState} from 'react';
import {Button} from './components';
import {Code,CodeBlock,JsonView,Kbd,makeJsonViewHighlightPattern,MiddleTruncate,Snippet,TextWithCopyButton} from './CodeComponents';
import {ComponentPage,Example} from './PendingPage';
import {SearchInput} from './ControlComponents';
import {Slider} from './ControlComponents';

const sample=`function Saludo(props) {
  return (
    <div>
      <h1>Hola, {props.name}</h1>
      <p>Este es un componente de ejemplo.</p>
    </div>
  );
}`;

export function CodePage(){
  return <ComponentPage title="Code" intro="Muestra un fragmento de código con resaltado de sintaxis." reference="https://vercel.com/geist/code" sections={[['default','Bloque'],['inline','En línea']]} guidelines={<ul><li>Usa Code para fragmentos breves sin más controles. Usa Code Block si necesitas números de línea o copiar, y Snippet para comandos.</li><li>El bloque se puede recorrer con Tab para desplazarlo con el teclado.</li><li>El resaltado usa los roles de color de MOK en ambos temas.</li></ul>}>
    <Example id="default" title="Bloque" description="Conserva los espacios y se desplaza si el contenido es más ancho que su contenedor." code={'<Code>{`const tema = "claro";`}</Code>'} layout="stack"><Code>{`import { Snippet } from '@mokanadev/design-system';\n\nexport function Comando() {\n  return <Snippet text="npm run dev" />;\n}`}</Code></Example>
    <Example id="inline" title="En línea" description="inline lo integra en una línea de texto." code={'Ejecuta <Code inline>npm run dev</Code> para comenzar.'}><span>Ejecuta <Code inline>npm run dev</Code> para comenzar.</span></Example>
  </ComponentPage>;
}

export function CodeBlockPage(){
  const languages=[{id:'js',label:'JavaScript',code:sample},{id:'ts',label:'TypeScript',code:sample.replace('props)','props: { name: string })')},{id:'lua',label:'Lua',code:'local function saludo(nombre)\n  return "Hola, " .. nombre\nend'}];
  return <ComponentPage title="Code Block" intro="Un bloque de código con nombre de archivo, números de línea, cambios destacados y copia." reference="https://vercel.com/geist/code-block" sections={[['default','Predeterminado'],['no-filename','Sin nombre'],['highlighted','Líneas destacadas'],['diff','Añadidas y eliminadas'],['referenced','Líneas enlazables'],['language','Selector de lenguaje'],['tabs','Pestañas de lenguaje']]} guidelines={<ul><li>El bloque se recorre con Tab para desplazarlo con el teclado, y el botón de copiar tiene su propio nombre.</li><li>Las líneas añadidas y eliminadas llevan signo y texto oculto, además de color.</li><li>Copiar omite los números de línea y las líneas eliminadas.</li><li>El resaltado es de líneas sueltas y está pensado para documentación, no para todos los lenguajes.</li></ul>}>
    <Example id="default" title="Predeterminado" description="filename identifica el archivo." code={'<CodeBlock filename="Saludo.jsx" code={code} />'} layout="stack"><CodeBlock filename="Saludo.jsx" code={sample}/></Example>
    <Example id="no-filename" title="Sin nombre" description="Sin filename no se muestra la cabecera." code={'<CodeBlock code={code} />'} layout="stack"><CodeBlock code={sample}/></Example>
    <Example id="highlighted" title="Líneas destacadas" description="highlightLines dirige la atención a líneas concretas." code={'<CodeBlock highlightLines={[4, 5]} code={code} />'} layout="stack"><CodeBlock filename="destacado.jsx" highlightLines={[4,5]} code={sample}/></Example>
    <Example id="diff" title="Añadidas y eliminadas" description="addedLines y removedLines muestran un cambio." code={'<CodeBlock addedLines={[3]} removedLines={[5]} code={code} />'} layout="stack"><CodeBlock filename="mok.config.js" addedLines={[3]} removedLines={[5]} code={'module.exports = {\n  tema: {\n    oscuro: true,\n  },\n  oscuro: true,\n}'}/></Example>
    <Example id="referenced" title="Líneas enlazables" description="linkableLines convierte cada número en un enlace. La línea enlazada queda destacada." code={'<CodeBlock linkableLines code={code} />'} layout="stack"><CodeBlock linkableLines code={sample}/></Example>
    <Example id="language" title="Selector de lenguaje" description="languages muestra un selector en la cabecera." code={'<CodeBlock filename="saludo" languages={[{ id: "js", label: "JavaScript", code }]} />'} layout="stack"><CodeBlock filename="saludo" languages={languages}/></Example>
    <Example id="tabs" title="Pestañas de lenguaje" description="languageSwitcher=&quot;tabs&quot; muestra todas las opciones a la vez." code={'<CodeBlock languageSwitcher="tabs" languages={languages} />'} layout="stack"><CodeBlock languageSwitcher="tabs" languages={languages.slice(0,2)}/></Example>
  </ComponentPage>;
}

export function SnippetPage(){
  const [copied,setCopied]=useState(false);
  const [message,setMessage]=useState('Copia un comando para probar la respuesta.');
  return <ComponentPage title="Snippet" intro="Muestra un comando listo para copiar en la terminal." reference="https://vercel.com/geist/snippet" sections={[['default','Predeterminado'],['inverted','Sobre Ink'],['multi','Varias líneas'],['no-prompt','Sin prompt'],['callback','Respuesta'],['variants','Variantes'],['controlled','Copiado controlado']]} guidelines={<ul><li>Úsalo para comandos ejecutables. Para valores dentro de un texto usa Code inline, y para archivos Code Block.</li><li>El prompt no se copia ni se selecciona.</li><li>El botón anuncia el resultado de la copia.</li><li>No muestres secretos: Geist tiene una exploración aparte para ellos (SecretValue), que no forma parte de este componente.</li></ul>}>
    <Example id="default" title="Predeterminado" description="Muestra el prompt y un botón para copiar." code={'<Snippet text="npm install @mokanadev/design-system" />'} layout="stack"><Snippet text="npm install @mokanadev/design-system"/></Example>
    <Example id="inverted" title="Sobre Ink" description="inverted usa el panel de marca con el prompt lima, en ambos temas." code={'<Snippet inverted text="npm run dev" />'} layout="stack"><Snippet inverted text="npm run dev"/></Example>
    <Example id="multi" title="Varias líneas" description="Con un array, copia todas las líneas." code={'<Snippet text={["npm install", "npm run dev"]} />'} layout="stack"><Snippet text={['npm install','npm run dev']}/></Example>
    <Example id="no-prompt" title="Sin prompt" description="prompt={false} lo oculta." code={'<Snippet prompt={false} text="MOK_TEMA=oscuro" />'} layout="stack"><Snippet prompt={false} text="MOK_TEMA=oscuro"/></Example>
    <Example id="callback" title="Respuesta" description="onCopy se ejecuta al copiar." code={'<Snippet text="npm run build" onCopy={() => avisar()} />'} layout="stack"><Snippet text="npm run build" onCopy={()=>setMessage('Comando copiado.')}/><p role="status" style={{margin:0,fontSize:13}}>{message}</p></Example>
    <Example id="variants" title="Variantes" description="tone indica la intención con el borde." code={'<Snippet tone="warning" text="npm run reset" />'} layout="stack"><Snippet tone="success" text="npm run deploy"/><Snippet tone="warning" text="npm run reset"/><Snippet tone="error" text="npm run destroy"/></Example>
    <Example id="controlled" title="Copiado controlado" description="copied activa la confirmación desde fuera, cuando la copia ocurre en otro lugar." code={'<Snippet text="npm run dev" copied={copied} />'} layout="stack"><Snippet text="npm run dev" copied={copied}/><div><Button size="sm" variant="secondary" onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}}>Activar confirmación</Button></div></Example>
  </ComponentPage>;
}

export function TextWithCopyButtonPage(){
  return <ComponentPage title="Text With Copy Button" intro="Muestra un texto junto a un botón que lo copia." reference="https://vercel.com/geist/text-with-copy-button" sections={[['default','Predeterminado'],['small','Pequeño']]} guidelines={<ul><li>Úsalo para valores breves como identificadores. Para comandos usa Snippet.</li><li>El nombre del botón incluye el valor. label permite uno más claro.</li></ul>}>
    <Example id="default" title="Predeterminado" description="El texto admite selección y se ajusta si no cabe." code={'<TextWithCopyButton text="dpl_8gmXTT1yJRP8" />'}><TextWithCopyButton text="dpl_8gmXTT1yJRP8"/></Example>
    <Example id="small" title="Pequeño" description="size=&quot;sm&quot; para tablas y superficies densas." code={'<TextWithCopyButton size="sm" text="mok-config" label="Copiar resumen" />'}><TextWithCopyButton size="sm" text="mok-config" label="Copiar resumen"/></Example>
  </ComponentPage>;
}

export function KeyboardInputPage(){
  return <ComponentPage title="Keyboard Input" intro="Muestra la tecla o combinación que activa una acción." reference="https://vercel.com/geist/keyboard-input" sections={[['modifiers','Modificadores'],['combination','Combinación'],['small','Pequeño']]} guidelines={<ul><li>Pasa los modificadores como props. meta muestra ⌘ en Apple y Ctrl en otros sistemas.</li><li>children es una sola tecla. La puntuación va fuera del componente.</li><li>Es una indicación visual: el atajo debe implementarse aparte.</li></ul>}>
    <Example id="modifiers" title="Modificadores" description="meta, shift, alt y ctrl se muestran según el sistema." code={'<Kbd meta />\n<Kbd shift />\n<Kbd alt />\n<Kbd ctrl />'}><Kbd meta/><Kbd shift/><Kbd alt/><Kbd ctrl/></Example>
    <Example id="combination" title="Combinación" description="Combina modificadores con una tecla." code={'Pulsa <Kbd meta>K</Kbd> para abrir el menú.'}><span>Pulsa <Kbd meta>K</Kbd> para abrir el menú.</span><Kbd meta shift>P</Kbd></Example>
    <Example id="small" title="Pequeño" description="small para menús y filas de tabla." code={'<Kbd small>/</Kbd>'}><Kbd small>/</Kbd><Kbd small meta>K</Kbd></Example>
  </ComponentPage>;
}

const truncated=[['Rama','feature/rediseno-navegacion-del-panel-con-mejoras-en-la-barra-lateral'],['URL de vista previa','plataforma-web-git-feature-rediseno-navegacion-mokanadev.example.app'],['Identificador','dpl_8gmXTT1yJRP8UbGfXD7A3sp4RKhW'],['Variable','STRIPE_WEBHOOK_SIGNING_SECRET'],['Commit','2b0874e797d7c2a4092d0033ee0c2f0f9aef2869'],['Ruta','apps/sitio/app/(panel)/[equipo]/[proyecto]/configuracion/page.tsx'],['Cabe completo','sidebar.tsx']];
export function MiddleTruncatePage(){
  const [width,setWidth]=useState(280);
  return <ComponentPage title="MiddleTruncate" intro="Recorta un texto por el centro y conserva su inicio y su final." reference="https://vercel.com/geist/middle-truncate" sections={[['examples','Ejemplos'],['width','Ancho']]} guidelines={<ul><li>Úsalo cuando el inicio y el final informan: rutas, URL, identificadores y ramas. No lo uses en frases.</li><li>Los lectores de pantalla reciben el texto completo, y title lo muestra al pasar el cursor.</li><li>Seleccionar con el ratón copia el texto recortado. Si hay que copiarlo, añade Copy Button.</li><li>Se recalcula cuando cambia el ancho del contenedor.</li></ul>}>
    <Example id="examples" title="Ejemplos" description="Textos que se benefician del recorte central, en un contenedor estrecho." code={'<MiddleTruncate text="apps/sitio/app/configuracion/page.tsx" />'} layout="stack">{truncated.map(([label,text])=><div key={label} style={{width:'min(320px,100%)'}}><strong style={{display:'block',fontSize:12}}>{label}</strong><MiddleTruncate text={text}/></div>)}</Example>
    <Example id="width" title="Ancho" description="Cambia el ancho para ver cómo se ajusta." code={'<div style={{ width }}><MiddleTruncate text={text} /></div>'} layout="stack"><Slider label="Ancho" min={80} max={320} step={20} value={width} onChange={setWidth} unit=" px"/><div style={{width,maxWidth:'100%'}}><MiddleTruncate text={truncated[0][1]}/></div></Example>
  </ComponentPage>;
}

const deployment={despliegue:{id:'dpl_8gmXTT1',estado:'listo',regiones:['iad1','gru1'],recursos:{memoria:1024,cpu:2}},solicitud:{metodo:'GET',ruta:'/api/proyectos'},cache:false,error:null};
export function JsonViewPage(){
  const [query,setQuery]=useState('estado');
  return <ComponentPage title="JSON View" intro="Muestra objetos y listas JSON como un árbol que se puede expandir." reference="https://vercel.com/geist/json-view" sections={[['default','Predeterminado'],['single','Una línea'],['embedded','Integrado'],['wrapped','Ajustado'],['collapsed','Contraído'],['highlighted','Resaltado']]} guidelines={<ul><li>Usa flechas arriba y abajo para moverte, derecha para expandir, izquierda para contraer o subir, e Inicio y Fin para ir a los extremos.</li><li>El texto se puede seleccionar. El árbol ocupa una sola parada de Tab.</li><li>makeJsonViewHighlightPattern escapa los términos de búsqueda.</li></ul>}>
    <Example id="default" title="Predeterminado" description="defaultExpandDepth abre los niveles inferiores a ese valor." code={'<JsonView value={data} defaultExpandDepth={1} />'} layout="stack"><JsonView value={deployment} defaultExpandDepth={1} label="Datos del despliegue"/></Example>
    <Example id="single" title="Una línea" description="Un objeto con un único valor breve se muestra en una línea." code={'<JsonView value={{ foo: "bar" }} />'} layout="stack"><JsonView value={{foo:'bar'}}/></Example>
    <Example id="embedded" title="Integrado" description="embedded lo integra en el texto que lo rodea." code={'Consulta lenta <JsonView embedded value={stats} />, en GET /api/registros'}><div style={{fontSize:13,overflowWrap:'anywhere'}}>Consulta lenta detectada <JsonView embedded value={{filas_leidas:8866333,duracion_ms:10513,detenida:false}} label="Estadísticas"/> en GET /api/registros</div></Example>
    <Example id="wrapped" title="Ajustado" description="Los valores largos se ajustan al ancho disponible." code={'<JsonView value={{ url: "https://…" }} />'} layout="stack"><JsonView value={{urlDeCaptura:'https://capturas.example.com/imagen?url=https%3A%2F%2Fmok-design-system.example.app%2Fcomponents%2Fbanner&ancho=1440&alto=900&completa=true'}}/></Example>
    <Example id="collapsed" title="Contraído" description="defaultExpandDepth={0} mantiene compacta la superficie." code={'<JsonView value={data} defaultExpandDepth={0} />'} layout="stack"><JsonView value={deployment} defaultExpandDepth={0} label="Datos contraídos"/></Example>
    <Example id="highlighted" title="Resaltado" description="highlightPattern marca coincidencias en claves y valores." code={'<JsonView value={data} highlightPattern={makeJsonViewHighlightPattern([query])} />'} layout="stack"><SearchInput label="Buscar en los datos" value={query} onValueChange={setQuery}/><JsonView value={deployment} highlightPattern={makeJsonViewHighlightPattern([query])} label="Datos resaltados"/></Example>
  </ComponentPage>;
}
