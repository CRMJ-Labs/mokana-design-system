import type {CanonicalIconName} from './Icon';

export interface IconDefinition {name:CanonicalIconName;label:string;category:string;keywords:string}
const groups:Record<string,[CanonicalIconName,string,string][]>={
  'Navegación':[
    ['arrow-right','Flecha derecha','siguiente avanzar'],['arrow-left','Flecha izquierda','volver anterior'],['arrow-up','Flecha arriba','subir'],['arrow-down','Flecha abajo','bajar'],
    ['chevron-right','Chevron derecho','expandir siguiente'],['chevron-left','Chevron izquierdo','anterior volver'],['chevron-up','Chevron superior','contraer'],['chevron-down','Chevron inferior','desplegar'],
    ['home','Inicio','casa portada'],['menu','Menú','navegacion hamburguesa'],['panel-left-close','Contraer navegación','sidebar panel lateral cerrar'],['panel-left-open','Expandir navegación','sidebar panel lateral abrir'],['more-horizontal','Más acciones','puntos horizontal'],['more-vertical','Más opciones','puntos vertical'],['external-link','Enlace externo','abrir nueva pestaña'],['settings','Configuración','ajustes engranaje'],
  ],
  'Acciones':[
    ['plus','Añadir','crear nuevo mas'],['minus','Restar','quitar menos'],['close','Cerrar','cancelar equis'],['search','Buscar','lupa encontrar'],['check','Confirmar','listo verificacion'],['copy','Copiar','duplicar portapapeles'],['clipboard','Portapapeles','pegar'],['edit','Editar','lapiz modificar'],['trash','Eliminar','borrar papelera'],
    ['download','Descargar','bajar archivo'],['upload','Subir','cargar archivo'],['refresh','Actualizar','recargar reintentar'],['undo','Deshacer','revertir volver'],['save','Guardar','persistir disco'],['share','Compartir','enviar'],['filter','Filtrar','filtros refinar'],
  ],
  'Personas y seguridad':[
    ['user','Persona','usuario perfil cuenta'],['users','Equipo','grupo personas miembros'],['user-plus','Invitar persona','añadir usuario miembro'],['log-in','Iniciar sesión','entrar acceso'],['log-out','Cerrar sesión','salir acceso'],['lock','Bloqueado','candado privado permisos'],['unlock','Desbloqueado','candado abierto publico'],['key','Clave','llave contraseña api'],['shield','Protección','escudo seguridad'],['shield-check','Protección verificada','escudo permisos'],['eye','Visible','ver mostrar'],['eye-off','Oculto','ocultar contraseña'],
  ],
  'Archivos y desarrollo':[
    ['folder','Carpeta','directorio cerrado'],['folder-open','Carpeta abierta','directorio expandido'],['file','Archivo','documento'],['file-text','Archivo de texto','documento contenido'],['file-code','Archivo de código','documento desarrollo'],['image','Imagen','foto multimedia'],['paperclip','Adjunto','archivo clip'],['archive','Archivar','caja guardar'],['package','Paquete','dependencia producto'],['code','Código','desarrollo programacion'],['terminal','Terminal','consola comandos'],['database','Base de datos','almacenamiento'],['server','Servidor','infraestructura'],['globe','Web','internet dominio mundo'],
  ],
  'Comunicación':[
    ['mail','Correo','email sobre'],['message','Mensaje','comentario chat feedback'],['bell','Notificaciones','campana aviso'],['bell-off','Notificaciones desactivadas','silenciar campana'],['send','Enviar','mensaje papel'],['smile','Satisfecho','emocion positivo'],['frown','Insatisfecho','emocion negativo triste'],['laugh','Muy satisfecho','emocion feliz'],['meh','Neutral','emocion indiferente'],
  ],
  'Estados y tiempo':[
    ['info','Información','ayuda contexto'],['warning','Advertencia','alerta atencion triangulo'],['error','Error','fallo cruz'],['success','Completado','exito correcto'],['help','Ayuda','pregunta soporte'],['loading','Cargando','esperar progreso'],['clock','Hora','tiempo duracion'],['calendar','Calendario','fecha dia'],['wifi','Conexión','red conectividad'],
  ],
  'Interfaz y datos':[
    ['sun','Tema claro','sol apariencia'],['moon','Tema oscuro','luna apariencia'],['monitor','Sistema','pantalla escritorio dispositivo'],['smartphone','Móvil','telefono dispositivo'],['chart','Gráfico','datos estadisticas barras'],['credit-card','Tarjeta','pago facturacion credito'],
  ],
};
export const iconCategories=Object.keys(groups);
export const iconCatalog:IconDefinition[]=Object.entries(groups).flatMap(([category,items])=>items.map(([name,label,keywords])=>({name,label,category,keywords})));
