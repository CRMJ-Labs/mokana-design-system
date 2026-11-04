# Auditoría de MOK Design System

Fecha: 3 de noviembre de 2026. Versión: `0.1.0`. Commit auditado: `a2a2ca7`.

## Dictamen

La base visual y la infraestructura local están bien desarrolladas: hay tokens semánticos, temas claro/oscuro, componentes React reales, ejemplos de producto y documentación de API generada. La muestra visual revisada mantiene una jerarquía clara y adapta correctamente su composición a móvil.

El principal riesgo es la diferencia de madurez entre componentes públicos y la cobertura de sus estados interactivos. Encontré **9 hallazgos: 4 de prioridad alta y 5 de prioridad media**. Conviene resolver los cuatro primeros antes de ampliar la adopción del paquete en formularios y flujos de producción.

Alta significa corregir antes de extender el uso del componente afectado. Media significa programar una mejora de comportamiento, mantenimiento o distribución. No se asignó una puntuación numérica porque esta revisión no constituye una evaluación exhaustiva de cada variante.

## Alcance y método

- Revisión del repositorio, exports, tokens, CSS, formularios, navegación, overlays, tablas, temas, documentación, scripts y workflows.
- Ejecución de `npm.cmd run verify` y reproducciones adicionales con Playwright/Microsoft Edge sobre componentes reales.
- Batería general: 92 rutas, 184 combinaciones de ruta/tema y 92 comprobaciones de desbordamiento móvil.
- Inspección visual de Introducción, Button, Address Input y Tipografía a 1280 y 390 px; captura adicional de Button en oscuro.
- Medición del CSS construido, sin estimar tiempos de descarga ni rendimiento en dispositivos reales.

La revisión corresponde al código y sitio locales. No se inspeccionó el contenido del archivo de Figma ni se ejecutaron los workflows remotos de GitHub. La comprobación automática de accesibilidad no equivale a una certificación WCAG ni sustituye pruebas con lectores de pantalla.

## Hallazgos prioritarios

### A01 · Alta · AddressInput puede mostrar un valor distinto del estado de la aplicación

**Código:** [src/AddressInput.tsx](../src/AddressInput.tsx), líneas 25–26 y 35.

`current` se deriva de `value`, pero el texto visible usa `query`, inicializado una sola vez con `useState(current.address)`. Las actualizaciones posteriores de `value.address` no actualizan ese texto.

**Reproducción:** montar con `value.address = 'Calle inicial'`; cambiar desde el padre a `'Carrera actualizada'`. El estado de la aplicación contiene la segunda dirección y el campo sigue mostrando la primera. Esto afecta carga asíncrona, edición de registros y reinicios de formularios.

**Corrección propuesta:** definir claramente la relación entre consulta y dirección seleccionada, y sincronizar cambios externos sin sobrescribir la escritura en curso. Revisar también `mode`, que se copia a estado solo al montar: decidir si es controlado o renombrarlo a `defaultMode`.

**Aceptación:** una actualización externa y un reinicio del valor deben reflejarse en la UI; escribir y seleccionar una sugerencia debe seguir notificando el valor correcto.

### A02 · Alta · El autocompletado de direcciones tiene un contrato de teclado y ARIA incompleto

**Código:** [src/AddressInput.tsx](../src/AddressInput.tsx), líneas 35–36.

El campo declara `role="combobox"` y abre un `listbox`, pero solo gestiona Escape. ArrowDown y Enter no permiten recorrer y elegir la sugerencia desde el campo; no hay opción activa ni asociación mediante `aria-activedescendant`. Además, cada `role="option"` contiene un botón enfocable.

**Evidencia:** al escribir `Calle`, pulsar ArrowDown y Enter mantiene el texto sin seleccionar. Al hacer clic fuera, la lista permanece abierta. Axe sobre este estado abierto informa `nested-interactive`, impacto **serious**, en dos sugerencias.

**Corrección propuesta:** implementar el patrón de combobox con foco en el campo, opción activa y selección por teclado; eliminar los controles anidados en las opciones y cerrar correctamente al abandonar el componente.

