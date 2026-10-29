/** Monetary values are integer BRL cents; percentages use basis points (100 = 1%). */
export type ModalidadeNegociacao =
  | 'compra_venda'
  | 'consignacao_estimatoria'
  | 'comissao'
  | 'intermediacao'
  | 'repasse_revenda';

export type StatusNegociacao =
  | 'rascunho'
  | 'ativa'
  | 'vendida'
  | 'liquidada'
  | 'devolvida'
  | 'cancelada';

export interface ParteNegociacao {
  nome: string;
  documento: string;
  endereco: string;
  cidade: string;
  uf: string;
  email: string;
  telefone: string;
  representante: string;
}

export interface VeiculoNegociacao {
  estoqueId?: number;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  placa: string;
  chassi: string;
  renavam: string;
  cor: string;
  km: number;
  combustivel: string;
  restricoes: string;
  avarias: string;
  acessorios: string;
}

export interface CondicoesNegociacao {
  precoAnunciadoCentavos: number;
  precoMinimoCentavos: number;
  precoEstimadoCentavos: number;
  comissaoTipo: 'fixa' | 'percentual';
  comissaoFixaCentavos: number;
  comissaoPercentualBps: number;
  dataInicio: string;
  dataFim: string;
  prazoRepasseDias: number;
  posse: 'loja' | 'proprietario';
  localGuarda: string;
  seguro: string;
  exclusividade: boolean;
  despesasAutorizadasCentavos: number;
  despesasDescricao: string;
  cidadeAssinatura: string;
  foro: string;
}

export interface ParcelaNegociacao {
  vencimento: string;
  valorCentavos: number;
  descricao: string;
}

/** Agreed future terms, independent of actual sale/payment events. */
export interface VendaPrevista {
  precoCentavos: number;
  formaPagamento: string;
  parcelas: ParcelaNegociacao[];
  dataEntrega: string;
  localEntrega: string;
  compradorRevendedor: boolean;
  finalidadeRevenda: string;
}

export interface NegociacaoInput {
  modalidade: ModalidadeNegociacao;
  loja: ParteNegociacao;
  vendedor: ParteNegociacao;
  comprador: ParteNegociacao;
  veiculo: VeiculoNegociacao;
  condicoes: CondicoesNegociacao;
  venda: VendaPrevista;
  observacoes: string;
}

export interface MovimentoFinanceiro {
  id: string;
  data: string;
  valorCentavos: number;
  comprovante: string;
  registradoPor: string;
  registradoEm: string;
}

export interface DespesaNegociacao extends MovimentoFinanceiro {
  descricao: string;
}

export interface VendaEfetivada {
  data: string;
  precoCentavos: number;
  evidenciaContrato: string;
  registradaPor: string;
  registradaEm: string;
}

export interface DevolucaoNegociacao {
  data: string;
  km: number;
  vistoria: string;
  pendencias: string;
  evidencia: string;
}

export interface EventoNegociacao {
  id: string;
  tipo: string;
  descricao: string;
  autorId: string;
  data: string;
  versao: number;
  dados?: {
    referenciaAditivo: string;
    condicoesAnteriores: CondicoesNegociacao;
    condicoesNovas: CondicoesNegociacao;
  };
}

export type CamposDocumento = Record<string, string>;

export interface DocumentoNegociacao {
  id: string;
  negociacaoId: string;
  modeloId: string;
  versaoModelo: string;
  titulo: string;
  conteudo: string;
  sha256: string;
  status: 'minuta' | 'emitido';
  emitidoEm: string;
  emitidoPor: string;
  campos: CamposDocumento;
  pendencias: string[];
  snapshot: NegociacaoSnapshot;
}

export interface Negociacao extends NegociacaoInput {
  id: string;
  organizacaoId: string;
  versao: number;
  status: StatusNegociacao;
  criadoEm: string;
  atualizadoEm: string;
  contratoReferencia: string;
  vendaEfetivada: VendaEfetivada | null;
  recebimentos: MovimentoFinanceiro[];
  repasses: MovimentoFinanceiro[];
  despesas: DespesaNegociacao[];
  devolucao: DevolucaoNegociacao | null;
  eventos: EventoNegociacao[];
  documentos: DocumentoNegociacao[];
}

export type NegociacaoSnapshot = Omit<Negociacao, 'eventos' | 'documentos'>;

export type NegociacaoCommand =
  | { tipo: 'ativar'; contratoReferencia: string }
  | { tipo: 'aditar'; referenciaAditivo: string; condicoes: CondicoesNegociacao }
  | { tipo: 'vender'; data: string; evidenciaContrato: string }
  | {
      tipo: 'registrar_recebimento' | 'registrar_repasse';
      operacaoId: string;
      data: string;
      valorCentavos: number;
      comprovante: string;
    }
  | {
      tipo: 'registrar_despesa';
      operacaoId: string;
      data: string;
      valorCentavos: number;
      comprovante: string;
      descricao: string;
    }
  | ({ tipo: 'devolver' } & DevolucaoNegociacao)
  | { tipo: 'encerrar'; observacoes: string }
  | { tipo: 'cancelar'; motivo: string };

export interface ResumoFinanceiro {
  valorVendaCentavos: number;
  recebidoCentavos: number;
  aReceberCentavos: number;
  remuneracaoCentavos: number;
  despesasCentavos: number;
  devidoProprietarioCentavos: number;
  repassadoCentavos: number;
  saldoRepasseCentavos: number;
}

export interface ListNegociacoesResult {
  negociacoes: Negociacao[];
  storageMode: 'postgres' | 'demo';
  canManage: boolean;
  organizacaoId: string;
}

export interface NegociacoesContext {
  organizacaoId: string;
  canManage: boolean;
  storageMode: 'postgres' | 'demo' | 'unconfigured';
  configurationMessage: string | null;
}

export interface IssueDocumentoInput {
  modeloId: string;
  campos: CamposDocumento;
  finalidade: 'minuta' | 'emissao';
}
