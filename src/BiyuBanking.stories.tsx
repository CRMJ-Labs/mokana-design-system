import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button, Card, Table } from './components';

type Movement = { id:string; description:string; category:string; amount:string; incoming?:boolean };
const movements: Movement[] = [
  { id:'1', description:'Nómina', category:'Ingreso', amount:'+$4.280.000', incoming:true },
  { id:'2', description:'Mercado local', category:'Alimentación', amount:'−$186.400' },
  { id:'3', description:'Suscripción de música', category:'Entretenimiento', amount:'−$24.900' },
];

function BankingDashboard(){return <main className="mk-container mk-stack biyu-demo"><header className="mk-demo-header"><div><p className="mk-eyebrow">BIYÚ · TU PLATA, CLARA</p><h1>Buenos días, Milton.</h1></div><Button variant="ghost">Privacidad local</Button></header><section className="biyu-balance"><div><p className="mk-eyebrow">SALDO DISPONIBLE</p><strong>$8.450.320</strong><p>Actualizado ahora · Datos de demostración</p></div><div className="mk-actions"><Button>Transferir</Button><Button variant="secondary">Añadir movimiento</Button></div></section><section className="mk-stack"><h2>Resumen financiero</h2><div className="mk-grid"><Card title="Ingresos" eyebrow="ESTE MES"><span className="mk-metric">$5,2 M</span><Badge tone="success">+8% frente al mes anterior</Badge></Card><Card title="Gastos" eyebrow="ESTE MES"><span className="mk-metric">$2,1 M</span><p className="mk-subtle">40% del ingreso mensual</p></Card><Card title="Meta de ahorro" eyebrow="VIAJE"><span className="mk-metric">72%</span><div className="biyu-progress"><span/></div></Card></div></section><section className="mk-stack"><div className="mk-row" style={{justifyContent:'space-between'}}><div><p className="mk-eyebrow">MOVIMIENTOS</p><h2>Lo último en tu cuenta</h2></div><Button variant="ghost">Ver todos</Button></div><Table caption="Movimientos recientes · datos de demostración" rows={movements} rowKey={row=>row.id} columns={[{key:'description',header:'Descripción',render:row=><strong>{row.description}</strong>},{key:'category',header:'Categoría',render:row=><Badge>{row.category}</Badge>},{key:'amount',header:'Valor',render:row=><span className={row.incoming?'biyu-income':''}>{row.amount}</span>}]} /></section></main>}

const meta = { title:'Patterns/Banking · BIYÚ', component:BankingDashboard, globals:{product:'biyu',theme:'light'}, parameters:{layout:'fullscreen'} } satisfies Meta<typeof BankingDashboard>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Dashboard:Story={};

