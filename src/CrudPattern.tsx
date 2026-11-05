import {useMemo,useState,type FormEvent} from 'react';
import {AdminTable} from './AdminTable';
import {AppShell,ContentContainer,FilterBar,PageHeader,PageToolbar} from './ApplicationLayout';
import {Alert,Badge,Button,Modal,Select,type Column} from './components';
import {Input} from './Input';
import './crud-pattern.css';

type EquipmentStatus='Activo'|'Mantenimiento'|'Inactivo';
type ValidationStatus='Validada'|'Pendiente'|'No validada';
type Equipment={
  id:string;
  name:string;
  category:string;
  owner:string;
  status:EquipmentStatus;
  validation:ValidationStatus;
  updatedAt:string;
};
type EditorValues=Pick<Equipment,'id'|'name'|'category'|'owner'|'status'|'validation'>;

const initialEquipment:Equipment[]=[
  {id:'EQ-001',name:'Tolva de recepción',category:'Recepción',owner:'Operaciones',status:'Activo',validation:'No validada',updatedAt:'05 nov 2026'},
  {id:'EQ-002',name:'Banda transportadora',category:'Transporte',owner:'Mantenimiento',status:'Activo',validation:'Pendiente',updatedAt:'03 nov 2026'},
  {id:'EQ-003',name:'Mezclador industrial',category:'Proceso',owner:'Producción',status:'Mantenimiento',validation:'Validada',updatedAt:'29 oct 2026'},
  {id:'EQ-004',name:'Empacadora automática',category:'Empaque',owner:'Producción',status:'Inactivo',validation:'Validada',updatedAt:'18 oct 2026'},
];
const blankEditor:EditorValues={id:'',name:'',category:'Proceso',owner:'Operaciones',status:'Activo',validation:'Pendiente'};
const statusOptions=[{value:'all',label:'Todos los estados'},...(['Activo','Mantenimiento','Inactivo'] as const).map(value=>({value,label:value}))];
const validationOptions=[{value:'all',label:'Todas las fichas'},...(['Validada','Pendiente','No validada'] as const).map(value=>({value,label:value}))];
const categoryOptions=['Recepción','Transporte','Proceso','Empaque'].map(value=>({value,label:value}));
const ownerOptions=['Operaciones','Mantenimiento','Producción'].map(value=>({value,label:value}));

function statusTone(status:EquipmentStatus){return status==='Activo'?'success':status==='Mantenimiento'?'warning':'neutral';}
function validationTone(status:ValidationStatus){return status==='Validada'?'success':status==='No validada'?'error':'warning';}

