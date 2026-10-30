import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button } from '../../components';
import { Popover } from './Popover';

const meta = {
  title: 'Components/Popover',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Panel no modal anclado a un disparador. Esc y clic fuera cierran y el foco vuelve al disparador. ' +
          'Se monta dentro del contenedor `.mk` para heredar el tema. Para confirmar acciones destructivas usa `Modal`.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="mk-row">
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="sm">
            Detalles del cliente
          </Button>
        </Popover.Trigger>
        <Popover.Content
          title="Comercial Atlántico S.A.S."
          description="Cliente desde marzo de 2026 · Barranquilla"
          closeLabel="Cerrar detalles"
        >
          <div className="mk-row">
            <Badge tone="success">Al día</Badge>
            <Badge>3 proyectos</Badge>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm">
          Compartir acceso
        </Button>
      </Popover.Trigger>
      <Popover.Content title="Compartir acceso" description="Solo verán este proyecto." width="sm">
        <div className="mk-actions">
          <Popover.Close asChild>
            <Button variant="ghost" size="sm">
              Cancelar
            </Button>
          </Popover.Close>
          <Button size="sm">Copiar enlace</Button>
        </div>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const OpenByDefault: Story = {
  render: () => (
    <div style={{ minHeight: 220 }}>
      <Popover.Root defaultOpen>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="sm">
            Ayuda
          </Button>
        </Popover.Trigger>
        <Popover.Content title="¿Qué es un umbral?" closeLabel="Cerrar ayuda" width="lg">
          <p>El monto a partir del cual el gasto pide aprobación. Puedes cambiarlo en Ajustes.</p>
        </Popover.Content>
      </Popover.Root>
    </div>
  ),
};
