import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Badge,Banner,Button,Card,Checkbox,Error,Input,Modal,Note,PaletteProvider,ProgressBar,Select,ThemeProvider,ThemeSwitcher,ToastProvider,useToasts} from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css';
import {appPalettes,defaultAppPalette,type AppPaletteName} from './palette';
import './palette-preview.css';

function Showcase(){
  const [name,setName]=useState<AppPaletteName>(defaultAppPalette);
  return <PaletteProvider palette={appPalettes[name]} className="palette-showcase" data-testid="palette-root"><ToastProvider><Samples name={name} onChange={setName}/></ToastProvider></PaletteProvider>;
}
function Samples({name,onChange}:{name:AppPaletteName;onChange:(name:AppPaletteName)=>void}){
  const toast=useToasts();const [open,setOpen]=useState(false);
  return <main className="palette-shell"><header><div><h1>Una paleta. Todo el sistema.</h1><p>Cambia la identidad y el tema para comprobar los mismos componentes.</p></div><ThemeSwitcher/></header>
    <Select label="Paleta" value={name} onValueChange={value=>onChange(value as AppPaletteName)} options={[{value:'mok',label:'MOK'},{value:'forest',label:'Verde'},{value:'ocean',label:'Ocean · Azul'}]}/>
    <section className="palette-grid" aria-label="Componentes con la paleta de la aplicación"><Card title="Acciones y estados"><div className="palette-row"><Button onClick={()=>setOpen(true)}>Abrir modal</Button><Button variant="secondary">Secundario</Button><Button variant="error">Eliminar</Button><Button variant="warning">Advertencia</Button></div><div className="palette-row">{(['brand','success','warning','error','info'] as const).map(tone=><Badge key={tone} tone={tone}>{tone}</Badge>)}</div><div className="palette-row">{(['brand','success','warning','error','info'] as const).map(tone=><Badge key={tone} tone={tone} subtle>{tone}</Badge>)}</div></Card>
    <Card title="Formularios"><Input label="Nombre" placeholder="Escribe un nombre"/><Input label="Correo" error="Introduce un correo válido" defaultValue="correo incompleto"/><Checkbox label="Recibir novedades" defaultChecked/><ProgressBar value={65} label="Progreso"/><Error>La operación necesita revisión.</Error></Card></section>
    <Banner title="Marca" tone="brand">Un aviso con la identidad de tu producto.</Banner>
    <Banner title="Acento" tone="accent">Los contrastes también se adaptan.</Banner>
    <Note tone="success" filled>Los cambios se guardaron correctamente.</Note>
    <div className="palette-row"><Button variant="secondary" onClick={()=>toast.success('Guardado correctamente')}>Mostrar toast</Button><a href="/">Ver la aplicación consumidora</a></div>
    <section aria-label="Paleta independiente"><h2>Otra aplicación en la misma página</h2><PaletteProvider palette={appPalettes.ocean} className="palette-nested" data-testid="nested-palette"><Button>Acción de Ocean</Button><p>Esta sección conserva su propia paleta.</p></PaletteProvider></section>
    <Modal open={open} onClose={()=>setOpen(false)} title="Modal con la paleta activa"><p>Este diálogo hereda los colores de la aplicación.</p><Button onClick={()=>setOpen(false)}>Entendido</Button></Modal>
  </main>;
}
createRoot(document.getElementById('root')!).render(<ThemeProvider defaultTheme="light" storageKey="mok-palette-preview-theme"><Showcase/></ThemeProvider>);
