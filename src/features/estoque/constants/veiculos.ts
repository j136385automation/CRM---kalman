export type StatusVeiculo = 'Disponível' | 'Reservado' | 'Vendido' | 'Em preparação';

export type OrigemVeiculo = 'Compra' | 'Consignação' | 'Troca';

export type Veiculo = {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  chassi: string;
  cor: string;
  km: number;
  preco: number;
  valorCompra: number;
  diasEmEstoque: number;
  status: StatusVeiculo;
  origem: OrigemVeiculo;
  observacoes: string;
};

export const VEICULOS: Veiculo[] = [
  {
    id: 1,
    marca: 'Honda',
    modelo: 'Civic Touring 1.5 Turbo',
    ano: 2022,
    placa: 'BRA2E19',
    chassi: '9BWHE21JX04012345',
    cor: 'Prata',
    km: 38400,
    preco: 152900,
    valorCompra: 138500,
    diasEmEstoque: 18,
    status: 'Disponível',
    origem: 'Compra',
    observacoes: 'Único dono, revisões na concessionária.'
  },
  {
    id: 2,
    marca: 'Toyota',
    modelo: 'Corolla XEi 2.0',
    ano: 2023,
    placa: 'FZX4C87',
    chassi: '9BRBLWHE6P0102345',
    cor: 'Branco',
    km: 21200,
    preco: 149500,
    valorCompra: 136000,
    diasEmEstoque: 25,
    status: 'Disponível',
    origem: 'Consignação',
    observacoes: 'Consignado do cliente Martins.'
  },
  {
    id: 3,
    marca: 'Volkswagen',
    modelo: 'Gol 1.0 MPI',
    ano: 2021,
    placa: 'GHJ7K12',
    chassi: '9BWAB05U4LT043210',
    cor: 'Vermelho',
    km: 56300,
    preco: 56900,
    valorCompra: 49200,
    diasEmEstoque: 72,
    status: 'Disponível',
    origem: 'Troca',
    observacoes: 'Recebido na troca de um Onix. Avaliar repasse.'
  },
  {
    id: 4,
    marca: 'Jeep',
    modelo: 'Compass Longitude 1.3 T270',
    ano: 2022,
    placa: 'KLM3N45',
    chassi: '988AD2311NT056789',
    cor: 'Cinza',
    km: 44800,
    preco: 139900,
    valorCompra: 126800,
    diasEmEstoque: 34,
    status: 'Reservado',
    origem: 'Compra',
    observacoes: 'Reservado pelo cliente Paulo até sexta-feira.'
  },
  {
    id: 5,
    marca: 'Hyundai',
    modelo: 'HB20 Comfort 1.0',
    ano: 2022,
    placa: 'PQR5S67',
    chassi: '9BHBG51DANP067890',
    cor: 'Branco',
    km: 39100,
    preco: 68500,
    valorCompra: 59800,
    diasEmEstoque: 41,
    status: 'Disponível',
    origem: 'Compra',
    observacoes: 'Pneus novos.'
  },
  {
    id: 6,
    marca: 'Fiat',
    modelo: 'Strada Endurance 1.4 CD',
    ano: 2023,
    placa: 'TUV8W90',
    chassi: '9BD278A41PR078901',
    cor: 'Prata',
    km: 18700,
    preco: 104900,
    valorCompra: 95300,
    diasEmEstoque: 12,
    status: 'Disponível',
    origem: 'Compra',
    observacoes: 'Cabeine dupla, baixa km.'
  },
  {
    id: 7,
    marca: 'Chevrolet',
    modelo: 'Onix Plus LTZ 1.0 Turbo',
    ano: 2022,
    placa: 'XYZ1A23',
    chassi: '9BGKS48U0NG089012',
    cor: 'Preto',
    km: 47900,
    preco: 78900,
    valorCompra: 69400,
    diasEmEstoque: 66,
    status: 'Em preparação',
    origem: 'Compra',
    observacoes: 'Em funilaria — retoque no para-choque traseiro.'
  },
  {
    id: 8,
    marca: 'Toyota',
    modelo: 'Hilux SRV 2.8 Diesel 4x4',
    ano: 2021,
    placa: 'BCD4E56',
    chassi: '8AJBA3FS7M0091234',
    cor: 'Branco',
    km: 61200,
    preco: 249900,
    valorCompra: 226000,
    diasEmEstoque: 29,
    status: 'Disponível',
    origem: 'Troca',
    observacoes: 'Recebida na troca de uma SW4.'
  },
  {
    id: 9,
    marca: 'Volkswagen',
    modelo: 'T-Cross Highline 250 TSI',
    ano: 2023,
    placa: 'EFG7H89',
    chassi: '9BWAA06S2PP101234',
    cor: 'Azul',
    km: 15400,
    preco: 132900,
    valorCompra: 120500,
    diasEmEstoque: 15,
    status: 'Reservado',
    origem: 'Compra',
    observacoes: 'Reserva com sinal de R$ 5.000.'
  },
  {
    id: 10,
    marca: 'Honda',
    modelo: 'HR-V EXL 1.8',
    ano: 2021,
    placa: 'HIJ0K12',
    chassi: '9BWRV3F58M5112345',
    cor: 'Cinza',
    km: 52800,
    preco: 119900,
    valorCompra: 107900,
    diasEmEstoque: 58,
    status: 'Disponível',
    origem: 'Consignação',
    observacoes: 'Consignado — proprietário pede agilidade.'
  },
  {
    id: 11,
    marca: 'Fiat',
    modelo: 'Argo Drive 1.0',
    ano: 2022,
    placa: 'LMN3P45',
    chassi: '9BD195B30N6123456',
    cor: 'Vermelho',
    km: 43600,
    preco: 62900,
    valorCompra: 54100,
    diasEmEstoque: 83,
    status: 'Disponível',
    origem: 'Compra',
    observacoes: 'Parado há 83 dias — avaliar promoção.'
  },
  {
    id: 12,
    marca: 'Chevrolet',
    modelo: 'Tracker Premier 1.2 Turbo',
    ano: 2023,
    placa: 'QRS6T78',
    chassi: '9BGRD08U1PG123457',
    cor: 'Preto',
    km: 9800,
    preco: 128500,
    valorCompra: 116700,
    diasEmEstoque: 9,
    status: 'Vendido',
    origem: 'Compra',
    observacoes: 'Vendido — aguardando transferência.'
  },
  {
    id: 13,
    marca: 'Nissan',
    modelo: 'Kicks Advance 1.6 CVT',
    ano: 2022,
    placa: 'UVW9X01',
    chassi: '9BHBL74R0NP234568',
    cor: 'Laranja',
    km: 41500,
    preco: 98900,
    valorCompra: 88600,
    diasEmEstoque: 47,
    status: 'Disponível',
    origem: 'Compra',
    observacoes: ''
  },
  {
    id: 14,
    marca: 'Renault',
    modelo: 'Kwid Zen 1.0',
    ano: 2023,
    placa: 'YZA2B34',
    chassi: '9BFB10S14PP345679',
    cor: 'Branco',
    km: 12300,
    preco: 58900,
    valorCompra: 51800,
    diasEmEstoque: 22,
    status: 'Em preparação',
    origem: 'Troca',
    observacoes: 'Higienização e polimento em andamento.'
  },
  {
    id: 15,
    marca: 'Toyota',
    modelo: 'Corolla Cross XRE 2.0',
    ano: 2023,
    placa: 'CDE5F67',
    chassi: '9BRKX3E38P0456780',
    cor: 'Prata',
    km: 8900,
    preco: 189900,
    valorCompra: 172400,
    diasEmEstoque: 6,
    status: 'Vendido',
    origem: 'Compra',
    observacoes: 'Vendido com financiamento aprovado.'
  }
];

