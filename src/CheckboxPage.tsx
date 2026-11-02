import {CodeDisclosure} from './CodeComponents';
import {useState, type ReactNode} from 'react';
import {Checkbox} from './Checkbox';

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){return <section id={id} className="mk-checkbox-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-checkbox-preview">{children}</div><CodeDisclosure code={code}/></section>;}

export function CheckboxPage(){
  const [checked,setChecked]=useState(false);
  const [selected,setSelected]=useState(['Diseño']);
  const options=['Diseño','Desarrollo','Contenido'];
  const all=selected.length===options.length;
  const partial=selected.length>0&&!all;
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Checkbox</h1><p>Selecciona una o varias opciones de una lista. Permite marcar, desmarcar y representar una selección parcial.</p></header>
    <nav className="mk-checkbox-index" aria-label="Secciones de Checkbox"><a href="#default">Predeterminado</a><a href="#disabled">Deshabilitado</a><a href="#indeterminate">Indeterminado</a></nav>
    <Example id="default" title="Predeterminado" description="Haz clic en la casilla o en su etiqueta. También puedes enfocarla con Tab y cambiar la selección con Espacio." code={'<Checkbox\n  label="Recibir novedades del proyecto"\n  checked={checked}\n  onChange={setChecked}\n/>'}><Checkbox label="Recibir novedades del proyecto" checked={checked} onChange={setChecked} description="Actualizaciones del equipo de MOK."/></Example>
    <Example id="disabled" title="Deshabilitado" description="Los estados deshabilitados conservan su valor y explican por qué no están disponibles." code={'<Checkbox label="Sin seleccionar" disabled />\n<Checkbox label="Seleccionado" checked disabled />\n<Checkbox label="Selección parcial" indeterminate disabled />'}><Checkbox label="Sin seleccionar" disabled description="Requiere permiso de edición." title="Requiere permiso de edición."/><Checkbox label="Seleccionado" checked disabled description="Definido por el administrador." title="Definido por el administrador."/><Checkbox label="Selección parcial" indeterminate disabled description="Gestionado por tu organización." title="Gestionado por tu organización."/></Example>
    <Example id="indeterminate" title="Indeterminado" description="La selección parcial se deriva de las opciones hijas. Al seleccionar todas o ninguna, el estado indeterminado desaparece." code={'<Checkbox\n  label="Seleccionar todo"\n  checked={selected.length === options.length}\n  indeterminate={selected.length > 0 && selected.length < options.length}\n  onChange={checked => setSelected(checked ? options : [])}\n/>'}>
      <fieldset className="mk-checkbox-fieldset"><legend>Áreas del proyecto</legend><Checkbox label="Seleccionar todo" checked={all} indeterminate={partial} onChange={value=>setSelected(value?[...options]:[])} aria-describedby="checkbox-selection-count"/><div className="mk-checkbox-children">{options.map(option=><Checkbox key={option} label={option} checked={selected.includes(option)} onChange={value=>setSelected(previous=>value?[...previous,option]:previous.filter(item=>item!==option))}/>)}</div><p className="mk-checkbox-selection" id="checkbox-selection-count" role="status">{selected.length} de {options.length} seleccionadas</p></fieldset>
    </Example>
    <section className="mk-checkbox-guidelines"><h2>Buenas prácticas</h2><ul><li>Usa Checkbox para selección múltiple o para aceptar una condición explícita.</li><li>Para activar una configuración inmediata, utiliza Toggle.</li><li>Agrupa opciones relacionadas con fieldset y legend.</li><li>El estado indeterminado representa una selección parcial, no un tercer valor.</li><li>Explica por qué una opción está deshabilitada.</li></ul></section>
  </article>;
}