**Aceptación:** ArrowUp/Down recorren resultados, Enter selecciona, Escape cierra y salir del componente retira la lista. Axe no debe informar controles anidados con la lista abierta.

### A03 · Alta · DropdownMenu y Menu ofrecen comportamientos de teclado diferentes

**Código:** [src/advanced-components.tsx](../src/advanced-components.tsx), línea 21; comparación con [src/Menu.tsx](../src/Menu.tsx).

Ambos están exportados públicamente. `DropdownMenu` declara `role="menu"`, pero no gestiona foco inicial, flechas, Escape ni cierre al salir. Su disparador tampoco declara `aria-haspopup`. `Menu` sí implementa estas interacciones.

**Evidencia comparativa:** al abrir con Enter, `DropdownMenu` mantiene el foco en el disparador; ArrowDown no lo mueve y Escape deja el menú abierto. En la misma prueba, `Menu` enfoca la primera acción, permite avanzar a la segunda y cierra con Escape.

**Corrección propuesta:** reutilizar `Menu` como implementación de `DropdownMenu`, conservando un adaptador de API si hace falta. Documentar una opción recomendada y la estrategia de compatibilidad de la otra.

**Aceptación:** ambas APIs cumplen el mismo contrato de foco, navegación y cierre. El [patrón Menu Button de WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) describe el foco inicial y la semántica esperada.

### A04 · Alta · Tooltip no permite recorrer su contenido con el puntero

**Código:** [src/Tooltip.tsx](../src/Tooltip.tsx), línea 6; [src/styles.css](../src/styles.css), línea 24.

El tooltip tiene `pointer-events:none` y se cierra al salir del disparador cuando este no tiene foco. Además, Escape solo se escucha dentro del componente: al abrir únicamente con hover y mantener el foco fuera, no lo cierra.

**Evidencia:** visible al pasar el cursor por el botón; sigue visible tras Escape con foco fuera; desaparece al mover el cursor al centro de la burbuja. La prueba existente cubre Escape con el botón enfocado, que sí funciona.

**Corrección propuesta:** mantener la apertura mientras se recorre el disparador o la burbuja, permitir cruzar la separación y gestionar Escape también durante la apertura por hover.

**Aceptación:** se puede mover el puntero al texto sin perderlo y cerrarlo sin cambiar el foco. Véase la explicación oficial de [WCAG 2.2, criterio 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).

### A05 · Media · Popover carece de gestión de cierre y comunicación de estado

**Código:** [src/advanced-components.tsx](../src/advanced-components.tsx), línea 18.

El disparador es un `ReactNode` envuelto en un `span` con clic. No recibe `aria-expanded` ni una relación con el panel. No hay gestión de Escape, clic fuera ni restauración de foco. Si se pasa texto plano como `trigger`, tampoco se obtiene un control accesible por teclado.

**Evidencia:** con un Button como disparador, el panel permanece abierto después de Escape y clic fuera; `aria-expanded` es nulo.

**Corrección propuesta:** definir una API de disparador enfocable, un contrato explícito de foco y cierre, y posicionamiento que mantenga el panel dentro del viewport. Puede compartir primitivas con `ContextCard`, según el comportamiento deseado.

**Aceptación:** apertura accesible por teclado, estado anunciado, Escape y cierre exterior definidos, y foco situado correctamente tras cerrar desde dentro.

### A06 · Media · CI y publicación no ejecutan toda la verificación anunciada

**Código:** [package.json](../package.json), líneas 25–28 y 32; [ci.yml](../.github/workflows/ci.yml), líneas 30–37; [publish.yml](../.github/workflows/publish.yml), líneas 34–41; [README.md](../README.md), línea 97.

El README afirma que CI ejecuta `verify`. El workflow llama a `typecheck`, `npm test` y `build`; `npm test` solo compila el sitio y ejecuta `test:ui`. Quedan fuera `docs:check`, las comprobaciones específicas y las pruebas de consumidor/paletas. En CI tampoco se construye la biblioteca. Publicación la construye mediante `prepublishOnly`, pero omite las mismas pruebas adicionales.

