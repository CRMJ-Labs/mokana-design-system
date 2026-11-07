import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Badge, Brand, Button, Card, DataTable, Icon, Input, Modal, MokProvider, ThemeSwitcher, useToasts} from '@mokanadev/design-system';
import '@mokanadev/design-system/styles.css';
import '@mokanadev/design-system/fonts.css';
import './app.css';

function ProjectApp(){
  return <MokProvider defaultTheme="light" storageKey="mok-consumer-theme" className="consumer-app"><Projects/></MokProvider>;
}

function Projects(){
  const toast=useToasts();
  const [open,setOpen]=useState(false);
  const [projects,setProjects]=useState([{id:1,name:'Portal de clientes'},{id:2,name:'API de pagos'},{id:3,name:'Tienda online'},{id:4,name:'Analytics'}]);
  const [selected,setSelected]=useState<string[]>([]);
  return <main className="consumer-shell">
    <header className="consumer-header"><div><p className="consumer-kicker"><Brand compact/> MOK / Integración de prueba</p><h1>Proyectos del equipo</h1><p>Una aplicación que consume el paquete instalado y define su propio layout.</p></div><ThemeSwitcher/></header>
    <div className="consumer-toolbar"><Badge tone="success">{projects.length} proyectos</Badge><Button prefix="plus" onClick={()=>setOpen(true)}>Nuevo proyecto</Button></div>
    <div className="consumer-grid"><Card title="Actividad del equipo" eyebrow="Espacio de trabajo"><p className="consumer-copy"><Icon name="users" size={20}/> Todos los proyectos en un solo lugar.</p><p>Los colores, controles e iconos vienen de MOK. El espaciado y la distribución pertenecen a esta aplicación.</p></Card>
      <Card title="Integración independiente"><ul className="consumer-checklist"><li>Paquete instalado desde npm pack</li><li>Importaciones públicas y tipos publicados</li><li>Temas, formulario, modal y notificaciones</li></ul></Card></div>
    <DataTable caption="Proyectos" columns={[{key:'name',header:'Nombre',sortValue:project=>project.name,render:project=><span className="consumer-copy"><Icon name="folder" size={18}/>{project.name}</span>},{key:'status',header:'Estado',render:()=> <Badge tone="success" icon="check">Activo</Badge>}]} rows={projects} rowKey={project=>String(project.id)} searchText={project=>project.name} searchLabel="Buscar proyectos" pageSize={4} defaultSort={{key:'name',direction:'asc'}} selection={{selectedKeys:selected,onChange:setSelected,rowLabel:project=>project.name}} selectionActions={<Button type="button" size="sm" variant="ghost" onClick={()=>toast.message(`${selected.length} proyectos seleccionados`)}>Ver selección</Button>}/>
    <Modal open={open} onClose={()=>setOpen(false)} title="Crear proyecto"><form className="consumer-form" onSubmit={event=>{event.preventDefault();const form=event.currentTarget;const name=String(new FormData(form).get('name')??'').trim();if(!name)return;setProjects(current=>[...current,{id:Date.now(),name}]);form.reset();setOpen(false);toast.success('Proyecto creado',{description:name});}}>
      <Input label="Nombre del proyecto" name="name" required maxLength={80} placeholder="Por ejemplo, tienda online" hint="Este nombre será visible para tu equipo."/>
      <div className="consumer-form-actions"><Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancelar</Button><Button type="submit" prefix="check">Crear proyecto</Button></div>
    </form></Modal>
    <footer className="consumer-footer">Prueba local · Sin servicios externos</footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><ProjectApp/></StrictMode>);
