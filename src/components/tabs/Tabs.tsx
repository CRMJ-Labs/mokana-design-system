/*
 * Tabs — secciones de un mismo módulo (patrón "tabs" de WAI-ARIA APG, activación automática).
 * Anatomía: Root · List · Trigger · Content
 * Teclado (Radix): ←/→ mueven y activan con bucle · Home/End · solo la pestaña activa es
 *   tabulable · Tab pasa al panel activo.
 * ARIA: List role="tablist" con nombre accesible obligatorio (`label`); Trigger role="tab" con
 *   aria-selected/aria-controls; Content role="tabpanel" con aria-labelledby.
 * Para filtros o vistas de una misma lista usa un control segmentado, no Tabs.
 * Sin animación al cambiar de pestaña: es una acción repetida.
 */
import * as RadixTabs from '@radix-ui/react-tabs';
import type { ComponentPropsWithRef } from 'react';
import './tabs.css';

export type TabsRootProps = ComponentPropsWithRef<typeof RadixTabs.Root>;

function TabsRoot({ className = '', ...props }: TabsRootProps) {
  return <RadixTabs.Root {...props} className={`mk-tabs-root ${className}`.trim()} />;
}

export interface TabsListProps extends Omit<ComponentPropsWithRef<typeof RadixTabs.List>, 'aria-label'> {
  /** Nombre accesible del grupo de pestañas (p. ej. "Secciones de finanzas"). */
  label: string;
}

function TabsList({ label, className = '', onFocus, ...props }: TabsListProps) {
  // Radix deja el contenedor tabulable para su foco itinerante. Tras un clic en una pestaña,
  // volver con Tab puede dejar el foco en el contenedor (verificado en Chromium); lo pasamos a
  // la pestaña activa para que siempre haya una sola parada útil.
  const handleFocus: TabsListProps['onFocus'] = (event) => {
    onFocus?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    event.currentTarget.querySelector<HTMLElement>('[role="tab"][data-state="active"]:not([disabled])')?.focus();
  };
  return (
    <RadixTabs.List
      {...props}
      onFocus={handleFocus}
      aria-label={label}
      className={`mk-tabs ${className}`.trim()}
    />
  );
}

export type TabsTriggerProps = ComponentPropsWithRef<typeof RadixTabs.Trigger>;

function TabsTrigger({ className = '', ...props }: TabsTriggerProps) {
  return <RadixTabs.Trigger {...props} className={`mk-tab ${className}`.trim()} />;
}

export type TabsContentProps = ComponentPropsWithRef<typeof RadixTabs.Content>;

function TabsContent({ className = '', ...props }: TabsContentProps) {
  return <RadixTabs.Content {...props} className={`mk-tab-panel ${className}`.trim()} />;
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};
