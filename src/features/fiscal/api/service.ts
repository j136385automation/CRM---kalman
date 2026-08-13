// ============================================================
// Fiscal Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to your backend.
// Current: Mock (in-memory data from ../constants/notas-fiscais)
// ============================================================

import { NOTAS_FISCAIS_MOCK } from '../constants/notas-fiscais';
import type { NotaFiscalFilters, NotasFiscaisResponse } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getNotasFiscais(filters: NotaFiscalFilters): Promise<NotasFiscaisResponse> {
  const { page = 1, limit = 10, tipos, status, search, sort } = filters;

  await delay(300);

  let notas = [...NOTAS_FISCAIS_MOCK];

  const tiposArray = tipos ? String(tipos).split(/[.,]/).filter(Boolean) : [];
  if (tiposArray.length > 0) {
    notas = notas.filter((nota) => tiposArray.includes(nota.tipo));
  }

  const statusArray = status ? String(status).split(/[.,]/).filter(Boolean) : [];
  if (statusArray.length > 0) {
    notas = notas.filter((nota) => statusArray.includes(nota.status));
  }

  if (search) {
    const termo = search.toLowerCase();
    notas = notas.filter(
      (nota) =>
        nota.cliente.toLowerCase().includes(termo) ||
        nota.veiculo.toLowerCase().includes(termo) ||
        nota.numero.toLowerCase().includes(termo)
    );
  }

  if (sort) {
    try {
      const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (sortItems.length > 0) {
        const { id, desc } = sortItems[0];
        notas.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[id];
          const bVal = (b as Record<string, unknown>)[id];
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return desc ? bVal - aVal : aVal - bVal;
          }
          const aStr = String(aVal ?? '').toLowerCase();
          const bStr = String(bVal ?? '').toLowerCase();
          return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
        });
      }
    } catch {
      // Invalid sort param — ignore
    }
  }

  const totalNotas = notas.length;
  const offset = (page - 1) * limit;
  const paginatedNotas = notas.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    total_notas: totalNotas,
    offset,
    limit,
    notas: paginatedNotas
  };
}
