import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

function Example() {
  return (
    <Tabs.Root defaultValue="ingresos">
      <Tabs.List label="Secciones de finanzas">
        <Tabs.Trigger value="ingresos">Ingresos</Tabs.Trigger>
        <Tabs.Trigger value="gastos">Gastos</Tabs.Trigger>
        <Tabs.Trigger value="cierre" disabled>
          Cierre
        </Tabs.Trigger>
        <Tabs.Trigger value="presupuesto">Presupuesto</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="ingresos">Tabla de ingresos</Tabs.Content>
      <Tabs.Content value="gastos">Tabla de gastos</Tabs.Content>
      <Tabs.Content value="cierre">Cierre del mes</Tabs.Content>
      <Tabs.Content value="presupuesto">Presupuesto anual</Tabs.Content>
    </Tabs.Root>
  );
}

describe('Tabs', () => {
  it('enlaza pestañas y paneles con nombre accesible', () => {
    render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Secciones de finanzas' })).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: 'Ingresos' });
    const panel = screen.getByRole('tabpanel', { name: 'Ingresos' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveTextContent('Tabla de ingresos');
  });

  it('una sola parada de tabulación: la pestaña activa', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Antes</button>
        <Example />
      </>,
    );
    // Recorrido solo con teclado: entrar, elegir "Gastos", salir y volver.
    await user.tab();
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Ingresos' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Antes' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Gastos' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Gastos' })).toHaveFocus();
  });

  it('tras elegir con el ratón, volver con Tab enfoca la pestaña activa y no el contenedor', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Antes</button>
        <Example />
      </>,
    );
    await user.click(screen.getByRole('tab', { name: 'Presupuesto' }));
    screen.getByRole('button', { name: 'Antes' }).focus();
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Presupuesto' })).toHaveFocus();
  });

  it('las flechas mueven, activan y saltan las deshabilitadas', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Ingresos' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Gastos' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Tabla de gastos');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Presupuesto' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Ingresos' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Tab pasa de la pestaña activa a su panel', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Ingresos' })).toHaveFocus();
  });
});
