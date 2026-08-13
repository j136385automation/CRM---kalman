export type InsightVeiculo = {
  id: string;
  veiculo: string;
  custoParadoDia: number;
  diasEmEstoque: number;
  diaLimiteLucro: string;
  desvalorizacaoPrevista: number;
  sugestao: string;
};

export const insightsMock: InsightVeiculo[] = [
  {
    id: 'ia-01',
    veiculo: 'Fiat Toro Volcano 2022',
    custoParadoDia: 187.5,
    diasEmEstoque: 74,
    diaLimiteLucro: '2025-11-18',
    desvalorizacaoPrevista: 4.2,
    sugestao: 'Reduzir R$ 4.000'
  },
  {
    id: 'ia-02',
    veiculo: 'Nissan Kicks Advance 2021',
    custoParadoDia: 96.3,
    diasEmEstoque: 68,
    diaLimiteLucro: '2025-11-21',
    desvalorizacaoPrevista: 3.8,
    sugestao: 'Reduzir R$ 2.000'
  },
  {
    id: 'ia-03',
    veiculo: 'Ford Ranger XLT 2020',
    custoParadoDia: 154.9,
    diasEmEstoque: 61,
    diaLimiteLucro: '2025-11-25',
    desvalorizacaoPrevista: 3.1,
    sugestao: 'Reduzir R$ 3.000'
  },
  {
    id: 'ia-04',
    veiculo: 'Volkswagen T-Cross Sense 2021',
    custoParadoDia: 88.4,
    diasEmEstoque: 45,
    diaLimiteLucro: '2025-12-08',
    desvalorizacaoPrevista: 2.4,
    sugestao: 'Manter preço'
  },
  {
    id: 'ia-05',
    veiculo: 'Honda Civic Touring 2022',
    custoParadoDia: 121.7,
    diasEmEstoque: 38,
    diaLimiteLucro: '2025-12-15',
    desvalorizacaoPrevista: 2.1,
    sugestao: 'Manter preço'
  },
  {
    id: 'ia-06',
    veiculo: 'Hyundai HB20 Platinum 2023',
    custoParadoDia: 79.2,
    diasEmEstoque: 29,
    diaLimiteLucro: '2025-12-28',
    desvalorizacaoPrevista: 1.6,
    sugestao: 'Manter preço'
  },
  {
    id: 'ia-07',
    veiculo: 'Toyota Corolla XEi 2023',
    custoParadoDia: 104.6,
    diasEmEstoque: 18,
    diaLimiteLucro: '2026-01-12',
    desvalorizacaoPrevista: 1.2,
    sugestao: 'Aumentar R$ 1.500'
  },
  {
    id: 'ia-08',
    veiculo: 'Chevrolet Onix Plus Premier 2024',
    custoParadoDia: 71.8,
    diasEmEstoque: 9,
    diaLimiteLucro: '2026-01-30',
    desvalorizacaoPrevista: 0.8,
    sugestao: 'Manter preço'
  }
];

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR').format(new Date(ano, mes - 1, dia));
}
