import { randomUUID } from 'node:crypto';
import { emptyNegociacaoInput } from '../api/defaults';
import type { ModalidadeNegociacao, NegociacaoInput } from '../api/types';
import type { DomainContext } from '../domain/negociacao';

export function context(organizacaoId = 'org_test'): DomainContext {
  return {
    organizacaoId,
    autorId: 'user_test',
    agora: '2026-10-29T15:00:00.000Z',
    novoId: randomUUID
  };
}

/** Fictional names and standard check-digit examples; never customer records. */
export function fixtureInput(
  modalidade: ModalidadeNegociacao = 'consignacao_estimatoria'
): NegociacaoInput {
  const n = emptyNegociacaoInput(modalidade);
  n.loja = {
    nome: 'Loja Exemplo de Testes',
    documento: '11222333000181',
    endereco: 'Rua de Testes, 10',
    cidade: 'Campinas',
    uf: 'SP',
    email: 'loja@example.invalid',
    telefone: '',
    representante: 'Representante de testes; contrato social'
  };
  n.vendedor = {
    nome: 'Pessoa Vendedora Fictícia',
    documento: '52998224725',
    endereco: 'Rua de Testes, 20',
    cidade: 'Campinas',
    uf: 'SP',
    email: '',
    telefone: '',
    representante: ''
  };
  n.comprador = {
    nome: 'Pessoa Compradora Fictícia',
    documento: '11144477735',
    endereco: 'Rua de Testes, 30',
    cidade: 'Campinas',
    uf: 'SP',
    email: '',
    telefone: '',
    representante: ''
  };
  if (modalidade === 'repasse_revenda') {
    n.comprador.documento = '12ABC34501DE35';
    n.comprador.representante = 'Representante de revenda fictícia; poderes no ato constitutivo.';
  }
  n.veiculo = {
    marca: 'Veículo',
    modelo: 'Exemplo',
    anoFabricacao: 2022,
    anoModelo: 2023,
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    cor: 'Prata',
    km: 40000,
    combustivel: 'Flex',
    restricoes: 'Nenhuma restrição declarada; consulta documental anexada.',
    avarias: 'Risco na porta direita registrado na vistoria.',
    acessorios: 'Duas chaves e manual.'
  };
  n.condicoes = {
    precoAnunciadoCentavos: 10_000_000,
    precoMinimoCentavos: 9_000_000,
    precoEstimadoCentavos: 8_000_000,
    comissaoTipo: 'percentual',
    comissaoFixaCentavos: 0,
    comissaoPercentualBps: 500,
    dataInicio: '2026-10-01',
    dataFim: '2026-12-31',
    prazoRepasseDias: 2,
    posse: modalidade === 'intermediacao' ? 'proprietario' : 'loja',
    localGuarda: 'Endereço indicado na vistoria.',
    seguro: 'Não há cobertura contratada; riscos legais preservados.',
    exclusividade: false,
    despesasAutorizadasCentavos: 100_000,
    despesasDescricao: 'Limpeza e pequenos reparos com comprovante e autorização.',
    cidadeAssinatura: 'Campinas/SP',
    foro: 'Campinas/SP, local da obrigação, respeitados direitos do consumidor.'
  };
  n.venda = {
    precoCentavos: 10_000_000,
    formaPagamento: 'Transferência à vista',
    parcelas: [
      { vencimento: '2026-10-29', valorCentavos: 10_000_000, descricao: 'Preço integral' }
    ],
    dataEntrega: '2026-10-29',
    localEntrega: 'Endereço da loja',
    compradorRevendedor: modalidade === 'repasse_revenda',
    finalidadeRevenda:
      modalidade === 'repasse_revenda' ? 'Compra como estoque para revenda profissional.' : ''
  };
  return n;
}
