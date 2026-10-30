import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components';
import { DropdownMenu } from './DropdownMenu';

const meta = {
  title: 'Components/Dropdown Menu',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Menú de acciones con el patrón "menu button": flechas, Home/End, letra para saltar, Esc cierra y ' +
          'devuelve el foco. Úsalo con 3+ acciones por fila; lo destructivo va al final, separado y con un verbo explícito.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function RowMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <DropdownMenu.Root defaultOpen={defaultOpen} modal={!defaultOpen}>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm" icon="chevron">
          Acciones
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Contacto</DropdownMenu.Label>
        <DropdownMenu.Item icon="arrow" shortcut="E">
          Editar
        </DropdownMenu.Item>
        <DropdownMenu.Item icon="plus" shortcut="D">
          Duplicar
        </DropdownMenu.Item>
        <DropdownMenu.Item icon="check" disabled>
          Marcar como cliente
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon="close" tone="danger">
          Eliminar contacto
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export const Overview: Story = { render: () => <RowMenu /> };

export const Open: Story = {
  render: () => (
    <div style={{ minHeight: 260, display: 'flex', justifyContent: 'flex-end' }}>
      <RowMenu defaultOpen />
    </div>
  ),
};
