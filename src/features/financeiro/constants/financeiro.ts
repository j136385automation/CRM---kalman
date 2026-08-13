export type TipoMovimentacao = 'entrada' | 'saida';

export type StatusMovimentacao = 'Pago' | 'Pendente';

export type Movimentacao = {
  id: number;
  descricao: string;
  categoria: string;
  tipo: TipoMovimentacao;
  valor: number;
  data: string;
  status: StatusMovimentacao;
};

export const FINANCEIRO_STATS = {
  receitaMes: 184500,
  despesasMes: 96230,
  contasAReceber: 67400,
  contasAPagar: 41900
};

export const MOVIMENTACOES: Movimentacao[] = [
  {
    id: 1,
    descricao: 'Venda — Chevrolet Tracker Premier 2023',
    categoria: 'Venda de veículo',
    tipo: 'entrada',
    valor: 128500,
    data: '2025-11-24',
    status: 'Pago'
  },
  {
    id: 2,
    descricao: 'Venda — Toyota Corolla Cross XRE 2023',
    categoria: 'Venda de veículo',
    tipo: 'entrada',
    valor: 56000,
    data: '2025-11-21',
    status: 'Pendente'
  },
  {
    id: 3,
    descricao: 'Compra — Honda Civic Touring 2022',
    categoria: 'Compra de veículo',
    tipo: 'saida',
    valor: 138500,
    data: '2025-11-18',
    status: 'Pago'
  },
  {
    id: 4,
    descricao: 'Folha de pagamento — novembro',
    categoria: 'Pessoal',
    tipo: 'saida',
    valor: 13500,
    data: '2025-11-28',
    status: 'Pendente'
  },
  {
    id: 5,
    descricao: 'Aluguel do pátio — novembro',
    categoria: 'Aluguel',
    tipo: 'saida',
    valor: 5000,
    data: '2025-11-10',
    status: 'Pago'
  },
  {
    id: 6,
    descricao: 'Recebimento parcela — Jeep Compass (cliente Paulo)',
    categoria: 'Recebimento de parcela',
    tipo: 'entrada',
    valor: 5000,
    data: '2025-11-15',
    status: 'Pago'
  },
  {
    id: 7,
    descricao: 'Anúncios OLX e Webmotors',
    categoria: 'Marketing',
    tipo: 'saida',
    valor: 2700,
    data: '2025-11-05',
    status: 'Pago'
  },
  {
    id: 8,
    descricao: 'Documentação e transferências Detran',
    categoria: 'Documentação',
    tipo: 'saida',
    valor: 1800,
    data: '2025-11-12',
    status: 'Pago'
  },
  {
    id: 9,
    descricao: 'Funilaria e preparação — Onix Plus',
    categoria: 'Manutenção',
    tipo: 'saida',
    valor: 2300,
    data: '2025-11-08',
    status: 'Pendente'
  },
  {
    id: 10,
    descricao: 'Venda — VW Gol 1.0 2019',
    categoria: 'Venda de veículo',
    tipo: 'entrada',
    valor: 48900,
    data: '2025-11-03',
    status: 'Pago'
  }
];

type MesFluxo = {
  mes: string;
  entradas: number;
  saidas: number;
};

const MESES_FLUXO: MesFluxo[] = [
  { mes: 'Dez/24', entradas: 152300, saidas: 88400 },
  { mes: 'Jan/25', entradas: 128700, saidas: 74900 },
  { mes: 'Fev/25', entradas: 139200, saidas: 81300 },
  { mes: 'Mar/25', entradas: 158400, saidas: 86700 },
  { mes: 'Abr/25', entradas: 147800, saidas: 79200 },
  { mes: 'Mai/25', entradas: 163500, saidas: 90100 },
  { mes: 'Jun/25', entradas: 149600, saidas: 83800 },
  { mes: 'Jul/25', entradas: 171200, saidas: 92400 },
  { mes: 'Ago/25', entradas: 166900, saidas: 89600 },
  { mes: 'Set/25', entradas: 174300, saidas: 94200 },
  { mes: 'Out/25', entradas: 168900, saidas: 91800 },
  { mes: 'Nov/25', entradas: 184500, saidas: 96230 }
];

