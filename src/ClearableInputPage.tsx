import {CodeDisclosure} from './CodeComponents';
import {useState, type ReactNode} from 'react';
import {ClearableInput} from './ClearableInput';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){return <section className="mk-clearable-example" id={id}><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-clearable-preview">{children}</div><CodeDisclosure code={code}/></section>;}

export function ClearableInputPage(){
  const [query,setQuery]=useState('');
  const [cleared,setCleared]=useState(0);
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Clearable Input</h1><p>Un campo de texto que se limpia con un botón o con Escape, conservando el foco para continuar escribiendo.</p></header>

    <Example id="default" title="Predeterminado" description="Escribe para mostrar el botón de limpieza. El campo conserva un nombre accesible aunque no tenga etiqueta visible." code={'<ClearableInput aria-label="Texto de ejemplo" placeholder="Escribe algo…" />'}><ClearableInput aria-label="Texto de ejemplo" placeholder="Escribe algo…"/></Example>
    <Example id="label" title="Con etiqueta" description="Usa una etiqueta persistente para identificar el dato que esperas." code={'<ClearableInput label="Correo electrónico" type="email" placeholder="nombre@equipo.com" />'}><ClearableInput label="Correo electrónico" type="email" placeholder="nombre@equipo.com" hint="Usa tu correo de trabajo."/></Example>
    <Example id="shortcut" title="Con atajo de teclado" description="Pulsa Ctrl K o ⌘ K para enfocar la búsqueda. Escape limpia su contenido." code={'<ClearableInput aria-label="Buscar proyectos" placeholder="Buscar proyectos…" icon="search" shortcut />'}><ClearableInput aria-label="Buscar proyectos" placeholder="Buscar proyectos…" icon="search" shortcut/></Example>
    <Example id="disabled" title="Deshabilitado" description="El campo deshabilitado conserva su valor y bloquea la edición y la limpieza." code={'<ClearableInput aria-label="Campo deshabilitado" defaultValue="Proyecto MOK" disabled />'}><ClearableInput aria-label="Campo deshabilitado" defaultValue="Proyecto MOK" disabled hint="Necesitas permiso de edición para modificar este campo." title="Necesitas permiso de edición."/></Example>
    <Example id="callback" title="Al limpiar" description="El evento onClear se ejecuta al borrar con el botón o con Escape. Borrar el texto manualmente no cuenta como una limpieza." code={'<ClearableInput\n  label="Filtro de proyectos"\n  value={query}\n  onChange={setQuery}\n  onClear={() => setCleared(count => count + 1)}\n/>'}><ClearableInput label="Filtro de proyectos" value={query} onChange={setQuery} onClear={()=>setCleared(count=>count+1)} placeholder="Escribe y limpia el campo…"/><p className="mk-clearable-count" role="status">Campo limpiado {cleared} {cleared===1?'vez':'veces'}</p></Example>
    <section className="mk-clearable-guidelines"><h2>Buenas prácticas</h2><ul><li>Proporciona una etiqueta visible o un nombre accesible.</li><li>Muestra la acción de limpieza cuando el campo tiene contenido editable.</li><li>Conserva el foco después de borrar para facilitar la siguiente entrada.</li><li>Usa el atajo global de búsqueda en un solo campo por vista.</li></ul></section>
  </article>;
}
