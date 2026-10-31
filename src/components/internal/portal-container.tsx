import { createContext, useCallback, useContext, useState, type ReactNode, type Ref, type RefCallback } from 'react';

/**
 * Los paneles flotantes de Radix se montan en un portal. Si el portal cae en `document.body`
 * pierden los tokens y el tema, que viven en el contenedor `.mk` más cercano. Este contexto
 * guarda ese contenedor a partir del disparador para que el portal se monte dentro de él.
 */
interface PortalContainerContextValue {
  container: HTMLElement | null;
  anchorRef: RefCallback<HTMLElement>;
}

const PortalContainerContext = createContext<PortalContainerContextValue | null>(null);

export interface PortalContainerProviderProps {
  children: ReactNode;
}

export function PortalContainerProvider({ children }: PortalContainerProviderProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const anchorRef = useCallback<RefCallback<HTMLElement>>((node) => {
    setContainer(node?.closest<HTMLElement>('.mk') ?? null);
  }, []);
  return <PortalContainerContext.Provider value={{ container, anchorRef }}>{children}</PortalContainerContext.Provider>;
}

export function usePortalContainer(): PortalContainerContextValue {
  const value = useContext(PortalContainerContext);
  if (!value) throw new Error('El componente flotante debe usarse dentro de su Root.');
  return value;
}

/** Une varias refs (callback u objeto) en una sola. */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}
