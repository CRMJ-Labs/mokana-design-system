import React,{useState} from 'react';
import type {Meta,StoryObj} from '@storybook/react-vite';
import {Checkbox,Combobox,DatePicker,FileUpload,Radio,Textarea} from './advanced-components';
const meta={title:'Components/Form Controls · Extended',parameters:{layout:'padded'}} satisfies Meta;
export default meta; type Story=StoryObj<typeof meta>;
export const CheckboxAndRadio:Story={render:()=>{const [checked,setChecked]=useState(true);const [plan,setPlan]=useState('pro');return <div className="mk-stack"><Checkbox label="Recordarme" description="Mantener la sesión iniciada" checked={checked} onChange={setChecked}/><Checkbox label="Selección mixta" description="Parte del grupo está seleccionada"/><Radio label="Plan básico" checked={plan==='basic'} onChange={()=>setPlan('basic')}/><Radio label="Plan profesional" checked={plan==='pro'} onChange={()=>setPlan('pro')}/></div>}};
export const TextAreas:Story={render:()=> <div className="mk-grid"><Textarea label="Descripción" hint="Explica la necesidad principal" placeholder="Escribe aquí…" maxLength={240} showCount/><Textarea label="Comentarios" defaultValue="Contenido que necesita revisión" error="Revisa este contenido antes de continuar."/></div>};
export const DateAndCombobox:Story={render:()=>{const [owner,setOwner]=useState('');return <div className="mk-grid"><DatePicker label="Fecha de entrega"/><Combobox label="Responsable" value={owner} onChange={setOwner} options={['Ana Torres','Carlos Ruiz','Laura Gómez']}/></div>}};
export const Upload:Story={render:()=> <FileUpload label="Arrastra o selecciona un archivo" hint="PNG, JPG o PDF · máximo 10 MB"/>};
