# InputFile

- Fecha: 2026-11-16 · Tipo: componente
- Página: `/components/input-file`

Selector compacto basado en `input type="file"`, con los tokens y estados de los campos MOK. Se exporta como `InputFile` e `InputFileProps` desde `@mokanadev/design-system`. `FileUpload` conserva su zona de carga existente.

```tsx
<InputFile label="Adjuntar documento" name="document" accept=".pdf,application/pdf"
  hint="Selecciona un PDF." onValueChange={files => handleFiles(files)} />
```

## API

- Nombre accesible obligatorio en TypeScript: `label`, `aria-label` o `aria-labelledby`.
- `hint` / `error`: ayuda o error; el error tiene prioridad, establece `aria-invalid` y se anuncia con una región viva cortés.
- `size`: `sm` (36 px), `md` (44 px, predeterminado), `lg` (48 px).
- `onChange(event)`: evento React nativo.
- `onValueChange(files: FileList | null)`: notificación posterior al evento nativo; `preventDefault` en `onChange` la suprime sin revertir la selección.
- `ref`, `className`, `style`, `id`, atributos ARIA y atributos nativos llegan al input. `rootProps` personaliza el contenedor `div`, incluido su ref.
- Admite `accept`, `multiple`, `capture`, `name`, `form`, `required` y `disabled`. Se excluyen `type`, `children`, `value`, `defaultValue` y `readOnly` del contrato público.

## Comportamiento

El navegador gestiona selección, nombres, teclado, cancelación y restablecimiento. Tab enfoca el control; Espacio o Enter abre el selector. Los textos internos del selector siguen el idioma del navegador. Los archivos participan en `FormData` mediante `name`. Con `multiple`, usa `FormData.getAll(name)`.

`form.reset()` o un botón `type="reset"` limpian la selección. También puedes asignar `''` a `ref.current.value`. Ninguna de estas operaciones emite `change`: la aplicación debe limpiar su estado derivado si lo mantiene. No se intenta controlar archivos mediante un valor React.

`aria-describedby` del consumidor se combina con la ayuda o el error. El control conserva un único borde rojo al recibir foco en estado de error. Los temas y la dirección de lectura se heredan; los nombres largos se recortan visualmente dentro del campo sin desbordar el contenedor.

`accept` es una indicación para el selector, no una validación. La aplicación y el servidor administran restricciones de tamaño, contenido, envío, errores remotos y progreso. El componente no realiza peticiones de red.

## Verificación

`node scripts/check-input-file.mjs` comprueba selección simple y múltiple, nombres con Unicode, FormData, required, reset, ref, filtro accept, asociación de ayuda y error, tamaños, disabled, apertura por teclado, temas y móvil.

Verificado: TypeScript, referencia de API, compilaciones del sitio y la biblioteca, pruebas espec?ficas en Edge y contrato del paquete instalado (eventos, orden de callbacks, preventDefault, referencias, FormData y accesibilidad). Capturas revisadas en escritorio claro y m?vil oscuro. La prueba general del consumidor se detiene antes de los contratos por contraste en badges de ?xito ajenos a InputFile.
