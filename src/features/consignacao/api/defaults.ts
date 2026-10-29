import type { ModalidadeNegociacao, NegociacaoInput, ParteNegociacao } from './types';

export function emptyParte(): ParteNegociacao {
  return {
    nome: '',
    documento: '',
    endereco: '',
    cidade: '',
    uf: '',
    email: '',
    telefone: '',
    representante: ''
  };
}

export function emptyNegociacaoInput(
  modalidade: ModalidadeNegociacao = 'consignacao_estimatoria'
): NegociacaoInput {
  return {
    modalidade,
    loja: emptyParte(),
    vendedor: emptyParte(),
    comprador: emptyParte(),
    veiculo: {
      marca: '',
      modelo: '',
      anoFabricacao: new Date().getFullYear(),
      anoModelo: new Date().getFullYear(),
      placa: '',
      chassi: '',
      renavam: '',
      cor: '',
      km: 0,
      combustivel: '',
      restricoes: '',
      avarias: '',
      acessorios: ''
    },
    condicoes: {
      precoAnunciadoCentavos: 0,
      precoMinimoCentavos: 0,
      precoEstimadoCentavos: 0,
      comissaoTipo: 'fixa',
      comissaoFixaCentavos: 0,
      comissaoPercentualBps: 0,
      dataInicio: '',
      dataFim: '',
      prazoRepasseDias: 2,
      posse: 'loja',
      localGuarda: '',
      seguro: '',
      exclusividade: false,
      despesasAutorizadasCentavos: 0,
      despesasDescricao: '',
      cidadeAssinatura: '',
      foro: ''
    },
    venda: {
      precoCentavos: 0,
      formaPagamento: '',
      parcelas: [],
      dataEntrega: '',
      localEntrega: '',
      compradorRevendedor: false,
      finalidadeRevenda: ''
    },
    observacoes: ''
  };
}
