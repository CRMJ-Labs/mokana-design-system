import {CodeDisclosure} from './CodeComponents';
import {type ReactNode} from 'react';
import {Badge, Pill, type BadgeTone} from './components';

const variants:{tone:BadgeTone;label:string}[]=[
  {tone:'neutral',label:'Borrador'},
  {tone:'brand',label:'MOK'},
  {tone:'info',label:'Información'},
  {tone:'success',label:'Activo'},
  {tone:'warning',label:'Pendiente'},
  {tone:'error',label:'Error'},
  {tone:'inverted',label:'Destacado'},
];

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section className="mk-badge-example" id={id}><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-badge-preview">{children}</div><CodeDisclosure code={code}/></section>;
}

export function BadgePage(){
  return <article className="mk-docs-component-page mk-badge-page">
    <header><p className="mk-eyebrow">COMPONENTE</p><h1>Badge</h1><p>Una etiqueta breve para destacar un estado, clasificar contenido o aportar contexto junto a un elemento.</p></header>

    <Example id="variants" title="Variantes" description="Tonos de MOK para estados y categorías. Cada variante incluye una versión suave para superficies con mayor densidad." code={'<Badge tone="brand" icon={false}>MOK</Badge>\n<Badge tone="info" subtle icon={false}>Información</Badge>\n<Badge tone="success" icon={false}>Activo</Badge>'}>
      <div className="mk-badge-variant-grid">{variants.map(({tone,label})=><div className="mk-badge-variant-row" key={tone}><Badge tone={tone} icon={false}>{label}</Badge><Badge tone={tone} subtle icon={false}>{label}</Badge></div>)}</div>
    </Example>
    <Example id="sizes" title="Tamaños" description="Tres tamaños para ajustar la etiqueta al texto y al espacio disponible." code={'<Badge size="sm">Pequeño</Badge>\n<Badge size="md">Mediano</Badge>\n<Badge size="lg">Grande</Badge>'}><Badge size="sm">Pequeño</Badge><Badge size="md">Mediano</Badge><Badge size="lg">Grande</Badge></Example>
    <Example id="icons" title="Con iconos" description="Añade un icono al inicio o al final cuando aporta contexto. El texto mantiene el significado sin depender del color." code={'<Badge tone="brand" icon="plus">Nuevo</Badge>\n<Badge tone="info" subtle icon="info">Información</Badge>\n<Badge icon="arrow" iconPosition="end">Siguiente</Badge>'}><Badge tone="brand" icon="plus">Nuevo</Badge><Badge tone="info" icon="info" subtle>Información</Badge><Badge tone="success" icon="check">Completado</Badge><Badge tone="warning" icon="warning">Revisión</Badge><Badge tone="error" icon="warning">Error</Badge><Badge icon="arrow" iconPosition="end">Siguiente</Badge></Example>
    <Example id="pill" title="Pill" description="Un enlace compacto con el aspecto de una etiqueta para acciones de navegación secundarias." code={'<Pill href="/components/avatar" tone="brand">Avatar</Pill>\n<Pill href="/foundations/brand" subtle>Conocer MOK</Pill>'}><Pill href="/components/avatar" tone="brand" size="sm">Avatar</Pill><Pill href="/foundations/brand" subtle>Conocer MOK</Pill><Pill href="/components/button" tone="inverted" size="lg">Ver botones</Pill></Example>
    <section className="mk-badge-guidelines" id="best-practices"><h2>Buenas prácticas</h2><ul><li>Usa etiquetas cortas junto al elemento que describen: estado, rol o categoría.</li><li>Elige tonos de forma consistente y acompaña siempre el color con texto.</li><li>Usa Badge para información y Pill para enlaces; una acción utiliza Button.</li><li>Evita acumular etiquetas o iconos que compitan por atención.</li><li>Usa variantes suaves cuando necesites reducir el énfasis visual.</li></ul></section>
  </article>;
}
