// ============================================================
// Estoque Service — Camada de acesso a dados
// ============================================================
// Único arquivo a alterar ao conectar um backend real.
// Atual: mock em memória (src/features/estoque/constants/veiculos.ts)

import { VEICULOS, type Veiculo } from '../constants/veiculos';
import type { VeiculoFilters, VeiculoMutationPayload, VeiculosResponse } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function matchFaixaPreco(preco: number, faixas: string[]) {
  return faixas.some((faixa) => {
    switch (faixa) {
      case 'ate-70':
        return preco <= 70000;
      case '70-120':
        return preco > 70000 && preco <= 120000;
      case '120-180':
        return preco > 120000 && preco <= 180000;
      case 'acima-180':
        return preco > 180000;
      default:
        return false;
    }
  });
}

export async function getVeiculos(filters: VeiculoFilters): Promise<VeiculosResponse> {
  await delay(300);

  const { page = 1, limit = 10, busca, status, marca, faixaPreco, sort } = filters;

  let data = [...VEICULOS];

  if (busca) {
    const termo = busca.toLowerCase();
    data = data.filter(
      (v) =>
        v.modelo.toLowerCase().includes(termo) ||
        v.marca.toLowerCase().includes(termo) ||
        v.placa.toLowerCase().includes(termo)
    );
  }

  const statusArray = status ? String(status).split(',') : [];
  if (statusArray.length > 0) {
    data = data.filter((v) => statusArray.includes(v.status));
  }

  const marcaArray = marca ? String(marca).split(',') : [];
  if (marcaArray.length > 0) {
    data = data.filter((v) => marcaArray.includes(v.marca));
  }

  const faixaArray = faixaPreco ? String(faixaPreco).split(',') : [];
  if (faixaArray.length > 0) {
    data = data.filter((v) => matchFaixaPreco(v.preco, faixaArray));
  }

  if (sort) {
    try {
      const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (sortItems.length > 0) {
        const { id, desc } = sortItems[0];
        data.sort((a, b) => {
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
      // ignora ordenação inválida
    }
  }

  const offset = (page - 1) * limit;

  return {
    success: true,
    total_veiculos: data.length,
    offset,
    limit,
    veiculos: data.slice(offset, offset + limit)
  };
}

export async function createVeiculo(payload: VeiculoMutationPayload) {
  await delay(300);

  const novo: Veiculo = {
    id: VEICULOS.length + 1,
    marca: payload.marca,
    modelo: payload.modelo,
    ano: payload.ano,
    placa: payload.placa.toUpperCase(),
    chassi: payload.chassi.toUpperCase(),
    cor: payload.cor,
    km: payload.km,
    preco: payload.valorVenda,
    valorCompra: payload.valorCompra,
    diasEmEstoque: 0,
    status: 'Em preparação',
    origem: payload.origem,
    observacoes: payload.observacoes ?? ''
  };

  VEICULOS.push(novo);

  return { success: true, veiculo: novo };
}
