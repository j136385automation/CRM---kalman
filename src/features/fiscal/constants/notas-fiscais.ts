export type TipoNota =
  | 'Compra'
  | 'Venda'
  | 'Consignação'
  | 'Devolução de peças'
  | 'Devolução de acessórios';

export type StatusNota = 'Emitida' | 'Pendente' | 'Cancelada';

export type RegimeTributario = 'Simples Nacional' | 'Regime Normal';

export type NotaFiscal = {
  id: number;
  numero: string;
  tipo: TipoNota;
  cliente: string;
  veiculo: string;
  valor: number;
  status: StatusNota;
  data: string;
  created_at: string;
  updated_at: string;
};

export const TIPO_NOTA_OPTIONS: { value: TipoNota; label: TipoNota }[] = [
  { value: 'Compra', label: 'Compra' },
  { value: 'Venda', label: 'Venda' },
  { value: 'Consignação', label: 'Consignação' },
  { value: 'Devolução de peças', label: 'Devolução de peças' },
  { value: 'Devolução de acessórios', label: 'Devolução de acessórios' }
];

export const STATUS_NOTA_OPTIONS: { value: StatusNota; label: StatusNota }[] = [
  { value: 'Emitida', label: 'Emitida' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Cancelada', label: 'Cancelada' }
];

export const REGIME_TRIBUTARIO_OPTIONS: { value: RegimeTributario; label: RegimeTributario }[] = [
  { value: 'Simples Nacional', label: 'Simples Nacional' },
  { value: 'Regime Normal', label: 'Regime Normal' }
];

export const NOTAS_FISCAIS_MOCK: NotaFiscal[] = [
  {
    id: 1,
    numero: 'NF-e 000.001.482',
    tipo: 'Venda',
    cliente: 'Carlos Eduardo Santos',
    veiculo: 'Toyota Corolla XEi 2022 · PRK-4F28',
    valor: 118900,
    status: 'Emitida',
    data: '2025-11-28T10:30:00.000Z',
    created_at: '2025-11-28T10:30:00.000Z',
    updated_at: '2025-11-28T10:30:00.000Z'
  },
  {
    id: 2,
    numero: 'NF-e 000.001.481',
    tipo: 'Compra',
    cliente: 'Auto Leilões Curitiba LTDA',
    veiculo: 'Honda Civic Touring 2021 · QWE-8B13',
    valor: 132500,
    status: 'Emitida',
    data: '2025-11-25T14:12:00.000Z',
    created_at: '2025-11-25T14:12:00.000Z',
    updated_at: '2025-11-25T14:12:00.000Z'
  },
  {
    id: 3,
    numero: 'NF-e 000.001.480',
    tipo: 'Consignação',
    cliente: 'Mariana Ferreira Costa',
    veiculo: 'Jeep Compass Longitude 2020 · RTY-2C77',
    valor: 114000,
    status: 'Pendente',
    data: '2025-11-22T09:45:00.000Z',
    created_at: '2025-11-22T09:45:00.000Z',
    updated_at: '2025-11-26T11:05:00.000Z'
  },
  {
    id: 4,
    numero: 'NF-e 000.001.479',
    tipo: 'Venda',
    cliente: 'Transportadora Horizonte S.A.',
    veiculo: 'Volkswagen T-Cross Sense 2023 · PLS-9D41',
    valor: 109900,
    status: 'Emitida',
    data: '2025-11-20T16:20:00.000Z',
    created_at: '2025-11-20T16:20:00.000Z',
    updated_at: '2025-11-20T16:20:00.000Z'
  },
  {
    id: 5,
    numero: 'NF-e 000.001.478',
    tipo: 'Devolução de peças',
    cliente: 'Peças & Cia Auto Center',
    veiculo: '—',
    valor: 3850,
    status: 'Emitida',
    data: '2025-11-18T08:55:00.000Z',
    created_at: '2025-11-18T08:55:00.000Z',
    updated_at: '2025-11-18T08:55:00.000Z'
  },
  {
    id: 6,
    numero: 'NF-e 000.001.477',
    tipo: 'Venda',
    cliente: 'Roberto Almeida Nunes',
    veiculo: 'Chevrolet Onix Plus Premier 2022 · OPL-6E90',
    valor: 89700,
    status: 'Emitida',
    data: '2025-11-15T13:40:00.000Z',
    created_at: '2025-11-15T13:40:00.000Z',
    updated_at: '2025-11-15T13:40:00.000Z'
  },
  {
    id: 7,
    numero: 'NF-e 000.001.476',
    tipo: 'Compra',
    cliente: 'Fernanda Lima Rodrigues',
    veiculo: 'Hyundai HB20 Platinum 2021 · NMK-3G54',
    valor: 78200,
    status: 'Emitida',
    data: '2025-11-12T11:10:00.000Z',
    created_at: '2025-11-12T11:10:00.000Z',
    updated_at: '2025-11-12T11:10:00.000Z'
  },
  {
    id: 8,
    numero: 'NF-e 000.001.475',
    tipo: 'Consignação',
    cliente: 'Paulo Henrique Souza',
    veiculo: 'Fiat Toro Volcano 2019 · JKL-7H66',
    valor: 126500,
    status: 'Pendente',
    data: '2025-11-10T15:30:00.000Z',
    created_at: '2025-11-10T15:30:00.000Z',
    updated_at: '2025-11-19T09:12:00.000Z'
  },
  {
    id: 9,
    numero: 'NF-e 000.001.474',
    tipo: 'Venda',
    cliente: 'Clínica Vida Plena LTDA',
    veiculo: 'Renault Kwid Zen 2023 · MNB-1J08',
    valor: 58900,
    status: 'Cancelada',
    data: '2025-11-08T10:05:00.000Z',
    created_at: '2025-11-08T10:05:00.000Z',
    updated_at: '2025-11-09T17:44:00.000Z'
  },
  {
    id: 10,
    numero: 'NF-e 000.001.473',
    tipo: 'Devolução de acessórios',
    cliente: 'Som & Estilo Acessórios',
    veiculo: '—',
    valor: 1240,
    status: 'Emitida',
    data: '2025-11-05T09:18:00.000Z',
    created_at: '2025-11-05T09:18:00.000Z',
    updated_at: '2025-11-05T09:18:00.000Z'
  },
  {
    id: 11,
    numero: 'NF-e 000.001.472',
    tipo: 'Compra',
    cliente: 'Leilão Sodré Santoro',
    veiculo: 'Ford Ka SE 2020 · LPO-5K32',
    valor: 52300,
    status: 'Emitida',
    data: '2025-11-03T14:50:00.000Z',
    created_at: '2025-11-03T14:50:00.000Z',
    updated_at: '2025-11-03T14:50:00.000Z'
  },
  {
    id: 12,
    numero: 'NF-e 000.001.471',
    tipo: 'Venda',
    cliente: 'Juliana Martins Pereira',
    veiculo: 'Nissan Versa Advance 2022 · KJH-8L15',
    valor: 96400,
    status: 'Emitida',
    data: '2025-10-30T11:33:00.000Z',
    created_at: '2025-10-30T11:33:00.000Z',
    updated_at: '2025-10-30T11:33:00.000Z'
  },
  {
    id: 13,
    numero: 'NF-e 000.001.470',
    tipo: 'Consignação',
    cliente: 'Marcos Vinícius Teixeira',
    veiculo: 'Toyota Hilux SRV 2018 · IGF-4M87',
    valor: 219900,
    status: 'Emitida',
    data: '2025-10-27T16:02:00.000Z',
    created_at: '2025-10-27T16:02:00.000Z',
    updated_at: '2025-10-27T16:02:00.000Z'
  },
  {
    id: 14,
    numero: 'NF-e 000.001.469',
    tipo: 'Venda',
    cliente: 'Padaria Pão Dourado EIRELI',
    veiculo: 'Fiat Fiorino Endurance 2021 · HGF-2N44',
    valor: 87100,
    status: 'Pendente',
    data: '2025-10-24T08:47:00.000Z',
    created_at: '2025-10-24T08:47:00.000Z',
    updated_at: '2025-11-02T13:26:00.000Z'
  }
];
