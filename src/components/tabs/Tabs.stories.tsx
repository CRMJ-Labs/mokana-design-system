import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Secciones de un mismo módulo. ←/→ mueven y activan, Home/End, una sola parada de tabulación y paneles ' +
          'enlazados. Para filtrar una misma lista usa un control segmentado. El cambio de pestaña no se anima.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Tabs.Root defaultValue="ingresos">
      <Tabs.List label="Secciones de finanzas">
        <Tabs.Trigger value="ingresos">Ingresos</Tabs.Trigger>
        <Tabs.Trigger value="gastos">Gastos</Tabs.Trigger>
        <Tabs.Trigger value="presupuesto">Presupuesto</Tabs.Trigger>
        <Tabs.Trigger value="cierre" disabled>
          Cierre del mes
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="ingresos">
        <p>Ingresos registrados este mes.</p>
      </Tabs.Content>
      <Tabs.Content value="gastos">
        <p>Gastos por categoría y responsable.</p>
      </Tabs.Content>
      <Tabs.Content value="presupuesto">
        <p>Presupuesto anual y desviación.</p>
      </Tabs.Content>
      <Tabs.Content value="cierre">
        <p>Disponible al terminar el mes.</p>
      </Tabs.Content>
    </Tabs.Root>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('activos');
    return (
      <div className="mk-stack">
        <Tabs.Root value={value} onValueChange={setValue}>
          <Tabs.List label="Estado de las apps">
            <Tabs.Trigger value="activos">Activas</Tabs.Trigger>
            <Tabs.Trigger value="pausadas">Pausadas</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="activos">
            <p>Apps en producción.</p>
          </Tabs.Content>
          <Tabs.Content value="pausadas">
            <p>Apps sin tráfico.</p>
          </Tabs.Content>
        </Tabs.Root>
        <p className="mk-subtle">Valor actual: {value}</p>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tabs.Root defaultValue="t1">
        <Tabs.List label="Muchas secciones">
          {['Resumen', 'Leads', 'Clientes', 'Contratos', 'Facturas', 'Pagos', 'Ajustes'].map((label, i) => (
            <Tabs.Trigger key={label} value={`t${i + 1}`}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {['Resumen', 'Leads', 'Clientes', 'Contratos', 'Facturas', 'Pagos', 'Ajustes'].map((label, i) => (
          <Tabs.Content key={label} value={`t${i + 1}`}>
            <p>{label}: con muchas pestañas la lista se desplaza en horizontal sin barra visible.</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  ),
};
