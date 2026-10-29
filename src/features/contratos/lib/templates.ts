import type {
  CamposDocumento,
  ModalidadeNegociacao,
  MovimentoFinanceiro,
  Negociacao,
  ParteNegociacao
} from '@/features/consignacao/api/types';
import { calcularResumoFinanceiro } from '@/features/consignacao/domain/negociacao';
import {
  isCnpj,
  isValidDocumento,
  normalizarDocumento
} from '@/features/consignacao/domain/documento';

export type { CamposDocumento } from '@/features/consignacao/api/types';

export const VERSAO_MODELOS = '2026.10.29-1';

export type ModeloDocumentoId =
  | 'compra_venda'
  | 'consignacao_estimatoria'
  | 'comissao'
  | 'intermediacao'
  | 'repasse_revenda'
  | 'vistoria_entrada'
  | 'autorizacao_despesa_desconto'
  | 'aditivo'
  | 'prestacao_contas'
  | 'recibo_repasse'
  | 'devolucao'
  | 'distrato';

export interface CampoModeloDocumento {
  chave: string;
  rotulo: string;
  obrigatorio: boolean;
  tipo: 'text' | 'textarea' | 'date';
  ajuda?: string;
}

export interface ModeloDocumento {
  id: ModeloDocumentoId;
  titulo: string;
  descricao: string;
  modalidades: ModalidadeNegociacao[];
  campos: CampoModeloDocumento[];
}

export interface DocumentoRenderizado {
  titulo: string;
  conteudo: string;
  versaoModelo: string;
  pendencias: string[];
}

const TODAS: ModalidadeNegociacao[] = [
  'compra_venda',
  'consignacao_estimatoria',
  'comissao',
  'intermediacao',
  'repasse_revenda'
];
const CONSIGNACOES: ModalidadeNegociacao[] = [
  'consignacao_estimatoria',
  'comissao',
  'intermediacao'
];

function campo(
  chave: string,
  rotulo: string,
  ajuda?: string,
  tipo: CampoModeloDocumento['tipo'] = 'textarea',
  obrigatorio = true
): CampoModeloDocumento {
  return { chave, rotulo, obrigatorio, tipo, ajuda };
}

const COMUNS = [
  campo('dataDocumento', 'Data do instrumento', undefined, 'date'),
  campo(
    'poderesRepresentacao',
    'Poderes dos representantes das empresas',
    'Identifique o contrato social, ato ou procuração que habilita cada representante. Obrigatório quando houver pessoa jurídica.',
    'textarea',
    false
  ),
  campo(
    'contatoPrivacidade',
    'Contato para privacidade e direitos do titular',
    'Informe o responsável e o canal de atendimento da loja.',
    'text'
  ),
  campo(
    'vinculoForo',
    'Vínculo do foro com o local da obrigação',
    'Preencha se o foro não for o domicílio de uma das partes; identifique o local de cumprimento da obrigação.',
    'text',
    false
  )
];
const TITULARIDADE = campo(
  'titularidadeDocumentos',
  'Titularidade e documentos conferidos',
  'Identifique o proprietário registral, CRLV/CRV, consultas com data e referências dos documentos. Descreva divergências e autorizações; não declare conferência não realizada.'
);
const DEBITOS = campo(
  'debitosResponsaveis',
  'Débitos, gravames e responsáveis pela regularização',
  'Discrimine IPVA, licenciamento, multas, financiamento, gravames e restrições; quem paga cada item, valores conhecidos, vencimentos e comprovantes. Declare expressamente quando não identificados.'
);
const TRANSFERENCIA = campo(
  'transferenciaResponsaveis',
  'Providências de transferência e comunicação da venda',
  'Defina quem fornece documentos, assina ATPV, paga taxas, realiza vistoria e comunica a venda, os prazos e o canal oficial. O contrato não substitui esses atos.'
);
const TEST_DRIVE = campo(
  'testDrive',
  'Regras de test-drive e deslocamentos',
  'Informe se são autorizados, limites de trajeto/horário/quilometragem, acompanhamento, CNH e registro do condutor; ou declare que dependem de autorização específica.'
);
const CONTA_REPASSE = campo(
  'contaRepasse',
  'Destino autorizado dos valores ao proprietário',
  'Informe beneficiário, CPF/CNPJ e conta/chave. Pagamento a terceiro depende de autorização específica verificável.',
  'text'
);
const VISTORIA = campo(
  'vistoriaReferencia',
  'Vistoria, fotos e anexos de estado do veículo',
  'Identifique os registros reais de inspeção, data, fotos e documentos que integrarão a via entregue às partes. A inspeção comercial não é laudo pericial.'
);
const GARANTIA = campo(
  'garantiaContratual',
  'Garantia contratual adicional',
  'Descreva cobertura, prazo, responsável e canal; ou informe expressamente que não há garantia adicional à garantia legal. Não exclua a garantia legal.'
);

