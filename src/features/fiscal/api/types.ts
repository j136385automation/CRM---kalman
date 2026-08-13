import type { NotaFiscal, StatusNota, TipoNota } from '../constants/notas-fiscais';

export type { NotaFiscal, StatusNota, TipoNota };

export type NotaFiscalFilters = {
  page?: number;
  limit?: number;
  tipos?: string;
  status?: string;
  search?: string;
  sort?: string;
};

export type NotasFiscaisResponse = {
  success: boolean;
  time: string;
  total_notas: number;
  offset: number;
  limit: number;
  notas: NotaFiscal[];
};
