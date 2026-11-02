# Aplicación consumidora de MOK

Esta aplicación React + Vite tiene su propio `package.json` y consume el archivo `.tgz` de la biblioteca. No utiliza alias a `src`, enlaces de workspace ni el CSS de documentación.

Desde la raíz del repositorio:

```sh
npm run consumer:prepare
npm run consumer:dev
```

Abre http://127.0.0.1:3001. La documentación mantiene el puerto 3000.

La comparación de componentes está en http://127.0.0.1:3001/palette.html. Esta vista consume `src/palette.ts`: cambia `brand` en `createPalette` para personalizar la aplicación completa y `defaultAppPalette` para elegir la inicial. El selector MOK / verde / azul permite comprobarlo en vivo. `PaletteProvider` aplica los tokens y el tema; la vista utiliza tokens semánticos compartidos.

`consumer:prepare` compila la biblioteca, ejecuta `npm pack`, instala el paquete resultante y compila la aplicación con los tipos publicados. Ejecútalo de nuevo después de cambiar componentes: el servidor usa la versión instalada, no los archivos fuente. El archivo de bloqueo se actualiza con la integridad del nuevo paquete local.

Después de regenerar el paquete, reinicia `consumer:dev`. El arranque fuerza la actualización de la caché de Vite para reconocer exports nuevos aunque la versión local siga siendo la misma.

```sh
npm run test:consumer
```

La prueba vuelve a preparar el paquete y comprueba cambios de tema y persistencia, creación de proyectos, formulario nativo, modal y recuperación del foco, notificaciones, marca sin archivos externos, accesibilidad y ausencia de desbordamiento a 390 y 1280 px. También comprueba que el CSS instalado no incluya clases de documentación ni imponga padding o altura mínima a `.mk`.

Los proyectos viven en memoria y se reinician al recargar; el tema se guarda en el navegador. Esta aplicación sirve para probar la integración del paquete, sin backend.

La vista de proyectos usa `DataTable` del paquete con búsqueda, ordenación, selección controlada y paginación. La prueba también comprueba búsqueda sin acentos, selección tras filtrar y navegación entre páginas.

El layout pertenece a `src/app.css`. El import público `@mokanadev/design-system/styles.css` proporciona tokens, tipografía, estilos base y componentes. `ThemeProvider` gestiona la preferencia y `useTheme` permite aplicar `data-theme` a la raíz `.mk`; `ToastProvider` se coloca dentro para heredar los tokens.