export function CrudPattern(){
  const [rows,setRows]=useState(initialEquipment);
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('all');
  const [validation,setValidation]=useState('all');
  const [selected,setSelected]=useState<string[]>([]);
  const [editor,setEditor]=useState<EditorValues|null>(null);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [viewing,setViewing]=useState<Equipment|null>(null);
  const [deleting,setDeleting]=useState<Equipment|null>(null);
  const [errors,setErrors]=useState<Partial<Record<'id'|'name',string>>>({});
  const [notice,setNotice]=useState('');

  const filtered=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase('es');
    return rows.filter(row=>(!normalized||`${row.id} ${row.name} ${row.owner}`.toLocaleLowerCase('es').includes(normalized))&&(status==='all'||row.status===status)&&(validation==='all'||row.validation===validation));
  },[rows,query,status,validation]);
  const activeFilterCount=Number(status!=='all')+Number(validation!=='all');
  const columns:Column<Equipment>[]=[
    {key:'equipment',header:'Equipo',minWidth:210,responsivePriority:'primary',sortValue:row=>row.name,render:row=><span className="mk-crud-identity"><strong>{row.name}</strong><small>{row.id}</small></span>},
    {key:'category',header:'Categoría',minWidth:120,responsivePriority:'tertiary',sortValue:row=>row.category,render:row=>row.category},
    {key:'owner',header:'Responsable',minWidth:140,responsivePriority:'tertiary',sortValue:row=>row.owner,render:row=>row.owner},
    {key:'validation',header:'Ficha técnica',minWidth:130,responsivePriority:'secondary',render:row=><Badge size="sm" tone={validationTone(row.validation)} subtle>{row.validation}</Badge>},
    {key:'status',header:'Estado',minWidth:120,responsivePriority:'secondary',sortValue:row=>row.status,render:row=><Badge size="sm" tone={statusTone(row.status)} subtle>{row.status}</Badge>},
    {key:'updated',header:'Actualización',minWidth:120,responsivePriority:'tertiary',render:row=>row.updatedAt},
  ];
  function openCreate(){setEditingId(null);setEditor({...blankEditor,id:`EQ-${String(rows.length+1).padStart(3,'0')}`});setErrors({});}
  function openEdit(row:Equipment){setEditingId(row.id);setEditor({...row});setErrors({});}
  function closeEditor(){setEditor(null);setEditingId(null);setErrors({});}
  function save(event:FormEvent){
    event.preventDefault();
    if(!editor)return;
    const nextErrors:typeof errors={};
    if(!editor.id.trim())nextErrors.id='Escribe un código.';
    else if(rows.some(row=>row.id.toLocaleLowerCase()===editor.id.trim().toLocaleLowerCase()&&row.id!==editingId))nextErrors.id='Este código ya está en uso.';
    if(!editor.name.trim())nextErrors.name='Escribe un nombre.';
    if(Object.keys(nextErrors).length){setErrors(nextErrors);return;}
    const record:Equipment={...editor,id:editor.id.trim().toLocaleUpperCase(),name:editor.name.trim(),updatedAt:'Ahora'};
    if(editingId){setRows(current=>current.map(row=>row.id===editingId?record:row));setNotice(`${record.name} fue actualizado.`);}
    else{setRows(current=>[record,...current]);setNotice(`${record.name} fue creado.`);}
    closeEditor();
  }
  function remove(row:Equipment){setRows(current=>current.filter(item=>item.id!==row.id));setSelected(current=>current.filter(id=>id!==row.id));setDeleting(null);setNotice(`${row.name} fue eliminado.`);}
  function clearFilters(){setQuery('');setStatus('all');setValidation('all');}
  function resetDemo(){setRows(initialEquipment);setSelected([]);clearFilters();setNotice('Datos de demostración restablecidos.');}
  function deactivateSelected(){
    setRows(current=>current.map(row=>selected.includes(row.id)?{...row,status:'Inactivo',updatedAt:'Ahora'}:row));
    setNotice(`${selected.length} ${selected.length===1?'equipo fue desactivado':'equipos fueron desactivados'}.`);setSelected([]);
  }
  return <article className="mk-crud-pattern">
    <AppShell mainId="crud-pattern-main" header={<div className="mk-crud-product-header"><strong>MOK Operaciones</strong><span>milton@empresa.com</span></div>} sidebar={<nav className="mk-crud-sidebar" aria-label="Administración"><strong>Administración</strong><a aria-current="page" href="#crud-pattern-main">Equipos</a><a href="#crud-pattern-main">Proyectos</a><a href="#crud-pattern-main">Usuarios</a></nav>}>
      <ContentContainer size="wide">
        <PageHeader eyebrow="Inventario" title="Catálogo de equipos" description="Crea, consulta y mantiene los equipos operativos desde una sola vista." actions={<Button prefix="plus" onClick={openCreate}>Nuevo equipo</Button>}/>
        {notice&&<Alert tone="success" title={notice}>Los cambios viven únicamente en esta demostración.</Alert>}
        <PageToolbar actions={<><span className="mk-crud-result-count" role="status">{filtered.length} de {rows.length} equipos</span><Button variant="ghost" size="sm" onClick={resetDemo}>Restablecer</Button></>}>
          <Input label="Buscar por código, nombre o responsable" search value={query} onValueChange={setQuery} onClear={()=>setQuery('')} placeholder="Buscar equipos…" rootProps={{className:'mk-crud-search'}}/>
        </PageToolbar>
        <FilterBar actions={<Button variant="ghost" size="sm" disabled={!query&&!activeFilterCount} onClick={clearFilters}>Limpiar filtros</Button>} activeFilters={activeFilterCount?<><span>Filtros activos:</span>{status!=='all'&&<Badge size="sm" subtle>{status}</Badge>}{validation!=='all'&&<Badge size="sm" subtle>{validation}</Badge>}</>:undefined}>
          <Select label="Estado" value={status} options={statusOptions} onValueChange={setStatus}/>
          <Select label="Ficha técnica" value={validation} options={validationOptions} onValueChange={setValidation}/>
        </FilterBar>
        <AdminTable caption="Equipos registrados" rows={filtered} columns={columns} rowKey={row=>row.id} defaultSort={{key:'equipment',direction:'asc'}} empty={<div><strong>No encontramos equipos.</strong><p>Ajusta los filtros o crea un registro nuevo.</p><Button size="sm" onClick={openCreate}>Nuevo equipo</Button></div>} selection={{selectedKeys:selected,onChange:setSelected,rowLabel:row=>row.name}} toolbar={selected.length?<div className="mk-crud-bulk"><strong>{selected.length} seleccionados</strong><Button size="sm" variant="secondary" onClick={deactivateSelected}>Desactivar selección</Button><Button size="sm" variant="ghost" onClick={()=>setSelected([])}>Limpiar selección</Button></div>:undefined} footer={<span>{filtered.length} registros visibles</span>} rowActionLabel={row=>`Acciones de ${row.name}`} rowActions={row=>[
          {id:'view',label:'Ver detalles',onSelect:()=>setViewing(row)},
          {id:'edit',label:'Editar equipo',onSelect:()=>openEdit(row)},
          {id:'toggle',label:row.status==='Activo'?'Desactivar':'Activar',onSelect:()=>{setRows(current=>current.map(item=>item.id===row.id?{...item,status:row.status==='Activo'?'Inactivo':'Activo',updatedAt:'Ahora'}:item));setNotice(`${row.name} cambió de estado.`);}},
          {id:'delete',label:'Eliminar equipo',danger:true,onSelect:()=>setDeleting(row)},
        ]}/>
        <p className="mk-crud-demo-note">Prueba de integración local: los cambios se reinician al recargar la página.</p>
      </ContentContainer>
    </AppShell>

    <Modal open={!!editor} onClose={closeEditor} title={editingId?'Editar equipo':'Nuevo equipo'}>
      {editor&&<form className="mk-crud-form" onSubmit={save} noValidate>
        <Input label="Código" required autoFocus={!editingId} value={editor.id} error={errors.id} onValueChange={id=>setEditor({...editor,id})}/>
        <Input label="Nombre del equipo" required autoFocus={!!editingId} value={editor.name} error={errors.name} onValueChange={name=>setEditor({...editor,name})}/>
        <Select label="Categoría" value={editor.category} options={categoryOptions} onValueChange={category=>setEditor({...editor,category})}/>
        <Select label="Responsable" value={editor.owner} options={ownerOptions} onValueChange={owner=>setEditor({...editor,owner})}/>
        <Select label="Estado" value={editor.status} options={statusOptions.slice(1)} onValueChange={status=>setEditor({...editor,status:status as EquipmentStatus})}/>
        <Select label="Ficha técnica" value={editor.validation} options={validationOptions.slice(1)} onValueChange={validation=>setEditor({...editor,validation:validation as ValidationStatus})}/>
        <footer className="mk-crud-form-actions"><Button type="submit">{editingId?'Guardar cambios':'Crear equipo'}</Button><Button variant="ghost" onClick={closeEditor}>Cancelar</Button></footer>
      </form>}
    </Modal>
    <Modal open={!!viewing} onClose={()=>setViewing(null)} title="Detalle del equipo" footer={<Button onClick={()=>setViewing(null)}>Cerrar</Button>}>
      {viewing&&<dl className="mk-crud-details"><div><dt>Código</dt><dd>{viewing.id}</dd></div><div><dt>Nombre</dt><dd>{viewing.name}</dd></div><div><dt>Categoría</dt><dd>{viewing.category}</dd></div><div><dt>Responsable</dt><dd>{viewing.owner}</dd></div><div><dt>Estado</dt><dd>{viewing.status}</dd></div><div><dt>Ficha técnica</dt><dd>{viewing.validation}</dd></div><div><dt>Última actualización</dt><dd>{viewing.updatedAt}</dd></div></dl>}
    </Modal>
    <Modal open={!!deleting} onClose={()=>setDeleting(null)} title="Eliminar equipo" footer={<><Button variant="danger" onClick={()=>deleting&&remove(deleting)}>Eliminar definitivamente</Button><Button variant="ghost" onClick={()=>setDeleting(null)}>Cancelar</Button></>}>
      <p>¿Quieres eliminar <strong>{deleting?.name}</strong>? Esta acción quitará el registro de la demostración.</p>
    </Modal>
  </article>;
}
