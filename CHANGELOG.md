# Changelog

## Sin publicar

Propuesta: publicar como **0.2.0** (cambios incompatibles en `Popover`, `DropdownMenu` y `Tabs`, y en
los temas de producto).

### Cambios incompatibles

- **`Popover`, `DropdownMenu` y `Tabs` pasan a API compuesta sobre Radix UI** (primitivas sin
  estilos; el aspecto sigue siendo 100% Mokaná). Resuelven teclado, foco, ARIA, cierre con Esc y clic
  fuera, y posicionamiento con detección de colisiones. Ver la migración abajo.
- `MenuItem` (tipo) se elimina; los ítems son componentes (`DropdownMenu.Item`).
- Temas de producto `biyu` y `tuscan` eliminados (commit `6421cea`). Quien use
  `data-product="biyu" | "tuscan"` cae en el tema base. **Zenit los declara en
  `packages/ui/src/themes.ts`**: decidir antes de actualizar.
- Tipografía: Inter Variable en todos los roles, servida desde `@fontsource-variable/inter`; se
  retiran Manrope y Fredoka autoalojadas (commits `ffdb71d` y `990bb91`).
- Botones con tokens propios (`button-primary-background`, `button-secondary-*`,
  `button-ghost-text`): el primario pasa de lime a ink/paper (commit `990bb91`).
- Foco de campos de formulario según Figma: borde y anillo de 2px sin desplazamiento (commit `88387c2`).

### Añadido

- Tokens `danger-light`, `danger-dark` y el rol semántico `danger-text`. El rojo anterior
  (`#b42318`, escrito a mano) tenía contraste 2.61:1 en modo oscuro; el nuevo valor oscuro
  (`#f97066`) da 6.15:1 sobre `surface-dark`. Se aplica a ítems destructivos, `Toast` y
  `ProgressBar` de error.
- Tests por componente (Vitest + Testing Library, `npm test`) y CI en cada PR. La publicación en npm
  no corre si fallan typecheck, tests o build.

### Migración

```tsx
// Antes
<Tabs tabs={[{ id: 'a', label: 'Ingresos' }]} active={tab} onChange={setTab} label="Finanzas" />

// Ahora: cada pestaña controla su panel
<Tabs.Root value={tab} onValueChange={setTab}>
  <Tabs.List label="Secciones de finanzas">
    <Tabs.Trigger value="a">Ingresos</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">…</Tabs.Content>
</Tabs.Root>
```

```tsx
// Antes
<DropdownMenu label="Acciones" items={[{ label: 'Eliminar', danger: true, onSelect: remove }]} />

// Ahora: el disparador es cualquier botón del sistema
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <Button variant="ghost" size="sm" icon="chevron">Acciones</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item icon="close" tone="danger" onSelect={remove}>Eliminar contacto</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

```tsx
// Antes
<Popover title="Detalles" trigger={<Button>Ver</Button>}>…</Popover>

// Ahora: sin textos fijos; el cierre aparece solo con closeLabel
<Popover.Root>
  <Popover.Trigger asChild><Button variant="ghost">Ver</Button></Popover.Trigger>
  <Popover.Content title="Detalles" closeLabel="Cerrar detalles">…</Popover.Content>
</Popover.Root>
```

Los paneles flotantes se montan dentro del contenedor `.mk` más cercano al disparador, así heredan
tema y tokens sin configuración.

## 0.1.0 — 2026-10-22

Primera publicación como `@mokanadev/design-system`.
