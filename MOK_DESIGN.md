# MOK Design System — guía de construcción de producto

Esta guía es el contrato visual y de interacción para construir plataformas con MOK. Está escrita para equipos de producto, diseño, desarrollo y agentes de IA.

Su objetivo no es enumerar propiedades de componentes. Define cómo tomar decisiones, cómo componer una pantalla completa y qué condiciones debe cumplir antes de considerarse terminada.

## 1. Cómo usar esta guía

Las palabras **debe**, **no debe**, **usa** y **evita** expresan reglas de MOK. Si una necesidad no está cubierta, conserva estas reglas y documenta la excepción antes de crear una solución nueva.

Orden de autoridad:

1. Esta guía decide la estructura y el comportamiento de producto.
2. La documentación navegable decide qué componente y variante utilizar.
3. [`docs/integration.md`](docs/integration.md) decide contratos técnicos, eventos, temas y atributos.
4. Los tipos públicos del paquete deciden la API disponible en la versión instalada.
5. El código de una demostración no sustituye una API pública.

Antes de empezar una pantalla, identifica:

- La tarea principal de la persona.
- La entidad o proceso que organiza la página.
- La acción principal, si existe.
- Los estados de carga, vacío, error, éxito y permisos.
- El comportamiento esperado en móvil.
- Si existe un patrón MOK equivalente.

## 2. Principios del sistema

### Intención antes que decoración

Selecciona componentes por su propósito, no por su apariencia. Un enlace navega, un botón ejecuta una acción, un badge comunica un estado y una alerta comunica un resultado o condición relevante.

### Composición antes que invención

Construye páginas con componentes y regiones existentes. No recrees manualmente contenedores, barras, tablas, campos, menús o diálogos que ya pertenecen al sistema.

### Una jerarquía visible

Cada pantalla debe dejar claro:

- Dónde está la persona.
- Qué puede hacer primero.
- Qué información es principal.
- Qué información es complementaria.
- Qué cambió después de una acción.

### Accesibilidad como comportamiento base

La accesibilidad no es una capa posterior. Semántica, foco, teclado, contraste, nombres accesibles y estados anunciados forman parte de la definición del componente y de la pantalla.

### Responsive por prioridad

Una pantalla no se reduce comprimiendo todo. Conserva la identidad y la acción principal; reubica, resume u oculta información secundaria de forma explícita.

### Consistencia por encima de novedad local

Una pantalla ligeramente menos llamativa pero coherente con el producto es preferible a una solución aislada que introduce nuevos tamaños, sombras, colores o patrones.

## 3. Frontera entre MOK y la aplicación

MOK es responsable de:

- Tokens visuales y temas.
- Componentes y estados interactivos.
- Regiones de aplicación y página.
- Patrones documentados.
- Accesibilidad interna de sus componentes.

La aplicación es responsable de:

- Rutas y navegación del producto.
- Datos, peticiones, permisos y reglas de negocio.
- Textos reales y localización.
- Estado controlado y persistencia.
- Confirmaciones asociadas al impacto real de una acción.
- Analítica y telemetría.

No coloques lógica de negocio específica dentro del DS. No copies estilos internos del DS a la aplicación para crear variantes locales.

## 4. Estructura oficial de una plataforma

La estructura base es:

1. `MokProvider` como raíz visual, tema, paleta y notificaciones.
2. `AppShell`.
3. Header global.
4. Sidebar o navegación primaria cuando el producto la necesite.
5. Región principal.
6. `ContentContainer`.
7. Estructura de la página.

Usa `MokProvider` como entrada recomendada para aplicaciones nuevas. Recurre a `ThemeProvider`, `PaletteProvider` y `ToastProvider` por separado únicamente cuando una integración avanzada necesite controlar sus límites de forma independiente.

### AppShell

Usa `AppShell` para aplicaciones autenticadas, paneles administrativos, CRM y productos con navegación persistente. El shell define regiones; no debe contener lógica particular de una página.

El header global puede contener:

- Identidad del producto.
- Búsqueda global.
- Notificaciones.
- Una acción global relevante, como invitar.
- Acceso a la cuenta.

