export type ProjectStatus='Activo'|'Pendiente'|'Archivado';

export interface Project {
  id:string;
  name:string;
  code:string;
  owner:string;
  status:ProjectStatus;
  updated:string;
  description:string;
}

export const initialProjects:Project[]=[
  {id:'1',name:'Portal de clientes',code:'PR-1042',owner:'Ana Torres',status:'Activo',updated:'6 nov 2026',description:'Centraliza solicitudes, documentos y seguimiento para clientes.'},
  {id:'2',name:'Centro de operaciones',code:'PR-1088',owner:'Carlos Ruiz',status:'Pendiente',updated:'5 nov 2026',description:'Reúne indicadores y tareas prioritarias del equipo de operaciones.'},
  {id:'3',name:'Renovación de marca',code:'PR-1116',owner:'Laura Gómez',status:'Activo',updated:'3 nov 2026',description:'Actualiza la identidad y los puntos de contacto principales.'},
  {id:'4',name:'Archivo histórico',code:'PR-1164',owner:'Diego Peña',status:'Archivado',updated:'28 oct 2026',description:'Conserva entregables y decisiones de proyectos completados.'},
];

export const owners=['Ana Torres','Carlos Ruiz','Laura Gómez','Diego Peña'];
