import {CodeDisclosure} from './CodeComponents';
import {type ReactNode} from 'react';
import {Breadcrumbs, type BreadcrumbItem} from './Breadcrumbs';

const items:BreadcrumbItem[]=[{label:'Inicio',href:'/introduction'},{label:'Componentes',href:'/components/button'},{label:'Breadcrumbs'}];
const menuItems:BreadcrumbItem[]=[
  {...items[0],menu:[{label:'Introducción',href:'/introduction'},{label:'Marca MOK',href:'/foundations/brand'}]},
  {...items[1],menu:[{label:'Button',href:'/components/button'},{label:'Avatar',href:'/components/avatar'},{label:'Badge',href:'/components/badge'}]},
  {...items[2],menu:[{label:'Breadcrumbs',href:'/components/breadcrumbs'},{label:'Address Input',href:'/components/address-input'}]},
];

function Example({id,title,description,code,children}:{id:string;title:string;description:string;code:string;children:ReactNode}){
  return <section className="mk-breadcrumb-example" id={id}><h2><a href={`#${id}`}>{title}</a></h2><p>{description}</p><div className="mk-breadcrumb-preview">{children}</div><CodeDisclosure code={code}/></section>;
}

export function BreadcrumbsPage(){
  return <article className="mk-docs-component-page"><header><p className="mk-eyebrow">COMPONENTE</p><h1>Breadcrumbs</h1><p>Indica la ubicación dentro de una jerarquía y facilita el regreso a los niveles anteriores, mediante enlaces o menús.</p></header>

    <Example id="default" title="Predeterminado" description="El recorrido habitual: enlaces a los niveles anteriores y la página actual al final." code={'<Breadcrumbs items={items} />'}><Breadcrumbs items={items} label="Ruta de texto"/></Example>
    <Example id="active" title="Activo" description="El nivel actual se destaca con el peso y color de MOK. Se anuncia como página actual a las tecnologías de asistencia." code={'<Breadcrumbs items={[\n  { label: "Inicio", href: "/introduction" },\n  { label: "Componentes", href: "/components/button" },\n  { label: "Breadcrumbs", active: true }\n]} />'}><Breadcrumbs items={items.map((item,index)=>({...item,active:index===2}))} label="Ruta activa de texto"/></Example>
    <Example id="disabled" title="Deshabilitado" description="Los niveles deshabilitados mantienen el contexto, pero no permiten navegar." code={'<Breadcrumbs items={items} disabled />'}><Breadcrumbs items={items} disabled label="Ruta deshabilitada de texto"/></Example>
    <Example id="menus" title="Con menús (opcional)" description="Para cambiar entre páginas relacionadas. Solo se abre un menú a la vez; se cierra al seleccionar una opción, salir del menú o pulsar Escape." code={'<Breadcrumbs items={menuItems} variant="menu" />'}><Breadcrumbs items={menuItems} variant="menu" label="Ruta con menús"/></Example>
    <section className="mk-breadcrumb-guidelines"><h2>Buenas prácticas</h2><ul><li>Representa la jerarquía del contenido con nombres breves y claros.</li><li>Mantén un solo nivel identificado como página actual.</li><li>Usa enlaces reales para los niveles anteriores y menús para páginas relacionadas.</li><li>Usa Tab para recorrer los controles y Escape para cerrar un menú.</li></ul></section>
  </article>;
}
