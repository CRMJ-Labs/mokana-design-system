/*
 * Popover — panel no modal anclado a un disparador.
 * Anatomía: Root · Trigger · Content (título, descripción, cierre opcional) · Close
 * Teclado (Radix, patrón dialog no modal): Enter/Espacio abre · Esc cierra y devuelve el foco
 *   al disparador · Tab recorre el contenido · clic fuera cierra.
 * ARIA: Trigger con aria-expanded/aria-controls; Content role="dialog" con aria-labelledby/
 *   aria-describedby cuando hay título o descripción.
 * Textos: ninguno fijo; el botón de cierre solo aparece si se pasa `closeLabel`.
 */
import * as RadixPopover from '@radix-ui/react-popover';
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Icon } from '../../components';
import { PortalContainerProvider, composeRefs, usePortalContainer } from '../internal/portal-container';
import '../internal/overlay.css';
import './popover.css';

export type PopoverRootProps = RadixPopover.PopoverProps;

function PopoverRoot(props: PopoverRootProps) {
  return (
    <PortalContainerProvider>
      <RadixPopover.Root {...props} />
    </PortalContainerProvider>
  );
}

export type PopoverTriggerProps = ComponentPropsWithRef<typeof RadixPopover.Trigger>;

function PopoverTrigger({ ref, ...props }: PopoverTriggerProps) {
  const { anchorRef } = usePortalContainer();
  return <RadixPopover.Trigger ref={composeRefs(ref, anchorRef)} {...props} />;
}

export type PopoverWidth = 'sm' | 'md' | 'lg';

export interface PopoverContentProps extends Omit<ComponentPropsWithRef<typeof RadixPopover.Content>, 'title'> {
  /** Título visible; también da nombre accesible al panel. */
  title?: ReactNode;
  description?: ReactNode;
  /** Nombre accesible del botón de cierre. Si se omite, no se muestra el botón. */
  closeLabel?: string;
  /** sm 240px · md 320px · lg 400px. */
  width?: PopoverWidth;
}

function PopoverContent({
  title,
  description,
  closeLabel,
  width = 'md',
  className = '',
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: PopoverContentProps) {
  const { container } = usePortalContainer();
  const id = useId();
  const titleId = title ? `${id}-title` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const hasHeader = Boolean(title || closeLabel);

  return (
    <RadixPopover.Portal container={container}>
      <RadixPopover.Content
        {...props}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        aria-labelledby={props['aria-labelledby'] ?? titleId}
        aria-describedby={props['aria-describedby'] ?? descriptionId}
        className={`mk-overlay mk-popover mk-popover-${width} ${className}`.trim()}
      >
        {hasHeader && (
          <div className="mk-popover-header">
            {title && (
              <p className="mk-popover-title" id={titleId}>
                {title}
              </p>
            )}
            {closeLabel && (
              <RadixPopover.Close className="mk-popover-close" aria-label={closeLabel} title={closeLabel}>
                <Icon name="close" />
              </RadixPopover.Close>
            )}
          </div>
        )}
        {description && (
          <p className="mk-popover-description" id={descriptionId}>
            {description}
          </p>
        )}
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}

export type PopoverCloseProps = ComponentPropsWithRef<typeof RadixPopover.Close>;

function PopoverClose(props: PopoverCloseProps) {
  return <RadixPopover.Close {...props} />;
}

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
};
