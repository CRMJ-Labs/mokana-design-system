/*
 * DropdownMenu — menú de acciones (patrón "menu button" de WAI-ARIA APG).
 * Anatomía: Root · Trigger · Content · Item · Label · Separator · Group
 * Teclado (Radix): Enter/Espacio/↓ abre y enfoca el primer ítem · ↑ abre en el último ·
 *   ↑/↓ recorren con bucle · Home/End · letra salta al ítem · Enter/Espacio activa ·
 *   Esc cierra y devuelve el foco al disparador · Tab cierra.
 * ARIA: Trigger aria-haspopup/aria-expanded/aria-controls; Content role="menu"; Item role="menuitem".
 * Uso: acciones de fila con 3+ opciones. Lo destructivo va al final, tras un Separator,
 *   con tone="danger" y un verbo explícito ("Eliminar contacto").
 */
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Icon, type IconName } from '../../components';
import { PortalContainerProvider, composeRefs, usePortalContainer } from '../internal/portal-container';
import '../internal/overlay.css';
import './dropdown-menu.css';

export type DropdownMenuRootProps = RadixMenu.DropdownMenuProps;

function DropdownMenuRoot(props: DropdownMenuRootProps) {
  return (
    <PortalContainerProvider>
      <RadixMenu.Root {...props} />
    </PortalContainerProvider>
  );
}

export type DropdownMenuTriggerProps = ComponentPropsWithRef<typeof RadixMenu.Trigger>;

function DropdownMenuTrigger({ ref, ...props }: DropdownMenuTriggerProps) {
  const { anchorRef } = usePortalContainer();
  return <RadixMenu.Trigger ref={composeRefs(ref, anchorRef)} {...props} />;
}

export type DropdownMenuContentProps = ComponentPropsWithRef<typeof RadixMenu.Content>;

function DropdownMenuContent({
  className = '',
  align = 'end',
  sideOffset = 6,
  collisionPadding = 16,
  loop = true,
  ...props
}: DropdownMenuContentProps) {
  const { container } = usePortalContainer();
  return (
    <RadixMenu.Portal container={container}>
      <RadixMenu.Content
        {...props}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        className={`mk-overlay mk-menu ${className}`.trim()}
      />
    </RadixMenu.Portal>
  );
}

export type DropdownMenuItemTone = 'default' | 'danger';

export interface DropdownMenuItemProps extends ComponentPropsWithRef<typeof RadixMenu.Item> {
  icon?: IconName;
  tone?: DropdownMenuItemTone;
  /** Atajo de teclado mostrado a la derecha (solo informativo). */
  shortcut?: ReactNode;
}

function DropdownMenuItem({ icon, tone = 'default', shortcut, className = '', children, ...props }: DropdownMenuItemProps) {
  return (
    <RadixMenu.Item {...props} data-tone={tone} className={`mk-menu-item ${className}`.trim()}>
      {icon && <Icon name={icon} />}
      <span className="mk-menu-item-label">{children}</span>
      {shortcut && <kbd className="mk-menu-shortcut">{shortcut}</kbd>}
    </RadixMenu.Item>
  );
}

export type DropdownMenuLabelProps = ComponentPropsWithRef<typeof RadixMenu.Label>;

function DropdownMenuLabel({ className = '', ...props }: DropdownMenuLabelProps) {
  return <RadixMenu.Label {...props} className={`mk-menu-label ${className}`.trim()} />;
}

export type DropdownMenuSeparatorProps = ComponentPropsWithRef<typeof RadixMenu.Separator>;

function DropdownMenuSeparator({ className = '', ...props }: DropdownMenuSeparatorProps) {
  return <RadixMenu.Separator {...props} className={`mk-menu-separator ${className}`.trim()} />;
}

export type DropdownMenuGroupProps = ComponentPropsWithRef<typeof RadixMenu.Group>;

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <RadixMenu.Group {...props} />;
}

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
};