**Impacto:** una regresión del paquete instalado o un fallo de una comprobación especializada puede llegar a una rama con CI verde. La batería de páginas tampoco descubre por sí sola los estados abiertos de A02–A04.

**Corrección propuesta:** hacer que CI y el paso previo a publicar ejecuten una verificación equivalente y documentada; incorporar las reproducciones de esta auditoría como regresiones de comportamiento.

**Aceptación:** romper deliberadamente una prueba de consumidor o dejar desactualizada la API debe impedir la aprobación de CI y la publicación.

### A07 · Media · El workflow de Chromatic no tiene una entrada de Storybook

**Código:** [chromatic.yml en la revisión auditada](https://github.com/CRMJ-Labs/mokana-design-system/blob/a2a2ca736b3061ae11398fd2df5b244df87e2c3b/.github/workflows/chromatic.yml), líneas 12 y 31–35; [package.json](../package.json).

El job se llama `Publish Storybook` e invoca la acción sin configurar una alternativa de integración. No hay configuración `.storybook`, stories, dependencia Storybook ni script `build-storybook` en el repositorio. Tampoco se configura el modo Playwright de Chromatic.

**Conclusión:** la configuración local no proporciona el artefacto que ese workflow pretende publicar. No se verificó el resultado de una ejecución remota ni la existencia del secreto.

**Corrección propuesta:** elegir una estrategia concreta: Storybook completo o integración de los tests de Playwright con Chromatic. La [documentación oficial de GitHub Actions de Chromatic](https://www.chromatic.com/docs/github-actions/) distingue ambas rutas. Las capturas locales actuales, sin comparación con referencias aprobadas, no acreditan un control de regresión visual.

**Aceptación:** un cambio visual deliberado debe producir un diff revisable en una ejecución de CI.

### A08 · Media · La cobertura de tokens no alcanza tipografía y espaciado de forma uniforme

**Código:** [tokens.json](../tokens.json), líneas 260–300; [scripts/build-tokens.mjs](../scripts/build-tokens.mjs), líneas 5–7; [src/styles.css](../src/styles.css), líneas 7–8.

El generador exporta familias tipográficas, pero no transforma `typography.scale` en tokens de tamaño. Los tamaños de texto se escriben directamente en CSS. Asimismo, existen tokens `--space-*`, pero controles y utilidades principales conservan separaciones y paddings literales; también conviven reglas base y posteriores extensiones de los mismos componentes.

**Evidencia:** sobrescribir `--space-2` de 8 a 50 px no cambia el gap de Button, que sigue en 8 px. Cambiar la escala tipográfica de JSON no puede actualizar los tamaños a través del generador actual.

**Corrección propuesta:** emitir tokens tipográficos por rol y migrar progresivamente los valores repetidos de componentes a tokens de sistema o de componente. Consolidar las reglas duplicadas al realizar esa migración.

**Aceptación:** una modificación de un token documentado cambia los componentes que lo consumen; añadir una comprobación que detecte diferencias entre los archivos generados y su fuente.

### A09 · Media · El CSS publicado carga fuentes incrustadas y algunos estilos de ejemplos

**Código:** [src/styles.css](../src/styles.css), línea 2; [src/button.css](../src/button.css), línea 1; [src/checkbox.css](../src/checkbox.css), línea 1; [vite.config.ts](../vite.config.ts).

**Medición del build:** `dist/styles.css` tiene **425.175 bytes** y **244.665 bytes con gzip** calculado localmente. Contiene siete fuentes incrustadas en URLs de datos, que ocupan 291.521 caracteres. Sustituyendo esas URLs por referencias cortas, el CSS restante mide aproximadamente 133.724 bytes; esto cuantifica su contribución, no un ahorro gzip equivalente.

La importación del único CSS público transfiere todos esos subconjuntos aunque una aplicación solo necesite caracteres latinos. También aparecen clases de ejemplos como `.mk-button-comparison`, `.mk-button-code`, `.mk-checkbox-code` y `.mk-checkbox-selection`. El empaquetado incluye además el vídeo de demostración de 48,7 KB tanto en `dist/demo` como en `public/demo`, por la copia de recursos públicos de Vite y la lista `files` del paquete.

**Corrección propuesta:** ofrecer fuentes como archivos cacheables por separado y permitir que el consumidor decida su carga; trasladar estilos exclusivos de ejemplos al sitio. Valorar una entrada de estilos sin fuente automática.

**Aceptación:** un consumidor mínimo conserva el aspecto de Button, no incluye CSS exclusivo de demos y puede cargar únicamente las fuentes necesarias. Medir tamaño y peticiones antes/después.

## Aspectos que conviene conservar

- Separación entre sitio y biblioteca, con carga bajo demanda de páginas del catálogo.
- Referencia de API generada desde TypeScript: 98 componentes públicos comprobados.
- Tokens semánticos de color, paletas por producto, aislamiento y variantes claro/oscuro.
- Uso de controles nativos y de `dialog` en varias superficies; `Menu`, Drawer y Tabs tienen una gestión de interacción más completa que los componentes señalados.
- Aplicación consumidora que instala el paquete empaquetado y verifica contratos de integración.
- Iconografía acotada, nombres accesibles y distribución de atribuciones.
- En la muestra visual: composición contenida, jerarquía tipográfica clara y adaptación móvil sin desbordamientos de página.

## Validación y evidencias

La batería general de UI terminó correctamente: **184 evaluaciones con axe sin infracciones en los estados recorridos**, **92 rutas móviles sin desbordamiento**, cero errores de página y los seis flujos de interacción generales correctos. Esto coexiste con los fallos de estados adicionales reproducidos en esta auditoría.

**`npm.cmd run verify` terminó correctamente (código 0).** Pasaron la comprobación de API, TypeScript, los builds del sitio y la biblioteca, la batería general de UI, las **21 comprobaciones especializadas**, la aplicación consumidora instalada desde el paquete y las pruebas de paletas. Estas últimas cubren tres paletas, dos modos y dos anchos, además de contraste, aislamiento, diálogos y notificaciones.

Las reproducciones adicionales confirmaron A01–A05 sin errores de JavaScript. Evidencias locales: [resultados de interacción](../verification/audit-findings.json), [axe con sugerencias abiertas](../verification/audit-open-states.json), [medición del paquete](../verification/audit-package.json). Estos archivos y las capturas están en `verification/`, una carpeta ignorada por Git.

## Orden de trabajo recomendado

1. Corregir el valor controlado y el autocompletado de AddressInput; unificar DropdownMenu con Menu; completar el hover de Tooltip.
2. Completar Popover e incorporar las reproducciones como pruebas de regresión. Alinear CI y publicación con la batería completa.
3. Habilitar comparaciones visuales reales; consolidar tokens y CSS; separar fuentes y estilos de ejemplos del paquete.

La revisión inicial añadió documentación y evidencias sin modificar las implementaciones de producción.

## Seguimiento: paso 1

El 3 de noviembre de 2026 se implementaron las correcciones de A01–A04:

- AddressInput deriva el texto visible del valor vigente, admite actualizaciones externas y reinicios, y conserva los modos controlado y sin control. `mode` mantiene su contrato de modo inicial, ahora documentado.
- El autocompletado conserva el foco en el campo, comunica la opción activa con `aria-activedescendant`, permite flechas y Enter, y cierra con Escape, Tab, pérdida de foco o clic exterior. Las opciones ya no contienen botones anidados y pueden seleccionarse con ratón o toque.
- DropdownMenu utiliza Menu, conserva sus props y contenedor, y comparte su gestión de foco y teclado. Menu incorpora `open`, `defaultOpen` y `onOpenChange` para mantener la compatibilidad del adaptador.
- Tooltip permite recorrer el espacio hasta la ayuda y su contenido en las cuatro posiciones. Escape también funciona al abrirlo solo con hover, conserva el foco y evita reaperturas mientras no se abandone el conjunto.

Las regresiones se ejecutan contra el paquete instalado en `/interactions.html` de la aplicación consumidora, mediante `scripts/test-interaction-regressions.mjs`, integrado en `test:consumer`. Incluyen axe con las sugerencias abiertas, selección por teclado/ratón/toque, estado controlado, refs y cruce lento hacia el tooltip.

Validación tras las correcciones: todas las etapas de `npm.cmd run verify` correctas: API, TypeScript, ambos builds, 184 evaluaciones de ruta/tema, 92 rutas móviles, 21 comprobaciones especializadas, consumidor con las nuevas regresiones y paletas. También se inspeccionaron capturas de sugerencias, DropdownMenu y Tooltip en claro y oscuro. En ese punto, A05–A09 quedaban pendientes para los siguientes pasos.

## Seguimiento: paso 2

El 3 de noviembre de 2026 se implementaron las correcciones de A05 y A06:

- Popover se separó en `src/Popover.tsx` y `src/popover.css`, conservando sus exports anteriores. Abre un diálogo no modal con nombre accesible y foco inicial en el panel; Escape y cierre explícito restauran el foco, mientras que el cierre por clic o foco exterior respeta el destino elegido. Conserva eventos, refs y estado controlado; admite disparadores de texto y controles personalizados.
- El panel se ajusta al viewport, cambia de lado cuando hace falta y desplaza internamente el contenido largo. Las regresiones cubren apertura, cierre, Tab, controles externos, formularios, cancelación, refs, fragmentos, axe en claro/oscuro y tamaños pequeños, incluido redimensionamiento mientras permanece abierto.
- CI y publicación utilizan `npm run verify`, instalan dependencias desde el lockfile y preparan Edge explícitamente. La publicación por tag conserva la comprobación de versión y solo publica después de verificar. El comando del workflow omite hooks para no repetir la misma batería.
- Las publicaciones manuales también ejecutan `verify` mediante `prepublishOnly`. `tests/release-gate.test.mjs` ejecuta ese hook real con etapas sustituidas por verificaciones locales: comprueba el recorrido completo y que un fallo de cualquiera de las siete etapas detenga las siguientes. Esta prueba no publica paquetes ni se conecta al registro.

Las reproducciones de A01–A05 forman parte de `test:consumer`, y por tanto de CI y publicación. El YAML de ambos workflows se validó localmente; su ejecución en GitHub queda pendiente de subir estos cambios. A07–A09 corresponden al siguiente paso.

Validación final del paso 2: `verify` terminó con código 0. Pasaron API y tipos, ambos builds, las dos pruebas de Node (UI y bloqueo de publicación), 184 evaluaciones de ruta/tema, 92 rutas móviles, las 21 comprobaciones especializadas, el consumidor con las nuevas regresiones y las paletas. Se inspeccionaron capturas de Popover en escritorio y en móvil, incluida una ventana de 390 × 320 px.

## Seguimiento: paso 3

El 3 de noviembre de 2026 se implementaron las correcciones de A07–A09:

- Se sustituyó el workflow incompleto de Chromatic por comparaciones nativas de Playwright. Hay 28 PNG versionados: controles, formularios, superficies, Menu, Popover, Tooltip y AddressInput, en claro/oscuro y a 390/1280 px. Las referencias se generaron e inspeccionaron antes de consolidar el CSS; las comparaciones posteriores conservaron esas imágenes. Esta muestra no cubre visualmente los 98 componentes públicos.
- `test:visual` compara el consumidor construido desde el paquete real. Falla ante referencias ausentes o diferencias, sin actualizar imágenes automáticamente. `test:visual:update` permite actualizarlas explícitamente. El informe HTML, las capturas y los diffs se adjuntan en CI y publicación incluso al fallar. Los workflows usan Windows y Edge para aproximarse al entorno de revisión; su ejecución remota sigue pendiente de subir los cambios. Véase la [guía de capturas de Playwright](https://playwright.dev/docs/test-snapshots).
- La comparación detectó una regresión real al mover AddressInput: el texto de su botón de limpiar pasó de 13 a 14 px por la cascada de `font: inherit`. Se corrigió la especificidad y la batería visual pasó sin regenerar las referencias. La evidencia del fallo y su diff se conserva localmente en `verification/visual-proof/`.
- `tokens.json` concentra la escala y los roles tipográficos, pesos, alturas de línea, espaciado, radios y sombras. Se migraron 529 declaraciones de componentes conservando sus valores y se agruparon las reglas base de Button, Badge, Avatar, Toast y Table; AddressInput y Tooltip tienen CSS propio. `tokens:check` comprueba ambos archivos generados sin escribirlos y forma parte de los builds de biblioteca y de `verify`. Una comprobación aislada confirmó que rechaza divergencias, resuelve alias por tema y detecta ciclos.
- Se extrajeron 68 familias de clases exclusivas de ejemplos a `src/examples.css`, conservando sus condiciones responsive. La comprobación especializada de Separator detectó que su ejemplo de acento perdía el ancho de 48 px ante el CSS cargado bajo demanda; se reforzó el selector exclusivo del ejemplo y volvió a pasar. El manifiesto `scripts/example-css-classes.json` permite rechazar su reaparición en el CSS instalado. La aplicación consumidora comprueba también que los cambios de `--space-2` y `--text-ui` afecten al Button real.
- `styles.css` ya no registra ni incrusta fuentes. La nueva entrada opcional `@mokanadev/design-system/fonts.css` sirve siete subconjuntos WOFF2 independientes mediante `unicode-range`, junto con su licencia OFL. El consumidor en español solicita solo el archivo latino de 48.256 bytes; `/without-fonts.html` no registra ni solicita fuentes. Fontsource queda como dependencia de desarrollo. Se desactivó la copia de `public` al build de biblioteca y se retiró esa carpeta de los archivos publicados, evitando duplicados de medios de demostración.

| Medición | Auditoría inicial | Tras el paso 3 |
| --- | ---: | ---: |
| CSS de componentes | 425.175 bytes | 126.966 bytes |
| CSS con gzip | 244.665 bytes | 20.988 bytes |
| Fuentes incrustadas en ese CSS | 7 | 0 |
| Peticiones de fuente del consumidor en español | Incluidas en el CSS | 1 WOFF2 latino, opcional |

El ahorro del CSS es de aproximadamente 70 % sin comprimir y 91 % con gzip; la fuente opcional se transfiere por separado. **Migración:** las aplicaciones que quieran conservar Inter deben añadir `import '@mokanadev/design-system/fonts.css'` junto al import habitual de estilos. La documentación del sitio y las entradas del consumidor ya lo hacen.

La batería de publicación exige ahora nueve etapas, incluidos `tokens:check` y `test:visual`. La prueba del hook comprueba que el fallo de cada una impida continuar, sin publicar paquetes.

**Validación final del paso 3:** `npm.cmd run verify` terminó con código 0 después de corregir la prioridad del ejemplo de Separator. Pasaron tokens, API, TypeScript, ambos builds, las dos pruebas de Node, 184 evaluaciones de accesibilidad sin infracciones, 92 rutas móviles sin desbordamiento, seis flujos generales, las 21 comprobaciones especializadas, el consumidor con las regresiones de A01–A05 y las guardas de fuentes/CSS/tokens, las paletas y las **28 comparaciones visuales**. Los PNG de referencia no se actualizaron tras reorganizar los estilos. Los dos YAML se validaron localmente. Evidencias locales: `verification/verify-step-3.log`, `verification/verify-step-3-result.json`, `verification/package-step-3.json` y `verification/visual-report/index.html`.

El servidor de desarrollo quedó accesible en http://127.0.0.1:3060/introduction. Se utilizó el puerto 3060 porque el entorno rechazó el arranque de Vite en 3000; la configuración predeterminada del repositorio conserva 3000.