export type FluxoCaixaMes = MesFluxo & {
  saldo: number;
  saldoAcumulado: number;
};

export const FLUXO_CAIXA: FluxoCaixaMes[] = MESES_FLUXO.reduce<FluxoCaixaMes[]>((acc, mes) => {
  const saldo = mes.entradas - mes.saidas;
  const saldoAcumulado = (acc.length > 0 ? acc[acc.length - 1].saldoAcumulado : 0) + saldo;
  acc.push({ ...mes, saldo, saldoAcumulado });
  return acc;
}, []);

// Projeção simples: média dos últimos 3 meses
const ultimos3 = MESES_FLUXO.slice(-3);
const mediaEntradas = Math.round(ultimos3.reduce((s, m) => s + m.entradas, 0) / 3);
const mediaSaidas = Math.round(ultimos3.reduce((s, m) => s + m.saidas, 0) / 3);

export const PROJECAO_FLUXO: FluxoCaixaMes[] = ['Dez/25', 'Jan/26', 'Fev/26'].reduce<
  FluxoCaixaMes[]
>((acc, mes) => {
  const base = acc.length > 0 ? acc[acc.length - 1] : FLUXO_CAIXA[FLUXO_CAIXA.length - 1];
  const saldo = mediaEntradas - mediaSaidas;
  acc.push({
    mes,
    entradas: mediaEntradas,
    saidas: mediaSaidas,
    saldo,
    saldoAcumulado: base.saldoAcumulado + saldo
  });
  return acc;
}, []);

// Últimos 6 meses para o gráfico da visão financeira
export const ENTRADAS_SAIDAS_6M = FLUXO_CAIXA.slice(-6).map((m) => ({
  mes: m.mes,
  entradas: m.entradas,
  saidas: m.saidas
}));

export type DreLinha = {
  label: string;
  atual: number;
  anterior: number;
  acumulado: number;
  destaque?: boolean;
  detalhe?: boolean;
};

// DRE simplificado — regime de competência, valores em R$
export const DRE: DreLinha[] = [
  {
    label: 'Receita bruta de vendas',
    atual: 184500,
    anterior: 168900,
    acumulado: 1842300,
    destaque: true
  },
  { label: '(-) Impostos sobre venda', atual: -11070, anterior: -10134, acumulado: -110538 },
  {
    label: '(=) Receita líquida',
    atual: 173430,
    anterior: 158766,
    acumulado: 1731762,
    destaque: true
  },
  { label: '(-) Custo dos veículos (CMV)', atual: -53418, anterior: -48900, acumulado: -532840 },
  { label: '(=) Lucro bruto', atual: 120012, anterior: 109866, acumulado: 1198922, destaque: true },
  { label: '(-) Pessoal', atual: -13500, anterior: -13000, acumulado: -135000, detalhe: true },
  { label: '(-) Aluguel', atual: -5000, anterior: -5000, acumulado: -55000, detalhe: true },
  { label: '(-) Marketing', atual: -2700, anterior: -2400, acumulado: -27000, detalhe: true },
  { label: '(-) Outras despesas', atual: -1800, anterior: -1700, acumulado: -14500, detalhe: true },
  { label: '(-) Despesas operacionais', atual: -23000, anterior: -22100, acumulado: -231500 },
  {
    label: '(=) Resultado antes de IR/CSLL',
    atual: 97012,
    anterior: 87766,
    acumulado: 967422,
    destaque: true
  },
  { label: '(-) Provisão IR/CSLL', atual: -8742, anterior: -7899, acumulado: -87068 },
  { label: '(=) Lucro líquido', atual: 88270, anterior: 79867, acumulado: 880354, destaque: true }
];
