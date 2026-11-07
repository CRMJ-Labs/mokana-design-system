import {useState} from 'react';
import {Badge,Button,Description,Icon,Modal,PageHeader} from '@mokanadev/design-system';
import type {Project} from '../data';

interface ProjectDetailPageProps {project:Project;onBack:()=>void;onEdit:()=>void;onArchive:()=>void;onDelete:()=>void}

export function ProjectDetailPage({project,onBack,onEdit,onArchive,onDelete}:ProjectDetailPageProps){
  const [deleteOpen,setDeleteOpen]=useState(false);
  return <>
    <button type="button" className="admin-back" onClick={onBack}><Icon name="arrow-left" size={16}/>Volver a proyectos</button>
    <PageHeader eyebrow={`Proyectos / ${project.code}`} title={project.name} description={project.description} actions={<><Button onClick={onEdit}>Editar proyecto</Button><Button variant="secondary" onClick={onArchive}>{project.status==='Archivado'?'Restaurar':'Archivar'}</Button></>}/>
    <section className="admin-detail-summary" aria-label="Resumen del proyecto">
      <Description title="Estado"><Badge size="sm" subtle tone={project.status==='Activo'?'success':project.status==='Pendiente'?'warning':'neutral'}>{project.status}</Badge></Description>
      <Description title="Responsable">{project.owner}</Description><Description title="Código">{project.code}</Description><Description title="Última actualización">{project.updated}</Description>
    </section>
    <div className="admin-detail-grid">
      <section className="admin-panel" aria-labelledby="project-activity"><h2 id="project-activity">Actividad reciente</h2><ol className="admin-activity"><li><Icon name="check" size={16}/><span><strong>Información revisada</strong><small>Hoy, 9:42</small></span></li><li><Icon name="user" size={16}/><span><strong>{project.owner} fue asignado</strong><small>5 nov 2026</small></span></li><li><Icon name="plus" size={16}/><span><strong>Proyecto creado</strong><small>1 nov 2026</small></span></li></ol></section>
      <aside className="admin-panel admin-danger-zone" aria-labelledby="project-danger"><h2 id="project-danger">Zona de riesgo</h2><p>Eliminar el proyecto retira este ejemplo de la sesión local.</p><Button variant="danger-soft" onClick={()=>setDeleteOpen(true)}>Eliminar proyecto</Button></aside>
    </div>
    <Modal open={deleteOpen} onClose={()=>setDeleteOpen(false)} title="Eliminar proyecto" footer={<><Button variant="danger" onClick={()=>{setDeleteOpen(false);onDelete()}}>Eliminar definitivamente</Button><Button variant="ghost" onClick={()=>setDeleteOpen(false)}>Cancelar</Button></>}><p>Vas a eliminar <strong>{project.name}</strong>. En una aplicación real, conecta aquí la confirmación proporcional al impacto.</p></Modal>
  </>;
}
