import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Popover } from './Popover';

function Example() {
  return (
    <div className="mk" data-testid="root">
      <Popover.Root>
        <Popover.Trigger>Detalles</Popover.Trigger>
        <Popover.Content title="Proyecto Zenit" description="Panel interno" closeLabel="Cerrar detalles">
          <button type="button">Acción interna</button>
        </Popover.Content>
      </Popover.Root>
      <button type="button">Fuera</button>
    </div>
  );
}

describe('Popover', () => {
  it('abre con el teclado y expone el estado en el disparador', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Detalles' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await user.keyboard('{Enter}');

    const dialog = screen.getByRole('dialog', { name: 'Proyecto Zenit' });
    expect(dialog).toHaveAccessibleDescription('Panel interno');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
  });

  it('se monta dentro del contenedor .mk para heredar el tema', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Detalles' }));
    expect(screen.getByTestId('root')).toContainElement(screen.getByRole('dialog'));
  });

  it('Esc cierra y devuelve el foco al disparador', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Detalles' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('cierra con el botón de cierre y con clic fuera', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Detalles' });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Cerrar detalles' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Fuera' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sin closeLabel no muestra botón de cierre ni textos fijos', async () => {
    const user = userEvent.setup();
    render(
      <div className="mk">
        <Popover.Root>
          <Popover.Trigger>Abrir</Popover.Trigger>
          <Popover.Content title="Solo título">Contenido</Popover.Content>
        </Popover.Root>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('dialog')).not.toContainElement(screen.queryByRole('button'));
  });
});