export const MODELOS_DOCUMENTO: ModeloDocumento[] = [
  {
    id: 'compra_venda',
    titulo: 'Contrato de compra e venda de veículo usado',
    descricao:
      'Preço, pagamento, entrega, documentos, transferência e garantias para a venda ao comprador.',
    modalidades: TODAS,
    campos: [
      ...COMUNS,
      TITULARIDADE,
      DEBITOS,
      TRANSFERENCIA,
      VISTORIA,
      GARANTIA,
      campo(
        'papelLoja',
        'Participação da loja',
        'Declare se a loja é a própria vendedora ou identifique a atuação e obrigações assumidas como interveniente.'
      )
    ]
  },
  {
    id: 'consignacao_estimatoria',
    titulo: 'Contrato estimatório de consignação de veículo',
    descricao:
      'Entrega à loja com obrigação de pagar o preço estimado ou restituir o veículo no prazo.',
    modalidades: ['consignacao_estimatoria'],
    campos: [
      ...COMUNS,
      TITULARIDADE,
      DEBITOS,
      TRANSFERENCIA,
      VISTORIA,
      TEST_DRIVE,
      CONTA_REPASSE,
      campo('dataEntregaGuarda', 'Data da entrega à guarda da loja', undefined, 'date')
    ]
  },
  {
    id: 'comissao',
    titulo: 'Contrato de comissão para venda de veículo',
    descricao:
      'A loja negocia em nome próprio por conta do proprietário, com remuneração e prestação de contas.',
    modalidades: ['comissao'],
    campos: [...COMUNS, TITULARIDADE, DEBITOS, TRANSFERENCIA, VISTORIA, TEST_DRIVE, CONTA_REPASSE]
  },
  {
    id: 'intermediacao',
    titulo: 'Contrato de intermediação de venda de veículo',
    descricao:
      'Aproximação entre proprietário e comprador, sem mandato implícito para vender, receber ou transferir.',
    modalidades: ['intermediacao'],
    campos: [
      ...COMUNS,
      TITULARIDADE,
      DEBITOS,
      VISTORIA,
      TEST_DRIVE,
      campo(
        'resultadoRemuneracao',
        'Resultado que gera a remuneração',
        'Defina o negócio e as condições objetivas que caracterizam o resultado útil, respeitada a disciplina legal da corretagem.'
      ),
      campo(
        'pagamentoRemuneracao',
        'Forma e prazo de pagamento da intermediação',
        'Defina quem paga, quando vence e o destino do pagamento da comissão; não use este campo para autorizar recebimento do preço do veículo.'
      )
    ]
  },
  {
    id: 'repasse_revenda',
    titulo: 'Contrato de compra e venda de veículo para revenda — repasse',
    descricao:
      'Venda a pessoa jurídica que adquire para revender, com estado do veículo e responsabilidades expressas.',
    modalidades: TODAS,
    campos: [
      ...COMUNS,
      TITULARIDADE,
      DEBITOS,
      TRANSFERENCIA,
      VISTORIA,
      GARANTIA,
      campo(
        'papelLoja',
        'Participação da loja',
        'Identifique a atuação da loja na venda e suas obrigações.'
      ),
      campo(
        'atividadeRevendedor',
        'Comprovação da atividade de revenda',
        'Identifique a atividade e o documento cadastral do comprador, sem presumir que o CNPJ afaste o CDC.'
      )
    ]
  },
  {
    id: 'vistoria_entrada',
    titulo: 'Termo de entrega, recebimento e vistoria comercial',
    descricao:
      'Registra a entrada, o estado aparente, os acessórios e as evidências da guarda do veículo.',
    modalidades: TODAS,
    campos: [
      ...COMUNS,
      campo('dataEntregaGuarda', 'Data da entrega à guarda da loja', undefined, 'date'),
      campo(
        'horarioEntrega',
        'Horário da entrega',
        'Informe o horário local, com fuso se necessário.',
        'text'
      ),
      campo(
        'responsavelRecebimento',
        'Pessoa que recebeu o veículo',
        'Nome, identificação funcional e vínculo com a loja.',
        'text'
      ),
      VISTORIA,
      campo('documentosChaves', 'Documentos, chaves e itens entregues'),
      TEST_DRIVE
    ]
  },
  {
    id: 'autorizacao_despesa_desconto',
    titulo: 'Autorização específica de despesa ou desconto',
    descricao:
      'Documenta a autorização delimitada do proprietário; não comprova despesa realizada ou pagamento.',
    modalidades: CONSIGNACOES,
    campos: [
      ...COMUNS,
      campo(
        'contratoVinculado',
        'Contrato a que a autorização se vincula',
        'Informe identificador, versão e data do instrumento assinado.',
        'text'
      ),
      campo(
        'objetoAutorizacao',
        'Despesa ou desconto autorizado',
        'Descreva a medida, fornecedor/proposta, justificativa, valor máximo em reais, preço final mínimo e impacto no valor do proprietário.'
      ),
      campo('validadeAutorizacao', 'Validade da autorização', undefined, 'date'),
      campo(
        'pagadorAutorizacao',
        'Responsável pelo pagamento e condições de dedução',
        'Defina quem paga e se haverá reembolso ou desconto; no estimatório qualquer alteração do preço estimado exige aditivo expresso.'
      )
    ]
  },
  {
    id: 'aditivo',
    titulo: 'Termo aditivo ao contrato de veículo',
    descricao:
      'Registra alterações específicas sem substituir silenciosamente o contrato original.',
    modalidades: TODAS,
    campos: [
      ...COMUNS,
      campo(
        'contratoVinculado',
        'Contrato original: identificação, versão e data',
        undefined,
        'text'
      ),
      campo(
        'clausulasAlteradas',
        'Cláusulas alteradas e nova redação integral',
        'Identifique a redação anterior, a nova redação, valores e prazos; não altere modalidade ou partes sem instrumento adequado.'
      ),
      campo('inicioVigencia', 'Início da vigência da alteração', undefined, 'date'),
      campo(
        'impactoFinanceiro',
        'Efeito sobre valores, saldos e vencimentos',
        'Detalhe os efeitos e pagamentos já realizados; declare se não há alteração financeira.'
      )
    ]
  },
  {
    id: 'prestacao_contas',
    titulo: 'Demonstrativo de venda e prestação de contas',
    descricao:
      'Apura venda, recebimentos, despesas efetivas, remuneração e repasses a partir dos registros da negociação.',
    modalidades: CONSIGNACOES,
    campos: [
      ...COMUNS,
      campo(
        'periodoPrestacao',
        'Período abrangido e data de corte',
        'Informe as datas e os documentos abrangidos.',
        'text'
      ),
      campo('anexosComprovantes', 'Relação dos comprovantes entregues às partes'),
      campo(
        'observacoesContas',
        'Divergências e valores ainda pendentes',
        'Declare expressamente as pendências ou a ausência de divergências conhecidas; não use quitação genérica.'
      )
    ]
  },
  {
    id: 'recibo_repasse',
    titulo: 'Recibo de repasse ao proprietário e quitação delimitada',
    descricao:
      'Identifica um repasse real registrado e seu comprovante; distinto da venda de veículo para revenda.',
    modalidades: ['consignacao_estimatoria', 'comissao'],
    campos: [
      ...COMUNS,
      campo(
        'repasseId',
        'Identificador do repasse registrado',
        'Selecione ou copie o ID do movimento de repasse já registrado na negociação.',
        'text'
      ),
      CONTA_REPASSE,
      campo(
        'referenciaQuitacao',
        'Obrigação e competência quitadas',
        'Identifique exatamente o principal/parcela correspondente ao valor do repasse; outros saldos permanecem exigíveis.'
      )
    ]
  },
  {
    id: 'devolucao',
    titulo: 'Termo de devolução de veículo e encerramento de guarda',
    descricao:
      'Usa o evento de devolução registrado, com vistoria de saída e pendências preservadas.',
    modalidades: CONSIGNACOES,
    campos: [
      ...COMUNS,
      campo(
        'recebedorDevolucao',
        'Quem recebe o veículo e em qual qualidade',
        'Nome e documento do proprietário ou identificação e referência dos poderes do representante.',
        'text'
      ),
      campo('localDevolucao', 'Local e horário de devolução', undefined, 'text'),
      campo('documentosChaves', 'Documentos, chaves e acessórios devolvidos'),
      campo(
        'confrontoVistorias',
        'Confronto das vistorias de entrada e saída',
        'Registre diferenças, fotos e reservas; não declare inexistência de avarias sem verificação.'
      ),
      campo(
        'saldoEncerramento',
        'Obrigações que permanecem e respectivas datas',
        'Discrimine saldos, divergências e responsáveis, ou declare não haver saldo conhecido. Não há quitação de vícios ocultos ou direitos de terceiros.'
      )
    ]
  },
  {
    id: 'distrato',
    titulo: 'Distrato e acerto das obrigações da negociação',
    descricao:
      'Encerra o vínculo mediante ajuste bilateral e especifica devoluções, valores e obrigações sobreviventes.',
    modalidades: TODAS,
    campos: [
      ...COMUNS,
      campo(
        'contratoVinculado',
        'Contrato distratado: identificação, versão e data',
        undefined,
        'text'
      ),
      campo('motivoDistrato', 'Motivo e condições do encerramento'),
      campo('dataEncerramento', 'Data do encerramento', undefined, 'date'),
      campo(
        'destinoVeiculo',
        'Destino do veículo, posse e documentos',
        'Identifique responsável, prazo, vistoria e comprovante de entrega; se houve venda a terceiro, explique a solução sem afetar direitos dele.'
      ),
      campo(
        'acertoFinanceiro',
        'Acerto de valores, responsáveis e vencimentos',
        'Discrimine pagamentos efetivos, restituições, comissões, despesas, saldos e comprovantes. Não registre como quitado o que ainda será pago.'
      ),
      campo(
        'obrigacoesRemanescentes',
        'Obrigações que permanecem vigentes',
        'Inclua regularizações documentais, prestação de contas, garantias legais e proteção de dados; informe os prazos.'
      )
    ]
  }
];

function texto(valor: string | undefined): string {
  return (valor ?? '').trim();
}

function pessoaJuridica(parte: ParteNegociacao): boolean {
  return isCnpj(parte.documento);
}

function dataValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T12:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

function dataBr(valor: string): string {
  if (!dataValida(valor)) return '[PENDENTE: data válida]';
  return `${valor.slice(8, 10)}/${valor.slice(5, 7)}/${valor.slice(0, 4)}`;
}

function moeda(centavos: number): string {
  if (!Number.isSafeInteger(centavos)) return '[PENDENTE: valor válido em centavos]';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    centavos / 100
  );
}

