import {CodeDisclosure} from './CodeComponents';
import type {ReactNode} from 'react';
import {Label} from './Label';

interface LabelExampleProps {
  id:string;
  title:string;
  description:string;
  code:string;
  children:ReactNode;
}

function Example({id,title,description,code,children}:LabelExampleProps){
  return <section id={id} className="mk-label-example"><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-label-preview">{children}</div><CodeDisclosure code={code}/></section>;
}

export function LabelPage(){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Label</h1><p>Una etiqueta accesible que identifica los controles de un formulario.</p></header>

    <Example id="default" title="Predeterminado" description="Una etiqueta breve y persistente. Por defecto, cada palabra comienza con mayúscula." code={'<Label>Esta es una etiqueta</Label>'}><Label>Esta es una etiqueta</Label></Example>
    <Example id="with-input" title="Con campo" description="Asocia la etiqueta con el id del control. Al pulsarla, el campo recibe el foco." code={'<div className="mk-field">\n  <Label htmlFor="label-email">Correo electrónico</Label>\n  <input id="label-email" type="email" placeholder="nombre@equipo.com" />\n</div>'}><div className="mk-field mk-label-field"><Label htmlFor="label-email">Correo electrónico</Label><input id="label-email" name="label-email" type="email" placeholder="nombre@equipo.com" autoComplete="email"/></div></Example>
    <Example id="bypass-casing" title="Texto original" description="Usa bypassCasing para conservar las mayúsculas y minúsculas del contenido, por ejemplo en nombres propios o texto en sentence case." code={'<div className="mk-field">\n  <Label htmlFor="label-email-original" bypassCasing>Correo electrónico</Label>\n  <input id="label-email-original" type="email" placeholder="nombre@equipo.com" />\n</div>'}><div className="mk-field mk-label-field"><Label htmlFor="label-email-original" bypassCasing>Correo electrónico</Label><input id="label-email-original" name="label-email-original" type="email" placeholder="nombre@equipo.com" autoComplete="email"/></div></Example>
    <section className="mk-label-guidelines"><h2>Buenas prácticas</h2><ul><li>Usa htmlFor con el id único del campo para crear una asociación accesible.</li><li>Mantén visible la etiqueta; el placeholder solo ofrece un ejemplo del dato esperado.</li><li>El estado requerido o deshabilitado pertenece al control del formulario.</li><li>La etiqueta no agrega pasos al recorrido de Tab ni necesita un rol ARIA adicional.</li></ul><p>Label acepta los atributos nativos de label, incluido ref. Importa el componente desde <code>@mokanadev/design-system</code>.</p><a href="https://vercel.com/geist/label" target="_blank" rel="noreferrer">Referencia: Geist Label</a></section>
  </article>;
}
