export type TipoAgendamento = 'test-drive' | 'vistoria' | 'entrega' | 'revisao' | 'reuniao';

export type StatusAgendamento = 'confirmado' | 'pendente' | 'concluido' | 'cancelado';

export type Agendamento = {
  id: string;
  tipo: TipoAgendamento;
  cliente: string;
  veiculo: string;
  data: string;
  horario: string;
  responsavel: string;
  status: StatusAgendamento;
  observacoes?: string;
};

export const TIPO_AGENDAMENTO_LABELS: Record<TipoAgendamento, string> = {
  'test-drive': 'Test-drive',
  vistoria: 'Vistoria cautelar',
  entrega: 'Entrega de veículo',
  revisao: 'Revisão',
  reuniao: 'Reunião com cliente'
};

export const STATUS_AGENDAMENTO_LABELS: Record<StatusAgendamento, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

export const tipoAgendamentoOptions = (
  Object.entries(TIPO_AGENDAMENTO_LABELS) as [TipoAgendamento, string][]
).map(([value, label]) => ({ value, label }));

export const responsavelOptions = [
  { value: 'Carlos Menezes', label: 'Carlos Menezes' },
  { value: 'Fernanda Lopes', label: 'Fernanda Lopes' },
  { value: 'Ricardo Alves', label: 'Ricardo Alves' },
  { value: 'Juliana Prado', label: 'Juliana Prado' }
];

export const agendamentosMock: Agendamento[] = [
  {
    id: 'ag-01',
    tipo: 'test-drive',
    cliente: 'Marcos Vinícius Souza',
    veiculo: 'Toyota Corolla XEi 2023',
    data: '2025-11-10',
    horario: '09:00',
    responsavel: 'Carlos Menezes',
    status: 'confirmado',
    observacoes: 'Cliente chegou pelo anúncio da OLX'
  },
  {
    id: 'ag-02',
    tipo: 'vistoria',
    cliente: 'Patrícia Gomes Ferreira',
    veiculo: 'Honda Civic Touring 2022',
    data: '2025-11-10',
    horario: '10:30',
    responsavel: 'Ricardo Alves',
    status: 'confirmado',
    observacoes: 'Vistoria cautelar agendada com a Visatec'
  },
  {
    id: 'ag-03',
    tipo: 'entrega',
    cliente: 'Roberto Nogueira Lima',
    veiculo: 'Jeep Compass Longitude 2023',
    data: '2025-11-10',
    horario: '14:00',
    responsavel: 'Fernanda Lopes',
    status: 'pendente',
    observacoes: 'Aguardando liberação do financiamento'
  },
  {
    id: 'ag-04',
    tipo: 'revisao',
    cliente: 'Ana Beatriz Cardoso',
    veiculo: 'Volkswagen T-Cross Sense 2021',
    data: '2025-11-11',
    horario: '08:30',
    responsavel: 'Juliana Prado',
    status: 'confirmado',
    observacoes: 'Revisão de 30.000 km'
  },
  {
    id: 'ag-05',
    tipo: 'reuniao',
    cliente: 'Eduardo Martins Ribeiro',
    veiculo: 'Chevrolet Onix Plus Premier 2024',
    data: '2025-11-11',
    horario: '11:00',
    responsavel: 'Carlos Menezes',
    status: 'pendente',
    observacoes: 'Negociação de entrada + parcelas'
  },
  {
    id: 'ag-06',
    tipo: 'test-drive',
    cliente: 'Luciana Pereira Santos',
    veiculo: 'Hyundai HB20 Platinum 2023',
    data: '2025-11-11',
    horario: '15:30',
    responsavel: 'Fernanda Lopes',
    status: 'confirmado'
  },
  {
    id: 'ag-07',
    tipo: 'entrega',
    cliente: 'Fábio Henrique Duarte',
    veiculo: 'Fiat Toro Volcano 2022',
    data: '2025-11-12',
    horario: '09:30',
    responsavel: 'Ricardo Alves',
    status: 'concluido',
    observacoes: 'Entrega realizada com tanque cheio'
  },
  {
    id: 'ag-08',
    tipo: 'vistoria',
    cliente: 'Camila Rodrigues Almeida',
    veiculo: 'Nissan Kicks Advance 2021',
    data: '2025-11-12',
    horario: '13:00',
    responsavel: 'Juliana Prado',
    status: 'confirmado'
  },
  {
    id: 'ag-09',
    tipo: 'test-drive',
    cliente: 'Thiago Barros Cavalcanti',
    veiculo: 'Toyota Hilux SRV 2023',
    data: '2025-11-13',
    horario: '10:00',
    responsavel: 'Carlos Menezes',
    status: 'pendente',
    observacoes: 'Cliente pediu para confirmar na véspera'
  },
  {
    id: 'ag-10',
    tipo: 'reuniao',
    cliente: 'Renata Souza Pinto',
    veiculo: 'Renault Kwid Zen 2022',
    data: '2025-11-13',
    horario: '16:00',
    responsavel: 'Fernanda Lopes',
    status: 'cancelado',
    observacoes: 'Cliente desistiu da compra'
  },
  {
    id: 'ag-11',
    tipo: 'revisao',
    cliente: 'José Carlos Fonseca',
    veiculo: 'Ford Ranger XLT 2020',
    data: '2025-11-14',
    horario: '08:00',
    responsavel: 'Ricardo Alves',
    status: 'confirmado',
    observacoes: 'Troca de óleo e filtros'
  },
  {
    id: 'ag-12',
    tipo: 'test-drive',
    cliente: 'Beatriz Mendes Oliveira',
    veiculo: 'Honda HR-V EXL 2023',
    data: '2025-11-14',
    horario: '14:30',
    responsavel: 'Juliana Prado',
    status: 'pendente'
  }
];
