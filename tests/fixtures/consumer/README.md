# Fixture de integración del paquete MOK

Soporte de pruebas React + Vite que instala el archivo creado con npm pack y usa
únicamente los exports públicos. No usa alias a src ni CSS de documentación.
No se publica como aplicación ni incluye un comando de demo.

Desde la raíz del repositorio:

    npm run consumer:prepare
    npm run test:visual
    npm run test:consumer

consumer:prepare compila, empaqueta, instala y construye el fixture con los tipos
publicados. Debe repetirse tras cambiar la biblioteca. Los scripts de pruebas
abren y cierran sus propios servidores.

Las entradas cubren contratos de API, temas y persistencia, paletas, formularios
nativos, proyectos en memoria, DataTable, modales y foco, notificaciones,
AddressInput, menús, Tooltip y Popover. Los datos de prueba se reinician al
recargar. src/palette.ts define las paletas de las comprobaciones.

without-fonts.html verifica que omitir fonts.css no registra ni solicita fuentes.
Las otras entradas verifican fuentes locales, recursos de marca y que los estilos
publicados no incluyan clases ni medios de documentación. El layout del fixture
pertenece a src/app.css.

visual.html contiene estados reproducibles. Las 40 referencias de Windows/Edge
cubren ambos temas y tamaños móvil/escritorio. test:visual:update actualiza las
referencias cuando el cambio es intencional; deben revisarse antes de integrarlas.
verify compara las capturas sin actualizarlas. Los informes quedan en
verification/visual-report y test-results/visual.
