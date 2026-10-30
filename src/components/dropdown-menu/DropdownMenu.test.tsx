import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../components';
import { DropdownMenu } from './DropdownMenu';

function Example({ onEdit = () => {}, onDelete = () => {} }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="mk" data-testid="root">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost">Acciones</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Contacto</DropdownMenu.Label>
          <DropdownMenu.Item icon="plus" onSelect={onEdit}>
            Editar
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled>Duplicar</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item tone="danger" onSelect={onDelete}>
            Eliminar contacto
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}

describe('DropdownMenu', () => {
  it('usa el Button del sistema como disparador con el patrón menu button', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });
    expect(trigger).toHaveClass('mk-button', 'mk-button-ghost');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter abre, enfoca el primer ítem y las flechas saltan los deshabilitados', async () => {
    const user = userEvent.setup();
    render(<Example />);
    screen.getByRole('button', { name: 'Acciones' }).focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Eliminar contacto' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();
  });

  it('activa con Enter, cierra y devuelve el foco', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<Example onDelete={onDelete} />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });
    trigger.focus();
    await user.keyboard('{Enter}{End}{Enter}');

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('Esc cierra sin ejecutar acciones y devuelve el foco', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Example onEdit={onEdit} />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });
    trigger.focus();
    await user.keyboard('{Enter}{Escape}');

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('marca el tono destructivo y se monta dentro de .mk', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Acciones' }));
    expect(screen.getByRole('menuitem', { name: 'Eliminar contacto' })).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByTestId('root')).toContainElement(screen.getByRole('menu'));
  });
});
