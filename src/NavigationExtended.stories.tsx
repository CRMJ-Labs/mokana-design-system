import React,{useState} from 'react';
import type {Meta,StoryObj} from '@storybook/react-vite';
import {Avatar,Breadcrumbs,DropdownMenu,Pagination,Tabs} from './advanced-components';
const meta={title:'Components/Navigation · Extended',parameters:{layout:'padded'}} satisfies Meta;
export default meta; type Story=StoryObj<typeof meta>;
export const TabsExample:Story={render:()=>{const [active,setActive]=useState('overview');return <div className="mk-stack"><Tabs active={active} onChange={setActive} tabs={[{id:'overview',label:'Resumen'},{id:'activity',label:'Actividad'},{id:'settings',label:'Configuración'}]}/><p>Contenido de <strong>{active}</strong></p></div>}};
export const BreadcrumbsExample:Story={render:()=> <Breadcrumbs items={[{label:'Inicio',href:'#'},{label:'Proyectos',href:'#'},{label:'Portal de clientes'}]}/>};
export const PaginationExample:Story={render:()=>{const [page,setPage]=useState(3);return <Pagination page={page} pages={8} onChange={setPage}/>}};
export const MenuAndAvatars:Story={render:()=> <div className="mk-row"><DropdownMenu label="Acciones" items={[{label:'Editar',icon:'plus'},{label:'Duplicar',icon:'arrow'},{label:'Eliminar',icon:'warning',danger:true}]}/><Avatar name="Ana Torres" size="sm" status="online"/><Avatar name="Carlos Ruiz" status="away"/><Avatar name="Laura Gómez" size="lg" status="offline"/></div>};
