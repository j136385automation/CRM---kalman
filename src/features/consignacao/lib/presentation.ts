import type { ModalidadeNegociacao, StatusNegociacao } from '../api/types';

export const MODALIDADE_LABELS: Record<ModalidadeNegociacao, string> = {
  compra_venda: 'Compra e venda',
  consignacao_estimatoria: 'Consignação estimatória',
  comissao: 'Comissão de venda',
  intermediacao: 'Intermediação de venda',
  repasse_revenda: 'Repasse entre revendedores'
};

export const STATUS_LABELS: Record<StatusNegociacao, string> = {
  rascunho: 'Rascunho',
  ativa: 'Ativa',
  vendida: 'Vendida',
  liquidada: 'Liquidada',
  devolvida: 'Devolvida',
  cancelada: 'Cancelada'
};

export const MODALIDADES_CONSIGNACAO: ModalidadeNegociacao[] = [
  'consignacao_estimatoria',
  'comissao',
  'intermediacao'
];

export function formatCentavos(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
}

export function formatData(value: string): string {
  if (!value) return 'Não informada';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').toReversed().join('/');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  }).format(date);
}

export function hojeBrasil(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