El sidebar puede contener:

- Navegación primaria agrupada.
- Indicadores breves, como conteos.
- Control de apertura y cierre dentro de la navegación superior.
- Menú de usuario en la parte inferior.

No mezcles filtros o acciones de una entidad concreta en el header global.

### ContentContainer

Selecciona el tamaño según el contenido:

| Tamaño | Uso |
| --- | --- |
| `compact` | Login, ajustes breves, formularios lineales y lectura enfocada. |
| `default` | Páginas estándar, detalles y formularios habituales. |
| `wide` | Dashboards, CRM y tablas administrativas con varias columnas. |
| `full` | Experiencias que necesitan ocupar toda la región disponible, como editores o tableros extensos. |

No fijes anchos de página arbitrarios si un tamaño de `ContentContainer` resuelve la necesidad.

## 5. Anatomía oficial de una página

Una página administrativa se construye en este orden:

1. `PageHeader`.
2. Resumen, tabs o métricas, cuando sean necesarias.
3. `PageToolbar` para búsqueda y controles de vista.
4. `FilterBar` para filtros del conjunto de datos.
5. Contenido principal.
6. Feedback y acciones persistentes cuando el flujo lo requiera.

### PageHeader

Debe contener la identidad de la página:

- Eyebrow o contexto corto, si aporta orientación.
- Un único título principal.
- Una descripción breve orientada a la tarea.
- Una acción principal, o un grupo pequeño y claramente jerarquizado.

No pongas búsqueda, filtros, paginación ni acciones por fila en `PageHeader`.

### PageToolbar

Úsala para controles que operan sobre la vista:

- Búsqueda.
- Cambio de vista.
- Ordenación global.
- Selección de columnas.
- Exportación o descarga asociada al conjunto visible.

### FilterBar

Úsala cuando los controles cambian qué registros se muestran. Debe permitir comprender y limpiar filtros activos. No dupliques filtros en tabs, toolbar y tabla sin una razón funcional.

## 6. Selección del patrón de página

| Necesidad | Patrón recomendado |
| --- | --- |
| Explorar y administrar entidades | Listado administrativo con `AdminTable`. |
| Crear o editar una entidad | Formulario con secciones y acciones claras. |
| Comprender una entidad | Detalle con resumen, metadatos y actividad. |
| Medir el negocio | Dashboard con métricas, tendencias y tabla de apoyo. |
| Gestionar oportunidades | CRM con navegación, métricas y pipeline. |
| Acceder al producto | Autenticación enfocada, sin navegación de aplicación. |
| Configurar preferencias | Ajustes agrupados por tema, con guardado explícito cuando corresponda. |
| Completar una tarea larga | Flujo por pasos con progreso, validación y salida segura. |

Consulta `/patterns/auth`, `/patterns/dashboard`, `/patterns/crm` y `/patterns/crud` como referencias de integración. Los ejemplos internos de documentación no son automáticamente componentes públicos del paquete.

Consulta `/patterns` como índice oficial. Su fuente estructurada `patternCatalog` permite que documentación y herramientas consulten tarea principal, criterios de uso, estados, responsive, accesibilidad y componentes de cada patrón.

Para una plataforma nueva, comienza con el starter oficial de `starters/admin-platform` o consulta `/starters/admin-platform`. El starter es una aplicación copiable: conserva la estructura y sustituye navegación, datos, permisos y acciones por los contratos reales del producto.

El starter incluye plantillas completas de listado, crear/editar, detalle y configuración. Úsalas como punto de partida de una ruta real; no copies únicamente el contenido visual ni mantengas la navegación demostrativa basada en estado local.

## 7. Jerarquía de acciones

Una pantalla debe tener una acción principal reconocible. Más de una acción sólida con el mismo énfasis suele indicar que la jerarquía no está resuelta.

| Tipo de acción | Tratamiento |
| --- | --- |
| Principal | `Button` primary. Normalmente una por región. |
| Secundaria | Secondary, tertiary u outline según proximidad e importancia. |
| De bajo énfasis | Ghost, enlace o menú contextual. |
| Destructiva inmediata | Danger con confirmación proporcional al impacto. |
| Destructiva secundaria | Danger Soft o elemento danger dentro de un menú. |

