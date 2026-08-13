export type TipoDocumento =
  | 'Contrato de compra e venda'
  | 'Termo de consignação'
  | 'Procuração'
  | 'Laudo cautelar'
  | 'CRLV-e';

export type StatusDocumento = 'Assinado' | 'Pendente de assinatura' | 'Arquivado';

export type Documento = {
  id: number;
  tipo: TipoDocumento;
  cliente: string;
  veiculo: string;
  data: string;
  status: StatusDocumento;
};

export const TIPO_DOCUMENTO_OPTIONS: { value: TipoDocumento; label: TipoDocumento }[] = [
  { value: 'Contrato de compra e venda', label: 'Contrato de compra e venda' },
  { value: 'Termo de consignação', label: 'Termo de consignação' },
  { value: 'Procuração', label: 'Procuração' },
  { value: 'Laudo cautelar', label: 'Laudo cautelar' },
  { value: 'CRLV-e', label: 'CRLV-e' }
];

export const DOCUMENTOS_MOCK: Documento[] = [
  {
    id: 1,
    tipo: 'Contrato de compra e venda',
    cliente: 'Carlos Eduardo Santos',
    veiculo: 'Toyota Corolla XEi 2022 · PRK-4F28',
    data: '2025-11-28T10:30:00.000Z',
    status: 'Assinado'
  },
  {
    id: 2,
    tipo: 'Termo de consignação',
    cliente: 'Mariana Ferreira Costa',
    veiculo: 'Jeep Compass Longitude 2020 · RTY-2C77',
    data: '2025-11-22T09:45:00.000Z',
    status: 'Pendente de assinatura'
  },
  {
    id: 3,
    tipo: 'Procuração',
    cliente: 'Roberto Almeida Nunes',
    veiculo: 'Chevrolet Onix Plus Premier 2022 · OPL-6E90',
    data: '2025-11-15T13:40:00.000Z',
    status: 'Assinado'
  },
  {
    id: 4,
    tipo: 'Laudo cautelar',
    cliente: 'Transportadora Horizonte S.A.',
    veiculo: 'Volkswagen T-Cross Sense 2023 · PLS-9D41',
    data: '2025-11-19T11:00:00.000Z',
    status: 'Arquivado'
  },
  {
    id: 5,
    tipo: 'CRLV-e',
    cliente: 'Juliana Martins Pereira',
    veiculo: 'Nissan Versa Advance 2022 · KJH-8L15',
    data: '2025-10-30T11:33:00.000Z',
    status: 'Arquivado'
  },
  {
    id: 6,
    tipo: 'Contrato de compra e venda',
    cliente: 'Clínica Vida Plena LTDA',
    veiculo: 'Renault Kwid Zen 2023 · MNB-1J08',
    data: '2025-11-08T10:05:00.000Z',
    status: 'Pendente de assinatura'
  },
  {
    id: 7,
    tipo: 'Termo de consignação',
    cliente: 'Paulo Henrique Souza',
    veiculo: 'Fiat Toro Volcano 2019 · JKL-7H66',
    data: '2025-11-10T15:30:00.000Z',
    status: 'Pendente de assinatura'
  },
  {
    id: 8,
    tipo: 'Contrato de compra e venda',
    cliente: 'Padaria Pão Dourado EIRELI',
    veiculo: 'Fiat Fiorino Endurance 2021 · HGF-2N44',
    data: '2025-10-24T08:47:00.000Z',
    status: 'Assinado'
  },
  {
    id: 9,
    tipo: 'Laudo cautelar',
    cliente: 'Marcos Vinícius Teixeira',
    veiculo: 'Toyota Hilux SRV 2018 · IGF-4M87',
    data: '2025-10-27T16:02:00.000Z',
    status: 'Arquivado'
  },
  {
    id: 10,
    tipo: 'Procuração',
    cliente: 'Fernanda Lima Rodrigues',
    veiculo: 'Hyundai HB20 Platinum 2021 · NMK-3G54',
    data: '2025-11-12T11:10:00.000Z',
    status: 'Assinado'
  }
];
