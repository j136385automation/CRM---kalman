export type RelatorioContabil = {
  id: number;
  nome: string;
  descricao: string;
  competencia: string;
};

export type ImpostoMes = {
  imposto: string;
  regime: string;
  baseCalculo: number;
  aliquota: string;
  valor: number;
  vencimento: string;
};

export const RESUMO_CONTABIL = {
  impostosARecolher: 12840,
  notasPendentes: 3,
  documentosArquivados: 248
};

export const RELATORIOS_CONTABEIS: RelatorioContabil[] = [
  {
    id: 1,
    nome: 'Livro de entradas',
    descricao: 'Registro das notas fiscais de compra do mês',
    competencia: 'Novembro/2025'
  },
  {
    id: 2,
    nome: 'Livro de saídas',
    descricao: 'Registro das notas fiscais de venda do mês',
    competencia: 'Novembro/2025'
  },
  {
    id: 3,
    nome: 'Apuração Simples Nacional',
    descricao: 'Cálculo do DAS e anexos para o contador',
    competencia: 'Novembro/2025'
  },
  {
    id: 4,
    nome: 'Apuração Regime Normal',
    descricao: 'ICMS, PIS e COFINS por nota emitida',
    competencia: 'Novembro/2025'
  },
  {
    id: 5,
    nome: 'Relatório de consignações',
    descricao: 'Veículos em consignação, prazos e comissões',
    competencia: 'Novembro/2025'
  }
];

export const IMPOSTOS_DO_MES: ImpostoMes[] = [
  {
    imposto: 'ICMS',
    regime: 'Regime Normal',
    baseCalculo: 228300,
    aliquota: '18%',
    valor: 6849,
    vencimento: '2025-12-09'
  },
  {
    imposto: 'PIS',
    regime: 'Regime Normal',
    baseCalculo: 228300,
    aliquota: '0,65%',
    valor: 247.32,
    vencimento: '2025-12-15'
  },
  {
    imposto: 'COFINS',
    regime: 'Regime Normal',
    baseCalculo: 228300,
    aliquota: '3%',
    valor: 1141.5,
    vencimento: '2025-12-15'
  },
  {
    imposto: 'DAS (Simples Nacional)',
    regime: 'Simples Nacional',
    baseCalculo: 87100,
    aliquota: '6%',
    valor: 4602.18,
    vencimento: '2025-12-20'
  }
];