Reglas:

- El texto comienza con un verbo claro: Crear, Guardar, Invitar, Descargar.
- No uses color como única señal de peligro o estado.
- No conviertas una fila completa en botón cuando contiene acciones o selección.
- No apiles botones repetidos en cada fila; usa `DotsMenu`.
- Los botones de icono necesitan un nombre accesible específico.
- Deshabilitar una acción debe tener una causa comprensible; cuando sea necesario, explícala.

## 8. Tablas administrativas

Usa `AdminTable` como patrón predeterminado para operaciones sobre entidades. Usa `DataTable` para búsqueda, ordenación y paginación locales. Usa `Table` cuando la aplicación controla datos remotos, carga progresiva o una composición especializada.

### Estructura de una tabla

- La primera columna identifica la entidad.
- La identidad puede incluir nombre, código, correo, avatar o icono y una segunda línea contextual.
- Las cifras se alinean a la derecha y usan numerales tabulares.
- Los estados se representan con `Badge` y texto explícito.
- La última columna contiene un único `DotsMenu` cuando existen acciones secundarias.
- La tabla incluye caption, encabezados correctos y nombres accesibles por fila.

### Prioridades responsive

| Prioridad | Contenido |
| --- | --- |
| `primary` | Identidad, selección y acciones indispensables. |
| `secondary` | Estado, responsable o dato comparativo importante. |
| `tertiary` | Fechas, descripciones, referencias y metadatos. |

En móvil, los datos secundarios y terciarios pasan al detalle responsive. No reduzcas el texto hasta hacerlo ilegible y no dependas del desplazamiento horizontal como única solución.

### Estados obligatorios

Toda tabla conectada a datos reales debe contemplar:

- Carga inicial.
- Carga adicional, si existe.
- Sin resultados por filtros.
- Conjunto vacío por primera vez.
- Error recuperable.
- Selección parcial, si admite selección.
- Paginación o final de resultados.

No uses el mismo mensaje para “no existen registros” y “los filtros no encontraron coincidencias”.

## 9. Formularios

Un formulario debe ser comprensible sin depender del placeholder.

### Estructura

- Usa una etiqueta visible por control.
- Agrupa campos relacionados con `Fieldset` o secciones con título.
- Ordena de información general a información específica.
- Usa una columna como opción predeterminada.
- Usa dos columnas solo cuando los campos se relacionan y hay ancho suficiente.
- Mantén las acciones finales en un lugar constante.

Usa `FormLayout` para ordenar feedback, contenido y acciones; `FormGrid` para campos relacionados; `FormErrorSummary` para indexar errores y `FormReadOnly` para información no editable. Consulta `/patterns/forms` para el flujo completo con errores locales y remotos, cambios pendientes, archivos, envío y éxito.

### Validación

- El error se asocia al campo y explica cómo corregirlo.
- El estado de error tiene un único tratamiento de foco; no superpongas foco azul sobre borde rojo.
- Conserva el valor introducido después de un error.
- Los errores del servidor se muestran junto al campo cuando puedan asociarse.
- Un error general no reemplaza los errores específicos.
- Después de enviar, lleva el foco al primer error o a un resumen accesible.

### Controles

- `Select` para listas pequeñas y estables.
- `Combobox` cuando hay búsqueda o muchas opciones.
- `Checkbox` para selección múltiple o aceptación explícita.
- `Radio` para una elección exclusiva visible.
- `Switch` o `Toggle` para una preferencia que cambia inmediatamente.
- `Textarea` para contenido de varias líneas.

No sustituyas controles nativos o MOK por elementos visuales sin semántica equivalente.

## 10. Navegación y overlays

