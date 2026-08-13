import type { OrigemVeiculo, StatusVeiculo, Veiculo } from '../constants/veiculos';

export type { OrigemVeiculo, StatusVeiculo, Veiculo };

export type VeiculoFilters = {
  page?: number;
  limit?: number;
  busca?: string;
  status?: string;
  marca?: string;
  faixaPreco?: string;
  sort?: string;
};

export type VeiculosResponse = {
  success: boolean;
  total_veiculos: number;
  offset: number;
  limit: number;
  veiculos: Veiculo[];
};

export type VeiculoMutationPayload = {
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  chassi: string;
  cor: string;
  km: number;
  valorCompra: number;
  valorVenda: number;
  origem: OrigemVeiculo;
  observacoes?: string;
};