export const STATUS_OPTIONS = [
  { value: 'Disponível', label: 'Disponível' },
  { value: 'Reservado', label: 'Reservado' },
  { value: 'Vendido', label: 'Vendido' },
  { value: 'Em preparação', label: 'Em preparação' }
];

export const MARCA_OPTIONS = [
  { value: 'Chevrolet', label: 'Chevrolet' },
  { value: 'Fiat', label: 'Fiat' },
  { value: 'Honda', label: 'Honda' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Jeep', label: 'Jeep' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Renault', label: 'Renault' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Volkswagen', label: 'Volkswagen' }
];

export const FAIXA_PRECO_OPTIONS = [
  { value: 'ate-70', label: 'Até R$ 70 mil' },
  { value: '70-120', label: 'R$ 70 mil a R$ 120 mil' },
  { value: '120-180', label: 'R$ 120 mil a R$ 180 mil' },
  { value: 'acima-180', label: 'Acima de R$ 180 mil' }
];

export const ORIGEM_OPTIONS = [
  { value: 'Compra', label: 'Compra' },
  { value: 'Consignação', label: 'Consignação' },
  { value: 'Troca', label: 'Troca' }
];

// Indicadores do estoque completo (32 veículos — amostra listada na tabela)
export const ESTOQUE_STATS = {
  totalVeiculos: 32,
  valorInvestido: 1940000,
  ticketMedio: 1940000 / 32,
  giroMedioDias: 42,
  paradosMais60Dias: 5
};