- Usa enlaces para cambiar de ubicación y botones para cambiar estado.
- La navegación activa debe comunicar su estado además del color.
- Un `Modal` concentra una decisión breve que bloquea el resto de la interfaz.
- Un `Drawer` conserva contexto lateral y admite tareas más extensas.
- Un `Popover` aporta información o controles asociados sin bloquear.
- Un `Tooltip` solo explica; no contiene tareas ni información indispensable.
- Usa `Menu` o `DotsMenu` para acciones relacionadas y `ContextMenu` únicamente cuando el contexto justifique la interacción secundaria.

Escape debe cerrar overlays cuando corresponda y el foco debe regresar a un destino lógico. No implementes gestión de foco paralela alrededor de un componente que ya la proporciona.

## 11. Feedback y estados del sistema

| Necesidad | Componente |
| --- | --- |
| Respuesta breve a una acción | Toast. |
| Condición dentro del contenido | Alert o Note. |
| Estado persistente del proyecto | Project Banner. |
| Ausencia de contenido con siguiente paso | Empty State. |
| Espera con estructura conocida | Skeleton. |
| Espera breve de una acción | Spinner o estado loading del botón. |
| Avance cuantificable | Progress. |
| Acción destructiva de alto impacto | Destructive Action Modal. |

El feedback debe decir qué ocurrió y, cuando sea útil, qué puede hacer la persona después. No muestres un toast para errores que requieren permanecer visibles o corregir un campo.

## 12. Responsive

Diseña primero la jerarquía, después la distribución.

En pantallas estrechas:

- Apila título, descripción y acciones del header.
- Permite que la acción principal siga visible.
- Lleva búsqueda y filtros a filas separadas.
- Usa controles a ancho completo cuando mejoren la interacción.
- Colapsa el sidebar a iconos cuando exista espacio suficiente para conservarlo; en móvil puede transformarse en navegación temporal.
- Conserva etiquetas de iconos mediante nombre accesible y, cuando exista ambigüedad, tooltip.
- Convierte columnas complementarias en detalles de tabla.
- Evita alturas fijas que corten contenido o teclado virtual.

No definas el responsive únicamente por el viewport cuando el componente vive en un panel; utiliza el comportamiento del componente y el ancho real de su contenedor.

## 13. Color, tipografía y tokens

Usa roles semánticos, nunca pigmentos directos para construir una interfaz de producto.

- `background`, `surface`, `foreground` y `secondary` definen la jerarquía base.
- `action-primary` y su texto definen acciones sólidas.
- Los pares success, warning, error e info comunican significado.
- `line`, bordes y separadores organizan sin competir con el contenido.
- `focus` debe permanecer visible en ambos temas.

No introduzcas hexadecimales, sombras, radios, espaciados o tamaños tipográficos locales si existe un token. No uses un color de estado como color de marca.

Los componentes complejos exponen propiedades de composición y regiones `data-slot`. Prefiere las propiedades; usa slots únicamente para inspección, pruebas y ajustes de layout documentados. No dependas de clases internas `mk-*` desde una aplicación. Consulta `/foundations/anatomies`.

El tema oscuro no es una inversión mecánica del claro. Verifica contraste, elevación, bordes, estados de hover, focus, disabled y selección en ambos.

## 14. Contenido e idioma

- Usa títulos breves y específicos.
- Las descripciones explican el propósito, no repiten el título.
- Las etiquetas nombran el dato; los botones nombran la acción.
- Evita “Sí”, “Aceptar” o “Continuar” cuando puede usarse una acción más específica.
- Los mensajes de error no culpan a la persona.
- Mantén la misma palabra para la misma entidad en toda la plataforma.
- Formatea fecha, moneda y número según el locale del producto.
- No codifiques textos de demostración en una pantalla de producción.

## 15. Accesibilidad mínima obligatoria

Cada pantalla debe cumplir, como mínimo:

- Un título principal coherente.
- Regiones y landmarks comprensibles.
- Orden de tabulación lógico.
- Foco visible.
- Operación completa con teclado.
- Nombre accesible en controles sin texto visible.
- Errores asociados a sus campos.
- Cambios dinámicos anunciados cuando corresponda.
- Contraste suficiente en claro y oscuro.
- Iconos decorativos ocultos a tecnologías de asistencia.
- Información de estado que no dependa solo del color.
- Respeto por preferencias de movimiento reducido.

