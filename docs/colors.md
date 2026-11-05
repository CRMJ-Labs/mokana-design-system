# Colores de MOK

MOK utiliza los 74 roles del tema predeterminado de MOK: colores primitivos,
acento, neutros, estados, variantes suaves, textos, fondos, superficies, campos,
bordes, separadores, transparencias y sombras. Se conservan las expresiones OKLCH
y las fórmulas `color-mix` de la referencia fijada, sin convertir la paleta a hex ni
modificarla para obtener otros contrastes.

- Catálogo: `/foundations/colors`.
- Fuente fijada: docs/reference/default-theme/variables.css
- Referencia con las declaraciones de color sin modificar: `docs/reference/default-theme/variables.css`.
- Licencia y atribución: `THIRD_PARTY_NOTICES.md` y `licenses/Apache-2.0.txt`.

`tokens.json` es la fuente de los valores de MOK. `npm run tokens` genera el CSS y
`palette-defaults.generated.ts`. El importador `node scripts/import-colors.mjs`
permite reconstruir los colores desde la referencia fijada; su ejecución
reemplaza las personalizaciones de color presentes en `tokens.json`.

La ruta `/foundations/colors` documenta cada rol en claro y oscuro.

Los campos de MOK usan `--border-secondary` en reposo y `--border-tertiary` al
pasar el cursor. Esto mantiene su contorno visible incluso sobre una tarjeta
con el mismo fondo, sin cambiar el valor transparente original de
`--field-border`. El foco usa `--focus` y los errores conservan `--danger`.

## Uso e integración

Los roles semánticos están disponibles dentro de `.mk`, por ejemplo
`--accent`, `--accent-soft`, `--danger`, `--field-background` y `--border`.
Los nombres anteriores de MOK conservan su compatibilidad como alias: `--secondary`
usa `--muted`, `--brand-primary` usa `--accent`, y `--error-text` usa
`--danger-soft-foreground`. Los antiguos nombres de marca Ink, Violet, Lime, Cyan
y Paper también apuntan a colores de MOK.

MOK no incluye un estado `info` independiente; los componentes informativos de
MOK usan el acento oficial. `--overlay` ahora corresponde a la superficie flotante
de MOK; los fondos que oscurecen la página detrás de un diálogo usan `--backdrop`.

`mokPalette` conserva los colores oficiales sin ajustes y coincide con el CSS
predeterminado. `createPalette` sigue disponible para crear paletas personalizadas:
acepta semillas hexadecimales, adapta los roles originales y heredados, y ajusta
su contraste. Sus resultados no son la paleta oficial de MOK.

## Verificación y contraste

`node scripts/check-colors.mjs` compara las declaraciones y los colores
calculados de los 74 roles contra la referencia fijada, en ambos temas. También
comprueba `mokPalette`, las vistas anidadas y la cobertura del catálogo. El informe
se guarda en `verification/color-parity.json`.

La coincidencia exacta de paleta no garantiza AA para cualquier combinación.
Las comprobaciones de accesibilidad siguen siendo estrictas y **no se desactivan**:
detectan, entre otras combinaciones, `muted` sobre el fondo claro (4.43:1 para
texto pequeño, por debajo de 4.5:1) y texto claro sobre el acento azul. Se mantienen
esos colores originales por el requisito de mantener la paleta. El informe
completo de la auditoría del sitio se encuentra en `test-results/ui-report.json`;
no debe interpretarse esta migración como una certificación AA del sistema.