function nomeMunicipio(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function qualificacao(parte: ParteNegociacao, papel: string): string {
  const pj = pessoaJuridica(parte);
  return `${papel}: ${texto(parte.nome) || '[PENDENTE: nome]'}, ${pj ? 'CNPJ' : 'CPF/CNPJ'} ${texto(parte.documento) || '[PENDENTE: documento]'}, endereço ${texto(parte.endereco) || '[PENDENTE: endereço]'}, ${texto(parte.cidade) || '[PENDENTE: cidade]'}/${texto(parte.uf) || '[PENDENTE: UF]'}. Contatos: ${texto(parte.email) || 'e-mail não cadastrado'}; ${texto(parte.telefone) || 'telefone não cadastrado'}.${pj ? ` Representante: ${texto(parte.representante) || '[PENDENTE: representante]'}.` : ''}`;
}

function linhaMovimento(movimento: MovimentoFinanceiro): string {
  return `ID ${movimento.id}: ${moeda(movimento.valorCentavos)}, em ${dataBr(movimento.data)}; comprovante ${movimento.comprovante}.`;
}

function comissao(n: Negociacao): string {
  return n.condicoes.comissaoTipo === 'fixa'
    ? `${moeda(n.condicoes.comissaoFixaCentavos)} por negócio concluído`
    : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n.condicoes.comissaoPercentualBps / 100)}% do preço bruto efetivo da venda`;
}

/** Render plain text only. The API must reject emission whenever pendencias is non-empty. */
export function renderDocumento(
  n: Negociacao,
  modeloId: string,
  campos: CamposDocumento = {}
): DocumentoRenderizado {
  const modelo = MODELOS_DOCUMENTO.find((item) => item.id === modeloId);
  if (!modelo)
    throw new Error('Modelo de documento não encontrado. Escolha um modelo do catálogo.');

  const pendencias: string[] = [];
  const requer = (condicao: boolean, mensagem: string): void => {
    if (!condicao) pendencias.push(mensagem);
  };
  const valor = (chave: string): string =>
    texto(campos[chave]) ||
    `[PENDENTE: ${modelo.campos.find((item) => item.chave === chave)?.rotulo ?? chave}]`;
  const principal = TODAS.includes(modelo.id as ModalidadeNegociacao);
  const vendaDireta = modelo.id === 'compra_venda' || modelo.id === 'repasse_revenda';
  const modalidadeConsignada = CONSIGNACOES.includes(n.modalidade);
  const incluiComprador =
    vendaDireta ||
    (modelo.id === 'prestacao_contas' && Boolean(n.vendaEfetivada)) ||
    (['aditivo', 'distrato'].includes(modelo.id) &&
      ['compra_venda', 'repasse_revenda'].includes(n.modalidade));
  const vendaEmNomeDaLoja =
    vendaDireta && ['consignacao_estimatoria', 'comissao'].includes(n.modalidade);
  const partes: [ParteNegociacao, string][] = [
    [n.loja, 'Loja'],
    [n.vendedor, 'Vendedor/proprietário']
  ];
  if (incluiComprador) partes.push([n.comprador, 'Comprador']);

  requer(
    modelo.modalidades.includes(n.modalidade),
    `O modelo “${modelo.titulo}” não se aplica à modalidade desta negociação.`
  );
  if (principal && !vendaDireta) {
    requer(
      !['vendida', 'liquidada', 'devolvida', 'cancelada'].includes(n.status),
      'Esta operação já foi vendida ou encerrada. Consulte a via original preservada; uma nova contratação exige outro dossiê ou instrumento de alteração adequado.'
    );
  }
  for (const item of modelo.campos) {
    if (item.obrigatorio) requer(Boolean(texto(campos[item.chave])), `Preencha: ${item.rotulo}.`);
    if (texto(campos[item.chave]) && item.tipo === 'date')
      requer(dataValida(campos[item.chave]), `Informe uma data válida em ${item.rotulo}.`);
  }
  for (const [parte, papel] of partes) {
    for (const [chave, rotulo] of [
      ['nome', 'nome/razão social'],
      ['documento', 'CPF/CNPJ'],
      ['endereco', 'endereço completo'],
      ['cidade', 'cidade'],
      ['uf', 'UF']
    ] as const) {
      requer(Boolean(texto(parte[chave])), `Complete ${rotulo} de ${papel}.`);
    }
    requer(
      isValidDocumento(parte.documento),
      `Informe CPF ou CNPJ formalmente válido de ${papel}.`
    );
    requer(/^[A-Z]{2}$/.test(parte.uf), `Informe a UF de ${papel} com duas letras.`);
    if (pessoaJuridica(parte))
      requer(
        Boolean(texto(parte.representante)),
        `Identifique o representante e sua qualificação para ${papel}.`
      );
  }
  if (partes.some(([parte]) => pessoaJuridica(parte)))
    requer(
      Boolean(texto(campos.poderesRepresentacao)),
      'Identifique os documentos que comprovam os poderes dos representantes das pessoas jurídicas.'
    );

  const v = n.veiculo;
  for (const [chave, rotulo] of [
    ['marca', 'marca'],
    ['modelo', 'modelo'],
    ['placa', 'placa'],
    ['chassi', 'chassi'],
    ['renavam', 'RENAVAM'],
    ['cor', 'cor'],
    ['combustivel', 'combustível'],
    ['restricoes', 'restrições/gravames e débitos conhecidos'],
    ['avarias', 'avarias, histórico e defeitos conhecidos'],
    ['acessorios', 'acessórios e chaves']
  ] as const) {
    requer(
      Boolean(texto(v[chave])),
      `Complete ${rotulo} do veículo; quando pertinente, declare expressamente a inexistência conhecida.`
    );
  }
  requer(
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(v.placa.toUpperCase().replace(/[^A-Z0-9]/g, '')),
    'Informe a placa brasileira completa do veículo.'
  );
  requer(
    /^[A-HJ-NPR-Z0-9]{17}$/.test(v.chassi.toUpperCase()),
    'Informe o chassi completo de 17 caracteres; veículos com identificação especial exigem revisão específica.'
  );
  requer(/^\d{9,11}$/.test(v.renavam), 'Informe o RENAVAM completo do veículo.');
  requer(
    Number.isInteger(v.anoFabricacao) &&
      v.anoFabricacao >= 1900 &&
      Number.isInteger(v.anoModelo) &&
      v.anoModelo >= v.anoFabricacao &&
      v.anoModelo <= v.anoFabricacao + 2,
    'Confira os anos de fabricação/modelo do veículo.'
  );
  requer(
    Number.isSafeInteger(v.km) && v.km >= 0,
    'Informe a quilometragem observada em número inteiro não negativo.'
  );
  requer(
    Boolean(texto(n.condicoes.cidadeAssinatura)),
    'Informe a cidade de assinatura da negociação.'
  );
  requer(
    Boolean(texto(n.condicoes.foro)),
    'Informe um foro com relação ao domicílio das partes ou ao local da obrigação.'
  );
  const cidades = partes.map(([parte]) => nomeMunicipio(parte.cidade));
  const foro = nomeMunicipio(n.condicoes.foro);
  requer(
    cidades.some((cidade) => cidade.length > 2 && foro.includes(cidade)) ||
      Boolean(texto(campos.vinculoForo)),
    'O foro deve corresponder ao domicílio de uma das partes. Se for o local da obrigação, informe o vínculo no campo vinculoForo.'
  );

  if (principal) {
    requer(
      Boolean(texto(n.condicoes.seguro)),
      'Descreva o seguro, coberturas, franquia e beneficiário, ou declare expressamente a ausência de seguro.'
    );
    requer(Boolean(texto(n.condicoes.localGuarda)), 'Informe o local de guarda do veículo.');
  }
  if (modelo.id === 'vistoria_entrada') {
    requer(
      Boolean(texto(n.condicoes.localGuarda)),
      'Informe o local de guarda para o termo de entrada.'
    );
    requer(
      Boolean(texto(n.condicoes.seguro)),
      'Descreva o seguro ou sua ausência no termo de entrada.'
    );
  }
  if (principal && !vendaDireta) {
    requer(
      dataValida(n.condicoes.dataInicio) &&
        dataValida(n.condicoes.dataFim) &&
        n.condicoes.dataFim >= n.condicoes.dataInicio,
      'Defina início e término válidos do contrato, em ordem cronológica.'
    );
    requer(
      Number.isSafeInteger(n.condicoes.precoAnunciadoCentavos) &&
        n.condicoes.precoAnunciadoCentavos > 0,
      'Informe preço anunciado maior que zero.'
    );
    requer(
      Number.isSafeInteger(n.condicoes.precoMinimoCentavos) &&
        n.condicoes.precoMinimoCentavos > 0 &&
        n.condicoes.precoMinimoCentavos <= n.condicoes.precoAnunciadoCentavos,
      'Informe preço mínimo positivo e não superior ao preço anunciado.'
    );
    requer(
      Number.isInteger(n.condicoes.prazoRepasseDias) && n.condicoes.prazoRepasseDias >= 0,
      'Informe prazo de repasse válido em dias corridos.'
    );
    requer(
      Number.isSafeInteger(n.condicoes.despesasAutorizadasCentavos) &&
        n.condicoes.despesasAutorizadasCentavos >= 0,
      'Informe teto de despesas autorizadas em centavos não negativos.'
    );
    if (n.condicoes.despesasAutorizadasCentavos > 0)
      requer(
        Boolean(texto(n.condicoes.despesasDescricao)),
        'Descreva quais despesas estão autorizadas dentro do teto.'
      );
  }
  if (modelo.id === 'consignacao_estimatoria') {
    requer(
      n.condicoes.posse === 'loja',
      'Consignação estimatória exige entrega à loja: ajuste a posse ou selecione intermediação/comissão.'
    );
    requer(
      n.condicoes.precoEstimadoCentavos > 0 &&
        Number.isSafeInteger(n.condicoes.precoEstimadoCentavos),
      'Informe o preço estimado devido integralmente ao proprietário.'
    );
    requer(
      n.condicoes.precoMinimoCentavos >= n.condicoes.precoEstimadoCentavos,
      'No estimatório, o piso de venda não pode reduzir automaticamente o preço devido ao proprietário.'
    );
  }
  if (modelo.id === 'comissao' || modelo.id === 'intermediacao') {
    requer(
      n.condicoes.comissaoTipo === 'fixa'
        ? Number.isSafeInteger(n.condicoes.comissaoFixaCentavos) &&
            n.condicoes.comissaoFixaCentavos >= 0
        : Number.isInteger(n.condicoes.comissaoPercentualBps) &&
            n.condicoes.comissaoPercentualBps >= 0 &&
            n.condicoes.comissaoPercentualBps <= 10000,
      'Confira a remuneração fixa ou percentual da loja.'
    );
  }
  if (vendaDireta) {
    requer(
      !['devolvida', 'cancelada'].includes(n.status),
      'Não é possível emitir novo contrato de venda em operação devolvida ou cancelada. Consulte a via original preservada ou cadastre uma nova negociação.'
    );
    requer(
      n.status !== 'liquidada' || Boolean(n.vendaEfetivada),
      'Esta operação foi liquidada sem venda a terceiro. Para uma nova venda, cadastre outra negociação; as vias já emitidas permanecem disponíveis.'
    );
    requer(
      n.venda.precoCentavos > 0 && Number.isSafeInteger(n.venda.precoCentavos),
      'Informe o preço da compra e venda.'
    );
    requer(
      n.venda.precoCentavos >= n.condicoes.precoMinimoCentavos,
      'O preço de venda está abaixo do piso autorizado. Registre primeiro a autorização ou o aditivo aceito e atualize as condições da operação antes de emitir o contrato.'
    );
    if (modalidadeConsignada) {
      requer(
        n.status !== 'rascunho',
        'Ative a consignação ou intermediação com a referência do contrato principal antes de emitir o contrato de venda; a prévia pode ser salva como minuta.'
      );
      const dataVenda = n.vendaEfetivada?.data ?? campos.dataDocumento ?? '';
      requer(
        dataValida(n.condicoes.dataInicio) &&
          dataValida(n.condicoes.dataFim) &&
          dataValida(dataVenda) &&
          dataVenda >= n.condicoes.dataInicio &&
          dataVenda <= n.condicoes.dataFim,
        'A data da venda registrada, ou a data proposta do instrumento quando ainda não houve venda, deve estar na vigência da operação. Regularize o prazo por aditivo antes de uma nova venda.'
      );
    }
    if (n.vendaEfetivada) {
      requer(
        n.venda.precoCentavos === n.vendaEfetivada.precoCentavos,
        'O preço do contrato difere da venda efetivada. Preserve o registro original e regularize a divergência antes de emitir.'
      );
    }
    requer(Boolean(texto(n.venda.formaPagamento)), 'Descreva a forma de pagamento da venda.');
    requer(
      dataValida(n.venda.dataEntrega) && Boolean(texto(n.venda.localEntrega)),
      'Informe data e local de entrega do veículo.'
    );
    requer(
      n.venda.parcelas.length > 0,
      'Cadastre ao menos uma parcela, inclusive para pagamento à vista, com valor e vencimento.'
    );
    requer(
      n.venda.parcelas.every(
        (p) =>
          dataValida(p.vencimento) && Number.isSafeInteger(p.valorCentavos) && p.valorCentavos > 0
      ),
      'Confira os valores e vencimentos de todas as parcelas.'
    );
    requer(
      n.venda.parcelas.reduce((soma, p) => soma + p.valorCentavos, 0) === n.venda.precoCentavos,
      'A soma das parcelas deve ser igual ao preço da venda.'
    );
    requer(
      normalizarDocumento(n.vendedor.documento) !== normalizarDocumento(n.comprador.documento),
      'Vendedor e comprador devem ser pessoas distintas.'
    );
    if (vendaEmNomeDaLoja)
      requer(
        normalizarDocumento(n.loja.documento) !== normalizarDocumento(n.comprador.documento),
        'A loja vendedora e o comprador devem ser pessoas distintas.'
      );
  }
  if (modelo.id === 'repasse_revenda') {
    requer(
      pessoaJuridica(n.comprador),
      'O modelo de repasse para revenda exige comprador pessoa jurídica com CNPJ.'
    );
    requer(
      n.venda.compradorRevendedor && Boolean(texto(n.venda.finalidadeRevenda)),
      'Registre a declaração do comprador de que adquire para revenda e a respectiva finalidade.'
    );
  }
  if (modelo.id === 'vistoria_entrada')
    requer(
      n.condicoes.posse === 'loja',
      'O termo de entrada na loja exige posse cadastrada como loja.'
    );
  if (modelo.id === 'prestacao_contas')
    requer(
      Boolean(n.vendaEfetivada) ||
        (n.modalidade === 'consignacao_estimatoria' && ['ativa', 'liquidada'].includes(n.status)),
      'Registre a venda efetivada ou ative a consignação estimatória antes da prestação de contas.'
    );
  const repasse = n.repasses.find((item) => item.id === texto(campos.repasseId));
  if (modelo.id === 'recibo_repasse') {
    requer(Boolean(repasse), 'Selecione um repasse financeiro existente nesta negociação.');
    requer(
      Boolean(repasse && repasse.valorCentavos > 0 && texto(repasse.comprovante)),
      'O repasse deve ter valor positivo e comprovante cadastrado.'
    );
    if (n.modalidade !== 'consignacao_estimatoria')
      requer(
        Boolean(n.vendaEfetivada),
        'Registre a venda efetivada antes de emitir recibo de repasse da comissão.'
      );
    if (repasse && dataValida(campos.dataDocumento ?? ''))
      requer(
        campos.dataDocumento >= repasse.data,
        'A data do recibo não pode anteceder o repasse registrado.'
      );
  }
  if (modelo.id === 'devolucao')
    requer(
      Boolean(n.devolucao && texto(n.devolucao.evidencia) && texto(n.devolucao.vistoria)),
      'Registre a devolução com vistoria e evidência antes de emitir o termo.'
    );
  if (modelo.id === 'devolucao' && n.devolucao && dataValida(campos.dataDocumento ?? ''))
    requer(
      campos.dataDocumento >= n.devolucao.data,
      'A data do termo não pode anteceder a devolução registrada.'
    );
  if (
    modelo.id === 'autorizacao_despesa_desconto' &&
    dataValida(campos.validadeAutorizacao ?? '') &&
    dataValida(campos.dataDocumento ?? '')
  )
    requer(
      campos.validadeAutorizacao >= campos.dataDocumento,
      'A validade da autorização não pode anteceder a data do instrumento.'
    );

  const secoes: string[] = [];
  const clausula = (titulo: string, corpo: string): void => {
    secoes.push(`${secoes.length + 1}. ${titulo.toUpperCase()}\n${corpo}`);
  };
  const partesTexto = [
    qualificacao(
      n.vendedor,
      vendaDireta && !vendaEmNomeDaLoja ? 'VENDEDOR' : 'PROPRIETÁRIO/CONSIGNANTE'
    ),
    qualificacao(
      n.loja,
      vendaEmNomeDaLoja
        ? 'LOJA/VENDEDORA EM NOME PRÓPRIO'
        : vendaDireta
          ? 'LOJA/INTERVENIENTE'
          : 'LOJA'
    ),
    ...(incluiComprador ? [qualificacao(n.comprador, 'COMPRADOR')] : [])
  ].join('\n');
  clausula(
    'Partes e representação',
    `${partesTexto}\n${partes.some(([parte]) => pessoaJuridica(parte)) ? `Documentos de representação: ${valor('poderesRepresentacao')}. Cada signatário responde pela veracidade das informações e pela existência de seus poderes, que deverão ser conferidos pelas demais partes.` : 'As partes declaram sua capacidade civil para este negócio.'}`
  );
  clausula(
    'Individualização do veículo',
    `${v.marca} ${v.modelo}; fabricação/modelo ${v.anoFabricacao}/${v.anoModelo}; placa ${v.placa}; chassi ${v.chassi}; RENAVAM ${v.renavam}; cor ${v.cor}; combustível ${v.combustivel}; hodômetro observado ${v.km.toLocaleString('pt-BR')} km. A leitura do hodômetro não constitui, isoladamente, certificação de quilometragem histórica.\nRestrições e gravames declarados: ${v.restricoes}.\nEstado, avarias e defeitos conhecidos: ${v.avarias}.\nAcessórios e chaves: ${v.acessorios}. A descrição deve identificar também histórico conhecido de leilão, sinistro, alagamento e reparo estrutural. Informação ausente ou desconhecida não pode ser apresentada como fato verificado.`
  );

  if (vendaDireta) {
    clausula(
      'Objeto e participação da loja',
      `${vendaEmNomeDaLoja ? `A LOJA, na qualidade de ${n.modalidade === 'comissao' ? 'comissária' : 'consignatária estimatória'}, vende em nome próprio ao COMPRADOR, com participação do PROPRIETÁRIO/CONSIGNANTE para os atos que lhe competem,` : 'O VENDEDOR vende ao COMPRADOR'} o veículo individualizado neste instrumento, sob as condições seguintes. ${n.vendaEfetivada ? `Este documento se refere à venda já registrada em ${dataBr(n.vendaEfetivada.data)}, referência ${n.vendaEfetivada.evidenciaContrato}; a data deste instrumento corresponde à sua formalização documental e não cria nova venda ou comprova assinatura anterior. ` : ''}As referências a vendedor incluem quem assume essa posição na forma descrita. Papel da loja e vínculo ao contrato de consignação, quando houver: ${valor('papelLoja')}. A qualificação adotada não exclui responsabilidades impostas pela atuação efetiva de cada participante. Titularidade, documentos e consultas: ${valor('titularidadeDocumentos')}. Divergência registral, representação insuficiente ou restrição impeditiva deverá ser regularizada antes da entrega definitiva e da transferência, preservado o direito à resolução e à restituição cabível se o impedimento não for solucionado.`
    );
    clausula(
      'Preço e pagamento',
      `Preço total: ${moeda(n.venda.precoCentavos)}. Forma de pagamento: ${n.venda.formaPagamento}.\n${n.venda.parcelas.map((p, i) => `Parcela ${i + 1}: ${moeda(p.valorCentavos)}, vencimento ${dataBr(p.vencimento)}${texto(p.descricao) ? `, ${p.descricao}` : ''}.`).join('\n')}\nEste instrumento descreve obrigações de pagamento e não constitui recibo. Quitação somente para valores efetivamente recebidos, com identificação do pagamento e conferência pelo credor. Crédito ou financiamento depende de aprovação e contratação próprias; não há cessão automática de crédito, novação ou liberação do devedor sem instrumento específico. Em caso de veículo dado em pagamento, sua identificação, valor, titularidade e condições devem constar de anexo assinado.`
    );
    clausula(
      'Entrega, guarda e débitos',
      `Entrega prevista em ${dataBr(n.venda.dataEntrega)}, no local ${n.venda.localEntrega}, mediante registro de data, hora, quilometragem, chaves, documentos e estado. Até a entrega efetiva, a guarda permanece com o responsável identificado, atualmente ${n.condicoes.posse === 'loja' ? 'a loja' : 'o proprietário'}, no local ${n.condicoes.localGuarda}. Seguro declarado: ${n.condicoes.seguro}. Débitos e acertos internos: ${valor('debitosResponsaveis')}. A imputação entre as partes não altera responsabilidades perante o Fisco, autoridades, vítimas ou terceiros. Multas e despesas surgidas depois deverão ser atribuídas conforme fato gerador, condutor e responsabilidade legal, com documentos e direito de contestação.`
    );
    clausula(
      'Documentação e transferência',
      `${valor('transferenciaResponsaveis')}. O vendedor colaborará com a documentação hábil e a comunicação de venda; o comprador adotará as providências para o novo registro no prazo legal, em regra 30 dias (CTB, art. 123, § 1º). O antigo proprietário observará o art. 134 do CTB e guardará o protocolo de comunicação. As partes não devem aguardar o término de prazo para sanar impedimento conhecido. A assinatura deste contrato não substitui ATPV, comunicação de venda, vistoria, quitação de débitos, registro no Renavam ou emissão de CRLV-e. Meios eletrônicos dependem das exigências e plataformas aceitas pela autoridade competente.`
    );
    if (modelo.id === 'repasse_revenda') {
      clausula(
        'Aquisição para revenda',
        `O COMPRADOR declara atuar profissionalmente na revenda de veículos e adquirir este bem para ${n.venda.finalidadeRevenda}. Comprovação declarada da atividade: ${valor('atividadeRevendedor')}. Essa destinação foi considerada na negociação, sem autorizar omissão, adulteração, venda de bem irregular ou renúncia a direitos indisponíveis. O uso da expressão “repasse”, a existência de CNPJ e a ciência de defeitos descritos não afastam automaticamente o Código de Defesa do Consumidor quando juridicamente aplicável, nem as regras de boa-fé, vícios redibitórios e evicção. O comprador deverá prestar ao futuro adquirente as informações verdadeiras que recebeu, inclusive histórico e defeitos conhecidos, e cumprir os deveres de fornecedor que lhe couberem.`
      );
    }
    clausula(
      'Estado, informação e garantias',
      `Registros de inspeção e anexos: ${valor('vistoriaReferencia')}. O comprador tem oportunidade de examinar o veículo e obter avaliação independente. Ciência de defeitos especificados não significa renúncia a direitos relativos a vícios ocultos, informações falsas ou inadequação não esclarecida. Quando houver relação de consumo, ficam preservadas a garantia legal, a responsabilidade legal dos fornecedores e as opções e prazos do CDC, inclusive os 90 dias para reclamar de vício aparente em produto durável, com contagem própria para vício oculto. A garantia legal não se limita genericamente a “motor e câmbio”. Fora da incidência do CDC, aplicam-se as regras civis pertinentes. Garantia adicional ajustada: ${valor('garantiaContratual')}. A garantia contratual, quando concedida, complementa a legal e deve ser documentada com clareza.`
    );
  }

  if (modelo.id === 'consignacao_estimatoria') {
    clausula(
      'Natureza estimatória, entrega e prazo',
      `O PROPRIETÁRIO/CONSIGNANTE entrega à LOJA/CONSIGNATÁRIA, em ${dataBr(campos.dataEntregaGuarda ?? '')}, o veículo descrito, para venda na forma dos arts. 534 a 537 do Código Civil. Vigência de ${dataBr(n.condicoes.dataInicio)} a ${dataBr(n.condicoes.dataFim)}. Titularidade e documentos: ${valor('titularidadeDocumentos')}. A entrega e o estado deverão ser comprovados pelo termo e anexos: ${valor('vistoriaReferencia')}. O contrato não representa compra imediata pela loja nem lhe outorga procuração para assinar atos de transferência em nome do proprietário.`
    );
    clausula(
      'Preço estimado e comercialização',
      `O preço estimado devido ao consignante é ${moeda(n.condicoes.precoEstimadoCentavos)}, sem dedução automática de comissão, despesas, tributos ou descontos. Preço anunciado: ${moeda(n.condicoes.precoAnunciadoCentavos)}; piso autorizado de venda: ${moeda(n.condicoes.precoMinimoCentavos)}. A diferença positiva entre o preço efetivo e o estimado constitui resultado econômico da consignatária, que suporta seus custos, salvo ajuste específico compatível com esta modalidade. Não há remuneração cumulativa automática. Redução do preço estimado, prazo ou demais condições depende de aditivo aceito por ambas as partes. A concessão de crédito ao comprador não altera, por si só, a obrigação da loja perante o consignante.`
    );
    clausula(
      'Pagamento ou restituição',
      `A loja pagará o preço estimado ou restituirá integralmente o veículo até ${dataBr(n.condicoes.dataFim)}, sem renovação tácita neste instrumento. Ocorrendo venda antes, o pagamento ao consignante vencerá em até ${n.condicoes.prazoRepasseDias} dia(s) corrido(s) após o recebimento integral do comprador, nunca depois do término acima; a concessão de prazo ao comprador não prorroga esse limite sem aditivo. Destino autorizado: ${valor('contaRepasse')}. Nenhum pagamento a terceiro libera a loja sem autorização específica verificada. Se a restituição integral se tornar impossível, o dever de pagar o preço subsiste ainda que o fato não seja imputável à consignatária, conforme o art. 535 do Código Civil. Sinistro, furto, roubo, inadimplemento do comprador ou ausência de cobertura securitária não geram exoneração automática.`
    );
    clausula(
      'Titularidade, disposição e encerramento',
      `Enquanto não pago integralmente o preço, observar-se-á a proteção do art. 536 do Código Civil; a loja não oferecerá o veículo como garantia de dívida própria. O consignante não disporá do veículo antes de sua restituição ou comunicação de restituição, nos termos do art. 537. A saída sem venda exige termo de devolução com confronto de vistorias e entrega dos itens. Débitos e regularização: ${valor('debitosResponsaveis')}. Providências de eventual transferência e comunicação: ${valor('transferenciaResponsaveis')}. A alocação interna de responsabilidades não altera a situação registral nem direitos de terceiros.`
    );
  }

  if (modelo.id === 'comissao') {
    clausula(
      'Objeto, instruções e prazo',
      `O PROPRIETÁRIO/COMITENTE encarrega a LOJA/COMISSÁRIA de negociar a venda do veículo em nome próprio, por conta do comitente, conforme os arts. 693 a 709 do Código Civil, de ${dataBr(n.condicoes.dataInicio)} até ${dataBr(n.condicoes.dataFim)}. Titularidade e documentos: ${valor('titularidadeDocumentos')}. A comissária observará instruções documentadas, diligência e prestação de informações. A atuação em nome próprio não substitui poderes ou formalidades necessários à transferência registral do bem de terceiro. Não se outorga procuração por este contrato.`
    );
    clausula(
      'Preço, remuneração e crédito ao comprador',
      `Preço anunciado: ${moeda(n.condicoes.precoAnunciadoCentavos)}; menor preço autorizado: ${moeda(n.condicoes.precoMinimoCentavos)}. Remuneração: ${comissao(n)}. Mudanças, permuta, financiamento, parcelamento, concessão de crédito, descontos ou cessão de recebíveis exigem autorização específica que identifique impacto, vencimentos e riscos. Não há garantia “del credere” nem assunção geral da solvência do comprador neste instrumento. Permanecem as responsabilidades decorrentes de culpa, desvio de instruções e normas obrigatórias. A comissão não autoriza retenção indiscriminada de documentos ou valores alheios ao acerto devido.`
    );
    clausula(
      'Recebimento, despesas e prestação de contas',
      `A loja identificará os pagamentos efetivos, guardará comprovantes e apresentará ao proprietário demonstrativo do preço, remuneração, despesas efetivamente realizadas e autorizadas e saldo. O teto de despesa não é débito nem prova de desembolso. O saldo apurado será repassado em até ${n.condicoes.prazoRepasseDias} dia(s) corrido(s) após o recebimento integral e compensado do preço do comprador, sem descontos fora do pactuado. Cronograma diferente ou antecipação exige ajuste específico prévio, com regularização do fluxo correspondente. Destino: ${valor('contaRepasse')}. Pagamento a terceiro ou cessão de crédito exige autorização própria. Débitos do veículo e regularização: ${valor('debitosResponsaveis')}. Transferência e comunicação: ${valor('transferenciaResponsaveis')}. A loja apresentará prestação de contas final no encerramento e devolverá o veículo se não vendido, ressalvados direitos legalmente reconhecidos e saldos apurados.`
    );
  }

  if (modelo.id === 'intermediacao') {
    clausula(
      'Objeto e limites da intermediação',
      `O PROPRIETÁRIO contrata a LOJA/INTERMEDIADORA para aproximar interessados na aquisição do veículo e prestar informações sobre propostas, de ${dataBr(n.condicoes.dataInicio)} até ${dataBr(n.condicoes.dataFim)}, na forma dos arts. 722 a 729 do Código Civil. Titularidade e documentos: ${valor('titularidadeDocumentos')}. O proprietário permanece responsável por decidir e formalizar a venda. A loja não recebe poderes para alienar, assinar pelo proprietário, prometer transferência, conceder desconto, receber o preço ou dar quitação; eventual mandato ou autorização de recebimento exige instrumento específico.`
    );
    clausula(
      'Preço, resultado e remuneração',
      `Preço anunciado: ${moeda(n.condicoes.precoAnunciadoCentavos)}; piso de propostas: ${moeda(n.condicoes.precoMinimoCentavos)}. Abaixo do piso, exige-se aprovação expressa do proprietário. Remuneração ajustada: ${comissao(n)}. Resultado contratualmente pretendido: ${valor('resultadoRemuneracao')}. Pagamento da remuneração: ${valor('pagamentoRemuneracao')}. Aplicam-se as regras legais sobre resultado obtido, arrependimento e negócios resultantes da mediação; a análise depende do histórico efetivo, sem cobrança automática apenas por cadastrar interessado. O preço do veículo será pago ao vendedor legitimado, sem trânsito pela loja neste modelo.`
    );
    clausula(
      'Informação, despesas e término',
      `A intermediadora atuará com diligência e comunicará propostas, riscos e informações relevantes. O proprietário informará restrições, defeitos e mudanças de condições, fornecendo documentos verdadeiros. Débitos e responsáveis: ${valor('debitosResponsaveis')}. A loja não garante a solvência de interessados nem substitui verificação documental ou técnica, preservada sua responsabilidade por conduta própria. As despesas dependem de autorização e comprovação e serão cobradas separadamente, sem apropriação do preço do veículo. Ao término, a loja prestará informações e contas, retirará anúncios e devolverá itens sob sua guarda, ressalvados negócios comprovadamente decorrentes da mediação.`
    );
  }

  if (['consignacao_estimatoria', 'comissao', 'intermediacao'].includes(modelo.id)) {
    clausula(
      'Guarda, circulação e seguro',
      `A posse física ficará com ${n.condicoes.posse === 'loja' ? 'a loja' : 'o proprietário'}, no endereço ${n.condicoes.localGuarda}. A entrada ou mudança de guarda será documentada com data, hora, quilometragem, acessórios, fotos e responsáveis. Inspeção: ${valor('vistoriaReferencia')}. Regras de test-drive e deslocamentos: ${valor('testDrive')}. O uso particular, empréstimo e retirada por terceiro dependem de autorização específica. Antes de circulação devem ser verificadas habilitação, regularidade e segurança, registrando condutor, finalidade, horário e percurso. Seguro: ${n.condicoes.seguro}. A descrição do seguro não equivale à confirmação de cobertura pela seguradora; apólice e condições devem ser conferidas. Sinistros serão comunicados imediatamente, preservando provas e observando os deveres legais de cada parte.`
    );
    clausula(
      'Publicidade, exclusividade e autorizações',
      `${n.condicoes.exclusividade ? 'Foi ajustada exclusividade durante a vigência para a atividade descrita neste contrato. Nas modalidades de mediação observar-se-ão os requisitos e exceções legais, inclusive ausência de atuação; não há multa genérica automática.' : 'Não foi ajustada exclusividade comercial, respeitadas as limitações de disposição inerentes à modalidade contratada e os direitos por trabalho efetivamente realizado.'} Anúncios devem ser fiéis ao histórico e estado informado e não podem expor documentos pessoais. Teto de despesas previamente autorizadas: ${moeda(n.condicoes.despesasAutorizadasCentavos)}. Escopo: ${texto(n.condicoes.despesasDescricao) || 'Não há despesas previamente autorizadas.'} Despesa acima do teto ou fora do escopo exige aprovação prévia. Autorização não comprova realização, pagamento ou direito a dedução. No estimatório, custos não reduzem o preço estimado sem aditivo; nas outras modalidades, só se apuram despesas efetivas, autorizadas e comprovadas.`
    );
    clausula(
      'Deveres perante o adquirente',
      `Defeitos, histórico, gravames e condições devem ser informados ao potencial comprador com clareza, sem alegação de veículo “sem garantia” que contrarie a lei. A divisão de tarefas e eventual direito de regresso entre proprietário e loja não afastam direitos do consumidor, responsabilidades imperativas ou direitos de terceiros. Quando aplicável, a garantia legal do CDC independe de termo expresso e não pode ser limitada genericamente a determinados componentes. A declaração de fatos conhecidos não equivale a laudo técnico nem dispensa investigação de indícios relevantes.`
    );
  }

  if (modelo.id === 'vistoria_entrada') {
    clausula(
      'Entrega e recebimento',
      `Em ${dataBr(campos.dataEntregaGuarda ?? '')}, às ${valor('horarioEntrega')}, o proprietário entrega o veículo à loja no local ${n.condicoes.localGuarda}. Recebedor: ${valor('responsavelRecebimento')}. O recebimento se destina à operação ${n.id}, modalidade ${n.modalidade}, e não constitui compra, transferência de propriedade, procuração, quitação ou autorização geral de circulação.`
    );
    clausula(
      'Estado aparente e evidências',
      `A quilometragem e os apontamentos da individualização acima refletem a inspeção comercial realizada, sujeitos às ressalvas indicadas. Registros e anexos: ${valor('vistoriaReferencia')}. Documentos, chaves e outros itens recebidos: ${valor('documentosChaves')}. As partes devem conferir esses anexos e guardar cópias. Este termo não é laudo cautelar ou pericial, não certifica ausência de vício oculto, sinistro, adulteração ou restrição registral e não substitui consulta oficial ou exame por profissional habilitado.`
    );
    clausula(
      'Custódia e movimentação',
      `Local de guarda: ${n.condicoes.localGuarda}. Seguro declarado: ${n.condicoes.seguro}. Regras de movimentação: ${valor('testDrive')}. A loja documentará saídas, condutores, quilometragem e devolução e comunicará danos ou ocorrências. A responsabilidade da modalidade principal permanece aplicável, inclusive o art. 535 do Código Civil quando houver contrato estimatório. Divergências serão registradas por escrito, sem alteração retroativa desta vistoria.`
    );
  }

  if (modelo.id === 'autorizacao_despesa_desconto') {
    clausula(
      'Vínculo, objeto e limites',
      `Esta autorização vincula-se ao contrato ${valor('contratoVinculado')} da negociação ${n.id}. O proprietário autoriza somente o seguinte: ${valor('objetoAutorizacao')}. Validade até ${dataBr(campos.validadeAutorizacao ?? '')}. Condições de pagamento e dedução: ${valor('pagadorAutorizacao')}. Qualquer ampliação de escopo, aumento do limite, mudança de fornecedor relevante ou novo desconto depende de nova aprovação. A autorização depende do aceite identificável do proprietário e não pode ser inferida apenas de registro unilateral da loja.`
    );
    clausula(
      'Comprovação e efeito financeiro',
      `A autorização não comprova gasto, execução de serviço, venda nem pagamento. A loja deverá apresentar documento do fornecedor, valor e prova de execução/desembolso antes de pedir reembolso ou dedução admitida no contrato. Valores não utilizados não são devidos. Na consignação estimatória, o preço estimado continua integralmente devido, salvo aditivo expresso que o altere. Nos demais regimes, o desconto no valor do proprietário limita-se ao que tiver sido especificamente autorizado e efetivamente apurado. Direitos legais de consumidor e terceiros permanecem preservados.`
    );
  }

  if (modelo.id === 'aditivo') {
    clausula(
      'Instrumento original e alterações',
      `As partes alteram o contrato ${valor('contratoVinculado')}, relativo à negociação ${n.id}, exclusivamente nos seguintes termos: ${valor('clausulasAlteradas')}. ${modalidadeConsignada ? 'Neste dossiê, o aditivo limita-se ao contrato principal entre proprietário e loja; não altera a compra e venda celebrada com terceiro. Alteração do contrato de venda exige instrumento apropriado e participação expressa do comprador. ' : ''}Vigência das alterações a partir de ${dataBr(campos.inicioVigencia ?? '')}. Efeitos financeiros: ${valor('impactoFinanceiro')}. A nova redação deve ser lida em conjunto com o instrumento original, que será anexado e mantido sem alteração.`
    );
    clausula(
      'Ratificação e ausência de quitação presumida',
      `Permanecem as disposições não alteradas expressamente, as obrigações já vencidas e os direitos de terceiros. Não há novação, remissão, quitação, transferência de propriedade ou cessão de crédito implícita. A mudança de modalidade, partes ou poderes de representação exige instrumento apropriado e análise de seus efeitos, não bastando modificar uma etiqueta no CRM. O aditivo só altera a vontade contratual após aceite válido das partes; a atualização do cadastro deverá refletir o instrumento assinado e conservar a versão anterior.`
    );
  }

  if (modelo.id === 'prestacao_contas') {
    const resumo = calcularResumoFinanceiro(n);
    clausula(
      'Período, venda e base documental',
      `Período e corte: ${valor('periodoPrestacao')}. Venda registrada: ${n.vendaEfetivada ? `${dataBr(n.vendaEfetivada.data)}, por ${moeda(n.vendaEfetivada.precoCentavos)}, referência ${n.vendaEfetivada.evidenciaContrato}` : 'Não houve venda a terceiro registrada; a apuração refere-se à obrigação estimatória e aos movimentos existentes'}. Comprovantes que acompanham a prestação: ${valor('anexosComprovantes')}. Os registros são declarações dos operadores e devem ser conciliados com os documentos e extratos; o CRM não autentica compensação bancária.`
    );
    clausula(
      'Demonstrativo',
      `Preço de venda efetivada: ${n.vendaEfetivada ? moeda(resumo.valorVendaCentavos) : 'não houve venda registrada'}.\nRecebimentos registrados: ${moeda(resumo.recebidoCentavos)}.\nSaldo do comprador: ${n.vendaEfetivada ? moeda(resumo.aReceberCentavos) : 'não se aplica sem venda'}.\nRemuneração/resultados da loja: ${moeda(resumo.remuneracaoCentavos)}.\nDespesas efetivas registradas: ${moeda(resumo.despesasCentavos)}.\nTotal apurado ao proprietário: ${n.modalidade === 'intermediacao' ? 'o proprietário recebe diretamente o preço da venda; não há saldo de repasse devido pela loja' : moeda(resumo.devidoProprietarioCentavos)}.\nRepasses registrados: ${moeda(resumo.repassadoCentavos)}.\nSaldo ao proprietário: ${n.modalidade === 'intermediacao' ? 'não se aplica à loja nesta modalidade' : moeda(resumo.saldoRepasseCentavos)}.\n${n.modalidade === 'consignacao_estimatoria' ? 'No estimatório, o preço estimado é preservado: comissão e despesas não são descontadas automaticamente do valor devido ao consignante. O consignatário pode pagar o preço sem venda a terceiro, observadas as formalidades pertinentes.' : n.modalidade === 'intermediacao' ? 'Na intermediação, os valores são informativos para o negócio; este demonstrativo não autoriza a loja a receber ou repassar o preço do veículo. A remuneração e as despesas serão acertadas separadamente conforme contrato.' : 'Na comissão, a apuração considera remuneração contratada e apenas despesas efetivas autorizadas e comprovadas. O saldo final não significa que todo valor já esteja disponível antes dos recebimentos.'}`
    );
    clausula(
      'Movimentos e conferência',
      `Recebimentos:\n${n.recebimentos.length ? n.recebimentos.map(linhaMovimento).join('\n') : 'Nenhum recebimento registrado.'}\nRepasses:\n${n.repasses.length ? n.repasses.map(linhaMovimento).join('\n') : 'Nenhum repasse registrado.'}\nDespesas:\n${n.despesas.length ? n.despesas.map((item) => `${linhaMovimento(item)} Objeto: ${item.descricao}.`).join('\n') : 'Nenhuma despesa efetiva registrada.'}\nRessalvas e pendências: ${valor('observacoesContas')}. A assinatura atesta ciência do demonstrativo e das ressalvas expressas, sem quitação automática de saldos não recebidos, renúncia a erro comprovado ou novação. A quitação de pagamento deve identificar o movimento e ser confirmada por seu beneficiário.`
    );
  }

  if (modelo.id === 'recibo_repasse') {
    clausula(
      'Pagamento individualizado',
      `O PROPRIETÁRIO, ao assinar este recibo após conferir o efetivo crédito, declara receber da LOJA o pagamento registrado sob ${repasse ? linhaMovimento(repasse) : '[PENDENTE: repasse existente e comprovante]'}. Destino declarado: ${valor('contaRepasse')}. Obrigação a que se imputa o valor: ${valor('referenciaQuitacao')}. O comprovante deverá acompanhar a via do recibo. O simples cadastro de repasse ou emissão deste documento não comprova crédito bancário nem substitui a confirmação do beneficiário.`
    );
    clausula(
      'Quitação delimitada',
      `A quitação restringe-se ao valor efetivamente recebido e à obrigação identificada, até a extensão do pagamento, permanecendo saldos, divergências documentadas e demais obrigações não abrangidas. Não há quitação geral da negociação, renúncia a direitos de consumidor, liberação de vícios ocultos, cessão de crédito ou transferência do veículo. Se o pagamento for estornado, não compensado ou realizado a destinatário não autorizado, a obrigação permanece na medida do valor não recebido, observados os fatos e a lei. Este recibo de repasse financeiro é distinto do contrato de venda para revenda conhecido comercialmente como “repasse”.`
    );
  }

  if (modelo.id === 'devolucao') {
    const devolucao = n.devolucao;
    clausula(
      'Restituição da posse',
      `A loja restitui o veículo a ${valor('recebedorDevolucao')}, em ${devolucao ? dataBr(devolucao.data) : '[PENDENTE: evento de devolução]'}, no local e horário ${valor('localDevolucao')}. Hodômetro de saída: ${devolucao ? `${devolucao.km.toLocaleString('pt-BR')} km` : '[PENDENTE: quilometragem de saída]'}. Evidência do evento: ${devolucao?.evidencia || '[PENDENTE: evidência de devolução]'}. Itens restituídos: ${valor('documentosChaves')}. Quem recebe por terceiro deverá apresentar poderes suficientes; este termo não os cria.`
    );
    clausula(
      'Estado, ressalvas e saldo',
      `Vistoria de saída registrada: ${devolucao?.vistoria || '[PENDENTE: vistoria]'}. Confronto: ${valor('confrontoVistorias')}. Pendências do evento: ${devolucao?.pendencias || 'Nenhuma pendência descrita no evento; prevalecem as ressalvas deste instrumento.'}. Obrigações remanescentes: ${valor('saldoEncerramento')}. A entrega física não produz quitação financeira nem afasta responsabilidade por danos, itens faltantes, fatos anteriores, vícios ocultos ou direitos de terceiros. Na modalidade estimatória, somente a restituição integral e o atendimento das condições legais produzem os efeitos pertinentes; não se presume exoneração por impossibilidade de restituição.`
    );
    clausula(
      'Encerramento da guarda',
      `Após a restituição efetiva, encerra-se a guarda da loja, ressalvadas obrigações anteriores. A loja retirará anúncios e devolverá documentos, preservando apenas registros necessários à obrigação legal, à prestação de contas ou ao exercício regular de direitos. Se houve registro de intenção ou comunicação de venda, a regularização ou cancelamento deverá ser realizado no canal oficial cabível, com comprovação, sem reversão automática pelo CRM.`
    );
  }

  if (modelo.id === 'distrato') {
    clausula(
      'Extinção consensual e alcance',
      `As partes distratam o contrato ${valor('contratoVinculado')} da negociação ${n.id}, com efeitos em ${dataBr(campos.dataEncerramento ?? '')}. Motivos e condições: ${valor('motivoDistrato')}. A extinção é consensual e limitada ao vínculo entre os signatários; não desfaz automaticamente venda a terceiro, financiamento, gravame, comunicação de venda, lançamento tributário ou obrigação perante autoridade.`
    );
    clausula(
      'Veículo e acerto financeiro',
      `Destino do veículo, posse e documentos: ${valor('destinoVeiculo')}. Acerto financeiro: ${valor('acertoFinanceiro')}. Cada valor deverá indicar se foi efetivamente pago ou permanece obrigação futura, seu credor/devedor, vencimento e comprovação. Restituições não recebidas não se consideram quitadas. A entrega do veículo deverá ser documentada por termo e vistoria; eventual impossibilidade de restituição no estimatório será tratada conforme art. 535 do Código Civil, sem exoneração presumida.`
    );
    clausula(
      'Obrigações sobreviventes',
      `${valor('obrigacoesRemanescentes')}. A quitação, se houver, restringe-se às obrigações e valores expressamente identificados como satisfeitos e confirmados pelos respectivos credores. Permanecem direitos indisponíveis, garantias legais, responsabilidades por dolo, fraude, falsidade, vícios e direitos de terceiros. A atualização de status no CRM não substitui o aceite do distrato, a devolução física, os pagamentos nem a regularização nos órgãos competentes.`
    );
  }

  if (principal) {
    clausula(
      'Inadimplemento e solução de divergências',
      `A parte prejudicada comunicará o descumprimento por canal identificável, descrevendo a obrigação e oferecendo prazo razoável para solução quando compatível com o caso, sem condicionar direitos urgentes ou prazos legais. Não há multa contratual prefixada neste modelo. Encargos de mora e atualização observarão a legislação aplicável; na ausência de convenção válida ou lei específica, aplicam-se os arts. 389 e 406 do Código Civil, com a disciplina vigente da taxa legal, sem cumular indevidamente índices. Perdas e danos exigem fundamento e comprovação, vedada vantagem manifestamente excessiva. Resolução, retenção ou compensação dependerão de suporte legal e das circunstâncias; não há autorização de apreensão privada ou coação.`
    );
  }
  clausula(
    'Dados pessoais e comunicações',
    `Os dados necessários serão utilizados para negociar e executar o contrato, cumprir deveres legais e exercer direitos, conforme a base legal aplicável da LGPD, com acesso restrito e compartilhamento somente com participantes necessários, autoridades, profissionais e prestadores vinculados à finalidade. Contato para informações e direitos: ${valor('contatoPrivacidade')}. Os dados não ficam autorizados para marketing irrestrito. Cada responsável deverá informar sua atuação, limitar retenção ao período necessário e às hipóteses legais e adotar medidas de segurança. Comunicações devem permitir identificação de remetente, destinatário, conteúdo e data; mudança de conta de pagamento requer confirmação por canal seguro previamente conhecido.`
  );
  clausula(
    'Integração, foro e formalização',
    `As partes devem receber este texto e os anexos identificados, podendo esclarecer e ajustar as condições antes de assinar. Observações específicas cadastradas: ${texto(n.observacoes) || 'Não foram acrescentadas observações específicas.'} Anexos e condições adicionais não prevalecem sobre normas obrigatórias. Fica indicado o foro de ${n.condicoes.foro}${texto(campos.vinculoForo) ? `, vinculado a ${texto(campos.vinculoForo)}` : ''}, por sua pertinência com as partes ou a obrigação, ressalvadas competências legais e a proteção de acesso à Justiça do consumidor. Alterações exigem registro próprio e aceite; nenhuma assinatura é presumida pela emissão no sistema. Assinatura eletrônica será realizada por meio apto a comprovar autoria e integridade, com preservação de evidências; as exigências próprias dos órgãos de trânsito continuam aplicáveis. Eventual força executiva depende dos requisitos legais de certeza, liquidez, exigibilidade e forma; este instrumento não a garante automaticamente.`
  );

  const assinaturas = [
    `Vendedor/proprietário: ${n.vendedor.nome}\nCPF/CNPJ: ${n.vendedor.documento}\nAssinatura: ________________________________________`,
    `Loja: ${n.loja.nome}\nCPF/CNPJ: ${n.loja.documento}\nRepresentante: ${n.loja.representante || n.loja.nome}\nAssinatura: ________________________________________`,
    ...(incluiComprador
      ? [
          `Comprador: ${n.comprador.nome}\nCPF/CNPJ: ${n.comprador.documento}\n${pessoaJuridica(n.comprador) ? `Representante: ${n.comprador.representante}\n` : ''}Assinatura: ________________________________________`
        ]
      : [])
  ];
  const pendenciasUnicas = [...new Set(pendencias)];
  const aviso = pendenciasUnicas.length
    ? `MINUTA INCOMPLETA — NÃO UTILIZAR PARA ASSINATURA\nPendências: ${pendenciasUnicas.join(' ')}\n\n`
    : 'INSTRUMENTO GERADO PARA CONFERÊNCIA E ASSINATURA — EMISSÃO NÃO EQUIVALE A ASSINATURA\n\n';
  return {
    titulo: modelo.titulo,
    versaoModelo: VERSAO_MODELOS,
    pendencias: pendenciasUnicas,
    conteudo: `${aviso}${modelo.titulo.toUpperCase()}\nNegociação ${n.id} · versão de dados ${n.versao} · modelo ${VERSAO_MODELOS}\n\n${secoes.join('\n\n')}\n\n${n.condicoes.cidadeAssinatura}, ${dataBr(campos.dataDocumento ?? '')}.\n\n${assinaturas.join('\n\n')}\n\nTESTEMUNHAS — preencher quando utilizadas na formalização\n1. Nome: ________________________________________\nCPF: ________________________________________\nAssinatura: ________________________________________\n\n2. Nome: ________________________________________\nCPF: ________________________________________\nAssinatura: ________________________________________\n\nEm papel, a participação de duas testemunhas é relevante para a hipótese do art. 784, III, do CPC. Em meio eletrônico, eventual dispensa depende dos requisitos do art. 784, § 4º, inclusive integridade conferida por provedor de assinatura. Um hash ou registro interno, isoladamente, não comprova esses requisitos.\n`
  };
}
