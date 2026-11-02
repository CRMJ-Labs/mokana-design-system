import {useMemo,useState,type CSSProperties} from 'react';
import {Badge,Button,Card,Input,Modal} from './components';
import {ProgressBar} from './advanced-components';
import {Switch} from './Toggle';
import {createPalette,mokPalette} from './palette';
import {PaletteProvider} from './PaletteProvider';
import {ThemeProvider,ThemeSwitcher} from './ThemeSwitcher';
import {ToastProvider,useToasts} from './Toast';
import {CodeDisclosure} from './CodeComponents';
import './themes-documentation.css';

const presets=[{name:'MOK',color:'#7557ff'},{name:'Verde',color:'#15803d'},{name:'Azul',color:'#0369a1'},{name:'Rosa',color:'#be185d'},{name:'Naranja',color:'#c2410c'},{name:'Turquesa',color:'#0f766e'}];
export function ProductThemes(){
  const [selected,setSelected]=useState('MOK');const [custom,setCustom]=useState('#7c3aed');
  const seed=presets.find(item=>item.name===selected)?.color??custom;
  const palette=useMemo(()=>selected==='MOK'?mokPalette:createPalette({brand:seed}),[selected,seed]);
  const code=`import { createPalette, PaletteProvider, ThemeProvider, ToastProvider${selected==='MOK'?', mokPalette':''} } from '@mokanadev/design-system';\nimport '@mokanadev/design-system/styles.css';\n\nconst appPalette = ${selected==='MOK'?'mokPalette':`createPalette({ brand: '${seed}' })`};\n\n<ThemeProvider defaultTheme="system" storageKey="my-app-theme">\n  <PaletteProvider palette={appPalette}>\n    <ToastProvider><YourApp /></ToastProvider>\n  </PaletteProvider>\n</ThemeProvider>`;
  return <div className="mk-container mk-stack mk-product-themes"><header><p className="mk-eyebrow">05 / PRODUCT THEMES</p><h1>Una base. Tu identidad.</h1><p>Elige una paleta para probar los mismos componentes con otra identidad. Cambia entre claro y oscuro dentro de la vista previa.</p></header>
    <section aria-labelledby="palette-lab-title" className="mk-theme-lab"><h2 id="palette-lab-title">Prueba las paletas</h2><p>Una sola configuración adapta acciones, selección, foco y gráficas. Éxito, advertencia y error conservan su significado.</p>
      <fieldset className="mk-palette-options"><legend>Paleta de prueba</legend>{presets.map(item=><label key={item.name} className="mk-palette-option" style={{'--swatch':item.color} as CSSProperties}><input type="radio" name="product-palette" value={item.name} checked={selected===item.name} onChange={()=>setSelected(item.name)}/><span className="mk-palette-dot" aria-hidden="true"/><span>{item.name}</span></label>)}</fieldset>
      <div className="mk-palette-custom"><label htmlFor="product-brand-color">Color personalizado</label><input id="product-brand-color" type="color" value={custom} onChange={event=>{setCustom(event.target.value);setSelected('Personalizado');}}/><code>{selected==='Personalizado'?custom:seed}</code><Button variant="ghost" size="sm" onClick={()=>setSelected('Personalizado')}>Usar personalizado</Button><span role="status" aria-live="polite">Paleta activa: {selected}</span></div>
      <ThemeProvider defaultTheme="light" storageKey={null}><PaletteProvider palette={palette} className="mk-palette-preview" data-testid="theme-palette-preview"><ToastProvider><Preview name={selected}/></ToastProvider></PaletteProvider></ThemeProvider>
    </section>
    <section className="mk-section"><h2>Úsala en tu aplicación</h2><p>Define la paleta una vez y envuelve tu aplicación con PaletteProvider dentro de ThemeProvider. El código se actualiza con tu elección.</p><CodeDisclosure label="Ver código de la paleta seleccionada" code={code}/><p>También puedes configurar accent, neutral, success, warning, error e info en el mismo objeto. Las semillas aceptan colores hexadecimales; MOK ajusta la luminosidad y el texto para mantener legibilidad en ambos temas.</p><a href="/integration#palette">Consultar la guía de integración de paletas</a></section>
  </div>;
}
function Preview({name}:{name:string}){
  const toast=useToasts();const [checked,setChecked]=useState(true);const [open,setOpen]=useState(false);
  return <><header className="mk-palette-preview-header"><div><p className="mk-eyebrow">VISTA PREVIA · {name}</p><h3>Tu espacio de trabajo</h3><p>Componentes reales de MOK, una identidad compartida.</p></div><ThemeSwitcher small label="Tema de la vista previa"/></header>
    <div className="mk-palette-preview-grid"><Card title="Acciones y estados"><div className="mk-palette-row"><Button prefix="plus" onClick={()=>setOpen(true)}>Crear proyecto</Button><Button variant="secondary" onClick={()=>toast.success('Cambios guardados',{description:'La notificación también hereda la paleta.'})}>Guardar cambios</Button></div><div className="mk-palette-row"><Badge tone="brand">Marca</Badge><Badge tone="success" subtle icon="check">Completado</Badge><Badge tone="warning" subtle>Pendiente</Badge><Badge tone="error" subtle>Error</Badge></div><Input label="Nombre del proyecto" placeholder="Tu próximo proyecto"/><Switch label="Notificaciones" checked={checked} onCheckedChange={setChecked}/></Card>
    <Card title="Actividad del equipo"><p className="mk-palette-metric">128 <span>proyectos activos</span></p><div className="mk-palette-mini-chart" role="img" aria-label="Actividad ilustrativa de seis semanas: 35, 58, 42, 76, 65 y 92"><span style={{height:'35%'}}/><span style={{height:'58%'}}/><span style={{height:'42%'}}/><span style={{height:'76%'}}/><span style={{height:'65%'}}/><span style={{height:'92%'}}/></div><ProgressBar value={72} label="Objetivo del mes"/><div className="mk-palette-selected"><span>Proyecto seleccionado</span><Badge tone="brand" subtle>Activo</Badge></div></Card></div>
    <Modal open={open} onClose={()=>setOpen(false)} title="Crear proyecto"><form className="mk-palette-form" onSubmit={event=>{event.preventDefault();setOpen(false);toast.success('Proyecto creado');}}><Input label="Nombre" required placeholder="Por ejemplo, portal de clientes"/><Button type="submit" prefix="check">Crear</Button></form></Modal>
  </>;
}
