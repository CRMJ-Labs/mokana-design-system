import {useState,type FormEvent} from 'react';
import {Button,Fieldset,FormErrorSummary,FormGrid,FormLayout,Input,PageHeader,Select,Textarea,type FormErrorItem} from '@mokanadev/design-system';
import {owners,type Project,type ProjectStatus} from '../data';

type FormValue=Pick<Project,'name'|'code'|'owner'|'status'|'description'>;
interface ProjectFormPageProps {project?:Project;onCancel:()=>void;onSave:(value:FormValue)=>void}

export function ProjectFormPage({project,onCancel,onSave}:ProjectFormPageProps){
  const [value,setValue]=useState<FormValue>(()=>project??{name:'',code:'',owner:'',status:'Pendiente',description:''});
  const [submitted,setSubmitted]=useState(false);
  const errors={name:value.name.trim()?'':'Escribe un nombre para el proyecto.',code:/^PR-\d{4}$/.test(value.code.trim())?'':'Usa el formato PR-0000.',owner:value.owner?'':'Selecciona una persona responsable.'};
  const invalid=Boolean(errors.name||errors.code||errors.owner);
  const errorItems:FormErrorItem[]=submitted?[errors.name&&{id:'project-name',label:'Nombre',message:errors.name},errors.code&&{id:'project-code',label:'Código',message:errors.code},errors.owner&&{id:'project-owner',label:'Responsable',message:errors.owner}].filter((item):item is FormErrorItem=>Boolean(item)):[];
  function submit(event:FormEvent){event.preventDefault();setSubmitted(true);if(invalid)return;onSave({...value,name:value.name.trim(),code:value.code.trim().toUpperCase(),description:value.description.trim()})}
  return <>
    <PageHeader eyebrow={`Proyectos / ${project?'Editar':'Crear'}`} title={project?'Editar proyecto':'Nuevo proyecto'} description={project?'Actualiza la información operativa sin perder el contexto del proyecto.':'Registra la información mínima para que el equipo pueda comenzar.'}/>
    <FormLayout className="admin-form" onSubmit={submit} noValidate feedback={<FormErrorSummary errors={errorItems}/>} actions={<><Button type="submit">{project?'Guardar cambios':'Crear proyecto'}</Button><Button variant="ghost" onClick={onCancel}>Cancelar</Button></>}>
      <Fieldset title="Información general" description="Identifica el proyecto con un nombre y un código estable.">
        <FormGrid><Input id="project-name" label="Nombre" value={value.name} onValueChange={name=>setValue({...value,name})} error={submitted?errors.name:undefined} required/><Input id="project-code" label="Código" value={value.code} onValueChange={code=>setValue({...value,code})} hint="Formato PR-0000" error={submitted?errors.code:undefined} required/></FormGrid>
        <Textarea label="Descripción" value={value.description} onValueChange={description=>setValue({...value,description})} maxLength={240} showCount hint="Explica el resultado esperado, no la lista de tareas."/>
      </Fieldset>
      <Fieldset title="Gestión" description="Define quién responde por el proyecto y su estado inicial.">
        <FormGrid><Select id="project-owner" label="Responsable" value={value.owner} onValueChange={owner=>setValue({...value,owner})} error={submitted?errors.owner:undefined} required options={[{value:'',label:'Selecciona una persona',disabled:true},...owners.map(owner=>({value:owner,label:owner}))]}/><Select label="Estado" value={value.status} onValueChange={status=>setValue({...value,status:status as ProjectStatus})} options={['Pendiente','Activo','Archivado'].map(status=>({value:status,label:status}))}/></FormGrid>
      </Fieldset>
    </FormLayout>
  </>;
}
