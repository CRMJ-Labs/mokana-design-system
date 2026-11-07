import {useState,type FormEvent} from 'react';
import {Button,Fieldset,Input,PageHeader,Select,Toggle} from '@mokanadev/design-system';

interface SettingsPageProps {onSave:()=>void}

export function SettingsPage({onSave}:SettingsPageProps){
  const [workspace,setWorkspace]=useState('MOK Operaciones');
  const [locale,setLocale]=useState('es-CO');
  const [notifications,setNotifications]=useState(true);
  const [digest,setDigest]=useState(false);
  function submit(event:FormEvent){event.preventDefault();onSave()}
  return <>
    <PageHeader eyebrow="Administración / Configuración" title="Configuración" description="Administra preferencias compartidas y notificaciones del espacio."/>
    <form className="admin-form" onSubmit={submit}>
      <Fieldset title="Espacio de trabajo" description="Estos valores identifican la organización en la plataforma.">
        <div className="admin-form-grid"><Input label="Nombre del espacio" value={workspace} onValueChange={setWorkspace} required/><Select label="Idioma y formato" value={locale} onValueChange={setLocale} options={[{value:'es-CO',label:'Español (Colombia)'},{value:'es-MX',label:'Español (México)'},{value:'en-US',label:'English (United States)'}]}/></div>
      </Fieldset>
      <Fieldset title="Notificaciones" description="Cada persona puede ajustar después sus preferencias individuales.">
        <Toggle label="Actividad importante" description="Avisar sobre cambios de estado y responsables." checked={notifications} onCheckedChange={setNotifications}/><Toggle label="Resumen semanal" description="Enviar un resumen cada lunes al equipo." checked={digest} onCheckedChange={setDigest}/>
      </Fieldset>
      <footer className="admin-form-actions"><Button type="submit">Guardar configuración</Button></footer>
    </form>
  </>;
}