No añadas roles ARIA que contradigan el elemento nativo. Prefiere la semántica nativa y los componentes MOK.

## 16. Proceso obligatorio para agentes de IA

Cuando un agente reciba la tarea de crear o modificar una pantalla con MOK, debe seguir este orden:

1. Leer esta guía.
2. Identificar el patrón de página y la tarea principal.
3. Revisar la versión instalada de `@mokanadev/design-system`.
4. Consultar la documentación del patrón y de los componentes necesarios.
5. Inventariar estados: normal, carga, vacío, error, éxito, permisos y responsive.
6. Reutilizar la estructura oficial de shell y página.
7. Construir primero la jerarquía y luego los detalles visuales.
8. Usar únicamente APIs públicas de la versión instalada.
9. Probar teclado, foco, temas y tamaños de pantalla.
10. Informar cualquier excepción o componente faltante.

### El agente debe

- Preferir componentes MOK antes que HTML personalizado para controles complejos.
- Reutilizar patrones existentes antes de crear nuevos.
- Mantener una sola acción principal por región.
- Definir prioridades responsive de tablas.
- Incluir estados reales de la experiencia.
- Usar tokens semánticos para estilos de aplicación.
- Conservar las reglas de negocio y cambios existentes del repositorio consumidor.

### El agente no debe

- Inventar componentes, propiedades o nombres de iconos.
- Copiar componentes internos de las páginas de documentación.
- Añadir otra librería visual para resolver algo cubierto por MOK.
- Construir una página con valores arbitrarios de CSS.
- Usar botones repetidos como columna de acciones.
- Ocultar errores, labels o estados solo para simplificar el diseño.
- Modificar el DS desde una aplicación consumidora para resolver una excepción local.
- declarar una pantalla terminada sin revisar móvil y tema oscuro.

## 17. Cuándo crear un componente nuevo

Crea o propone un componente del DS únicamente cuando:

- El mismo problema aparece en al menos dos contextos de producto.
- Tiene un contrato de interacción reconocible.
- No puede resolverse componiendo componentes existentes sin duplicación significativa.
- Puede documentarse con estados, accesibilidad y responsive claros.
- Su API no expone reglas específicas de una sola aplicación.

Si el problema solo aparece una vez, empieza como composición de la aplicación. Si se repite y se estabiliza, promuévelo al DS.

## 18. Definición de terminado

Una pantalla MOK está terminada cuando:

- [ ] Usa el shell y el contenedor apropiados.
- [ ] Tiene título, descripción y acción principal correctamente ubicados.
- [ ] Búsqueda, filtros y acciones pertenecen a la región correcta.
- [ ] Usa componentes públicos de MOK sin recrearlos.
- [ ] Incluye carga, vacío, error y éxito cuando aplican.
- [ ] Los estados de permisos están resueltos.
- [ ] Funciona con teclado y conserva foco visible.
- [ ] Tiene nombres accesibles y semántica correcta.
- [ ] Funciona en tema claro y oscuro.
- [ ] Funciona en móvil, tablet y escritorio sin desbordar la página.
- [ ] Las tablas tienen prioridades responsive y acciones con `DotsMenu`.
- [ ] Los formularios conservan labels, ayudas y errores asociados.
- [ ] Los textos son reales, consistentes y localizables.
- [ ] No introduce colores, radios, sombras o espaciados arbitrarios.
- [ ] Las decisiones excepcionales están documentadas.

## 19. Referencias

- Sitio local: `/introduction`.
- Integración técnica: [`docs/integration.md`](docs/integration.md).
- Colores y contraste: [`docs/colors.md`](docs/colors.md).
- Catálogo de componentes: `/components/button` y navegación lateral.
- Patrones: `/patterns/auth`, `/patterns/dashboard`, `/patterns/crm` y `/patterns/crud`.
- Tablas: `/components/table`.
- API generada: disponible en cada página de componente.

Si esta guía y una implementación existente entran en conflicto, no perpetúes automáticamente la inconsistencia. Verifica la versión instalada, consulta la documentación y registra la decisión.
