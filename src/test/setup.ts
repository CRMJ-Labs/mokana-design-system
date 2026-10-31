import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());

// jsdom no implementa estas APIs; Radix (posicionamiento y puntero) las necesita.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const proto = HTMLElement.prototype as HTMLElement & {
  hasPointerCapture?: (id: number) => boolean;
  releasePointerCapture?: (id: number) => void;
};
proto.hasPointerCapture ??= () => false;
proto.releasePointerCapture ??= () => {};
proto.scrollIntoView ??= () => {};
