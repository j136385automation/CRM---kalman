import { commandSchema, negociacaoSchema } from '../schemas/negociacao';
import { isCnpj, isValidDocumento } from './documento';
import type {
  DocumentoNegociacao,
  ModalidadeNegociacao,
  Negociacao,
  NegociacaoCommand,
  NegociacaoInput,
  NegociacaoSnapshot,
  ParteNegociacao,
  ResumoFinanceiro
} from '../api/types';

export class NegociacaoError extends Error {
  constructor(
    message: string,
    public readonly code = 'VALIDACAO'
  ) {
    super(message);
    this.name = 'NegociacaoError';
  }
}

export interface DomainContext {
  organizacaoId: string;
  autorId: string;
  agora: string;
  novoId: () => string;
}

export function isConsignacao(modalidade: ModalidadeNegociacao): boolean {
  return ['consignacao_estimatoria', 'comissao', 'intermediacao'].includes(modalidade);
}

export function isEncerrada(negociacao: Negociacao): boolean {
  return ['liquidada', 'devolvida', 'cancelada'].includes(negociacao.status);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new NegociacaoError(message);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .toSorted()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function assertContext(n: Negociacao, ctx: DomainContext): void {
  assert(n.organizacaoId === ctx.organizacaoId, 'Negociação não encontrada nesta empresa.');
}

function validateInput(input: unknown): NegociacaoInput {
  const result = negociacaoSchema.safeParse(input);
  if (!result.success) {
    throw new NegociacaoError(
      result.error.issues
        .slice(0, 5)
        .map((issue) => issue.message)
        .join(' ')
    );
  }
  return result.data;
}

export function validateParte(parte: ParteNegociacao, label: string): string[] {
  const missing: string[] = [];
  if (parte.nome.length < 3) missing.push(`${label}: informe o nome completo ou a razão social.`);
  if (!isValidDocumento(parte.documento))
    missing.push(`${label}: informe CPF/CNPJ formalmente válido.`);
  if (!parte.endereco || !parte.cidade || !parte.uf)
    missing.push(`${label}: complete endereço, cidade e UF.`);
  if (isCnpj(parte.documento) && !parte.representante)
    missing.push(`${label}: identifique o representante e seus poderes.`);
  return missing;
}

export function pendenciasAtivacao(n: NegociacaoInput): string[] {
  const missing = [
    ...validateParte(n.loja, 'Loja'),
    ...validateParte(n.vendedor, 'Vendedor/proprietário')
  ];
  if (
    !n.veiculo.placa ||
    !n.veiculo.chassi ||
    !n.veiculo.renavam ||
    !n.veiculo.cor ||
    !n.veiculo.combustivel
  ) {
    missing.push('Complete placa, chassi, Renavam, cor e combustível do veículo.');
  }
  if (!n.veiculo.restricoes || !n.veiculo.avarias || !n.veiculo.acessorios) {
    missing.push(
      'Declare restrições, avarias e acessórios; registre expressamente quando inexistentes.'
    );
  }
  if (!n.condicoes.cidadeAssinatura || !n.condicoes.foro)
    missing.push('Informe cidade de assinatura e foro pertinente.');
  if (isConsignacao(n.modalidade)) {
    if (!n.condicoes.dataInicio || !n.condicoes.dataFim)
      missing.push('Defina início e término da consignação/intermediação.');
    if (n.condicoes.precoMinimoCentavos <= 0 || n.condicoes.precoAnunciadoCentavos <= 0)
      missing.push('Defina preço anunciado e piso autorizado.');
    if (!n.condicoes.localGuarda || !n.condicoes.seguro)
      missing.push('Informe a guarda e a situação do seguro, inclusive quando inexistente.');
    if (n.modalidade === 'consignacao_estimatoria') {
      if (n.condicoes.precoEstimadoCentavos <= 0)
        missing.push('Defina o preço estimado devido ao proprietário.');
      if (n.condicoes.posse !== 'loja')
        missing.push(
          'A consignação estimatória exige entrega à loja; use intermediação quando o proprietário conserva a posse.'
        );
    }
    if (n.condicoes.despesasAutorizadasCentavos > 0 && !n.condicoes.despesasDescricao) {
      missing.push('Identifique a finalidade e o alcance das despesas autorizadas.');
    }
  }
  return missing;
}

export function pendenciasVenda(n: NegociacaoInput): string[] {
  const missing = [...pendenciasAtivacao(n), ...validateParte(n.comprador, 'Comprador')];
  if (n.venda.precoCentavos <= 0) missing.push('Informe preço de venda positivo.');
  if (!n.venda.formaPagamento || !n.venda.parcelas.length)
    missing.push('Informe forma de pagamento e cronograma, inclusive à vista.');
  if (!n.venda.dataEntrega || !n.venda.localEntrega)
    missing.push('Informe data e local previstos para entrega.');
  if (n.venda.precoCentavos < n.condicoes.precoMinimoCentavos)
    missing.push('O preço de venda está abaixo do piso autorizado.');
  if (
    n.modalidade === 'repasse_revenda' &&
    (!isCnpj(n.comprador.documento) || !n.venda.compradorRevendedor || !n.venda.finalidadeRevenda)
  ) {
    missing.push(
      'Repasse exige comprador com CNPJ, atividade comercial identificada e destinação para revenda; consumidor final utiliza compra e venda.'
    );
  }
  return missing;
}

export function calcularComissaoCentavos(valorCentavos: number, percentualBps: number): number {
  assert(Number.isSafeInteger(valorCentavos) && valorCentavos >= 0, 'Valor monetário inválido.');
  assert(
    Number.isInteger(percentualBps) && percentualBps >= 0 && percentualBps <= 10000,
    'Percentual inválido.'
  );
  return Number((BigInt(valorCentavos) * BigInt(percentualBps) + BigInt(5000)) / BigInt(10000));
}

export function calcularResumoFinanceiro(n: Negociacao): ResumoFinanceiro {
  const valorVendaCentavos = n.vendaEfetivada?.precoCentavos ?? n.venda.precoCentavos;
  const recebidoCentavos = n.recebimentos.reduce((sum, item) => sum + item.valorCentavos, 0);
  const repassadoCentavos = n.repasses.reduce((sum, item) => sum + item.valorCentavos, 0);
  const despesasCentavos = n.despesas.reduce((sum, item) => sum + item.valorCentavos, 0);
  const commission =
    n.condicoes.comissaoTipo === 'fixa'
      ? n.condicoes.comissaoFixaCentavos
      : calcularComissaoCentavos(valorVendaCentavos, n.condicoes.comissaoPercentualBps);
  let devidoProprietarioCentavos = 0;
  let remuneracaoCentavos = 0;
  if (n.modalidade === 'consignacao_estimatoria') {
    devidoProprietarioCentavos = ['ativa', 'vendida', 'liquidada'].includes(n.status)
      ? n.condicoes.precoEstimadoCentavos
      : 0;
    remuneracaoCentavos = n.vendaEfetivada
      ? valorVendaCentavos - n.condicoes.precoEstimadoCentavos - despesasCentavos
      : 0;
  } else if (n.modalidade === 'comissao' || n.modalidade === 'intermediacao') {
    remuneracaoCentavos = n.vendaEfetivada ? commission : 0;
    // Intermediação: the owner receives the price directly; the CRM does not presume a collection mandate.
    devidoProprietarioCentavos =
      n.modalidade === 'comissao' && n.vendaEfetivada
        ? valorVendaCentavos - commission - despesasCentavos
        : 0;
  }
  return {
    valorVendaCentavos,
    recebidoCentavos,
    aReceberCentavos: n.vendaEfetivada ? Math.max(0, valorVendaCentavos - recebidoCentavos) : 0,
    remuneracaoCentavos,
    despesasCentavos,
    devidoProprietarioCentavos,
    repassadoCentavos,
    saldoRepasseCentavos: Math.max(0, devidoProprietarioCentavos - repassadoCentavos)
  };
}

function touch(n: Negociacao, ctx: DomainContext, tipo: string, descricao: string): Negociacao {
  n.versao += 1;
  n.atualizadoEm = ctx.agora;
  n.eventos.push({
    id: ctx.novoId(),
    tipo,
    descricao,
    autorId: ctx.autorId,
    data: ctx.agora,
    versao: n.versao
  });
  return n;
}

export function createNegociacaoDomain(input: unknown, ctx: DomainContext): Negociacao {
  const data = validateInput(input);
  const n: Negociacao = {
    ...data,
    id: ctx.novoId(),
    organizacaoId: ctx.organizacaoId,
    versao: 0,
    status: 'rascunho',
    criadoEm: ctx.agora,
    atualizadoEm: ctx.agora,
    contratoReferencia: '',
    vendaEfetivada: null,
    recebimentos: [],
    repasses: [],
    despesas: [],
    devolucao: null,
    eventos: [],
    documentos: []
  };
  return touch(n, ctx, 'criada', 'Dossiê criado como rascunho.');
}

export function inputFromNegociacao(n: Negociacao): NegociacaoInput {
  return {
    modalidade: n.modalidade,
    loja: structuredClone(n.loja),
    vendedor: structuredClone(n.vendedor),
    comprador: structuredClone(n.comprador),
    veiculo: structuredClone(n.veiculo),
    condicoes: structuredClone(n.condicoes),
    venda: structuredClone(n.venda),
    observacoes: n.observacoes
  };
}

export function assertVersion(n: Negociacao, expectedVersion: number): void {
  if (n.versao !== expectedVersion) {
    throw new NegociacaoError(
      'Este dossiê foi alterado em outra sessão. Atualize a página antes de continuar.',
      'CONFLITO'
    );
  }
}

export function updateNegociacaoDomain(
  current: Negociacao,
  input: unknown,
  ctx: DomainContext
): Negociacao {
  assertContext(current, ctx);
  assert(
    ['rascunho', 'ativa'].includes(current.status),
    'Dossiês vendidos ou encerrados não podem ser editados.'
  );
  const data = validateInput(input);
  if (current.status === 'ativa') {
    for (const key of ['modalidade', 'loja', 'vendedor', 'veiculo', 'condicoes'] as const) {
      assert(
        canonical(data[key]) === canonical(current[key]),
        'Os termos da operação ativa estão preservados. Somente comprador, previsão de venda e observações podem ser atualizados.'
      );
    }
  }
  return touch(
    { ...structuredClone(current), ...data },
    ctx,
    'atualizada',
    'Cadastro atualizado; documentos já emitidos conservam seus dados originais.'
  );
}

function assertDateNotFuture(data: string, ctx: DomainContext): void {
  const now = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(ctx.agora));
  assert(data <= now, 'A data de uma operação efetiva não pode estar no futuro.');
}

export function applyNegociacaoCommand(
  current: Negociacao,
  command: unknown,
  ctx: DomainContext
): Negociacao {
  assertContext(current, ctx);
  const parsed = commandSchema.safeParse(command);
  if (!parsed.success)
    throw new NegociacaoError(
      parsed.error.issues
        .slice(0, 5)
        .map((issue) => issue.message)
        .join(' ')
    );
  const c: NegociacaoCommand = parsed.data;
  const n = structuredClone(current);
  assert(!isEncerrada(n), 'Esta negociação já foi encerrada.');
  if ('data' in c) assertDateNotFuture(c.data, ctx);
  if ('operacaoId' in c) {
    const previous = [...n.recebimentos, ...n.repasses, ...n.despesas].find(
      (item) => item.id === c.operacaoId
    );
    // A stale version is rejected by storage before this check. Reusing a key can never append twice.
    assert(
      !previous,
      'Esta operação financeira já foi registrada. Atualize o dossiê e consulte o histórico.'
    );
  }
  switch (c.tipo) {
    case 'ativar': {
      assert(n.status === 'rascunho', 'Somente rascunhos podem ser ativados.');
      assert(
        isConsignacao(n.modalidade),
        'Compra e venda e repasse a revendedor seguem diretamente para o registro da venda.'
      );
      const missing = pendenciasAtivacao(n);
      assert(!missing.length, missing.join(' '));
      n.status = 'ativa';
      n.contratoReferencia = c.contratoReferencia;
      return touch(
        n,
        ctx,
        c.tipo,
        'Operação ativada com referência documental informada pelo operador. A referência não constitui verificação de assinatura.'
      );
    }
    case 'aditar': {
      assert(
        n.status === 'ativa' && isConsignacao(n.modalidade),
        'Somente consignações/intermediações ativas e sem venda podem receber aditivo de condições.'
      );
      const updated = validateInput({ ...inputFromNegociacao(n), condicoes: c.condicoes });
      assert(
        updated.condicoes.dataInicio === n.condicoes.dataInicio,
        'O aditivo preserva a data original de início; altere apenas a vigência final.'
      );
      assert(
        updated.condicoes.posse === n.condicoes.posse,
        'Mudança de posse requer encerramento e novo instrumento; o aditivo comercial não registra entrega física.'
      );
      const finance = calcularResumoFinanceiro(n);
      if (n.modalidade === 'consignacao_estimatoria') {
        assert(
          updated.condicoes.precoEstimadoCentavos >= finance.repassadoCentavos,
          'O novo preço estimado não pode ser inferior ao valor já pago ao proprietário.'
        );
      }
      assert(
        updated.condicoes.despesasAutorizadasCentavos >= finance.despesasCentavos,
        'O novo limite não pode ser inferior às despesas efetivas já registradas.'
      );
      const missing = pendenciasAtivacao(updated);
      assert(!missing.length, missing.join(' '));
      const previous = structuredClone(n.condicoes);
      n.condicoes = updated.condicoes;
      touch(
        n,
        ctx,
        c.tipo,
        'Condições atualizadas conforme referência de aditivo informada pelo operador. A emissão de uma minuta, por si só, não altera o contrato.'
      );
      n.eventos[n.eventos.length - 1].dados = {
        referenciaAditivo: c.referenciaAditivo,
        condicoesAnteriores: previous,
        condicoesNovas: structuredClone(n.condicoes)
      };
      return n;
    }
    case 'vender': {
      assert(
        n.status === 'ativa' || (n.status === 'rascunho' && !isConsignacao(n.modalidade)),
        'Ative a consignação antes de registrar a venda.'
      );
      assert(!n.vendaEfetivada, 'A venda já está registrada.');
      const missing = pendenciasVenda(n);
      assert(!missing.length, missing.join(' '));
      if (isConsignacao(n.modalidade)) {
        assert(
          c.data >= n.condicoes.dataInicio && c.data <= n.condicoes.dataFim,
          'A venda deve estar dentro do prazo contratual registrado. Regularize o instrumento antes de registrar venda fora do prazo.'
        );
      }
      if (n.modalidade === 'comissao' || n.modalidade === 'intermediacao') {
        const commission =
          n.condicoes.comissaoTipo === 'fixa'
            ? n.condicoes.comissaoFixaCentavos
            : calcularComissaoCentavos(n.venda.precoCentavos, n.condicoes.comissaoPercentualBps);
        assert(
          commission + calcularResumoFinanceiro(n).despesasCentavos <= n.venda.precoCentavos,
          'Comissão e despesas não podem superar o preço de venda.'
        );
      }
      n.vendaEfetivada = {
        data: c.data,
        precoCentavos: n.venda.precoCentavos,
        evidenciaContrato: c.evidenciaContrato,
        registradaPor: ctx.autorId,
        registradaEm: ctx.agora
      };
      n.status = 'vendida';
      return touch(
        n,
        ctx,
        c.tipo,
        'Venda registrada; recebimentos e repasses permanecem separados e dependem de comprovantes.'
      );
    }
    case 'registrar_recebimento': {
      assert(n.status === 'vendida' && n.vendaEfetivada, 'Registre a venda antes do recebimento.');
      assert(
        c.data >= n.vendaEfetivada.data,
        'O recebimento não pode anteceder a venda registrada.'
      );
      const finance = calcularResumoFinanceiro(n);
      assert(
        c.valorCentavos <= finance.aReceberCentavos,
        'O valor supera o saldo a receber do comprador.'
      );
      n.recebimentos.push({
        id: c.operacaoId,
        data: c.data,
        valorCentavos: c.valorCentavos,
        comprovante: c.comprovante,
        registradoPor: ctx.autorId,
        registradoEm: ctx.agora
      });
      return touch(
        n,
        ctx,
        c.tipo,
        n.modalidade === 'intermediacao'
          ? 'Recebimento pelo vendedor registrado conforme comprovante informado; nenhuma cobrança ou transferência foi executada pelo CRM.'
          : 'Recebimento registrado conforme comprovante informado; nenhuma cobrança bancária foi executada pelo CRM.'
      );
    }
    case 'registrar_repasse': {
      assert(
        ['consignacao_estimatoria', 'comissao'].includes(n.modalidade),
        'Repasse financeiro é aplicável à consignação estimatória ou comissão; intermediação não presume poderes para receber o preço.'
      );
      assert(['ativa', 'vendida'].includes(n.status), 'Ative a operação antes do repasse.');
      assert(c.data >= n.condicoes.dataInicio, 'O repasse não pode anteceder o início contratual.');
      const finance = calcularResumoFinanceiro(n);
      if (n.modalidade === 'comissao') {
        assert(
          n.status === 'vendida' && finance.aReceberCentavos === 0,
          'Na comissão, confirme o recebimento integral do comprador antes do repasse.'
        );
      }
      assert(
        c.valorCentavos <= finance.saldoRepasseCentavos,
        'O repasse supera o saldo devido ao proprietário.'
      );
      n.repasses.push({
        id: c.operacaoId,
        data: c.data,
        valorCentavos: c.valorCentavos,
        comprovante: c.comprovante,
        registradoPor: ctx.autorId,
        registradoEm: ctx.agora
      });
      return touch(
        n,
        ctx,
        c.tipo,
        'Pagamento ao proprietário registrado conforme comprovante; nenhuma transferência bancária foi executada pelo CRM.'
      );
    }
    case 'registrar_despesa': {
      assert(
        ['ativa', 'vendida'].includes(n.status),
        'Ative a operação antes de registrar despesas.'
      );
      assert(
        isConsignacao(n.modalidade),
        'Despesas de consignação requerem modalidade correspondente.'
      );
      const finance = calcularResumoFinanceiro(n);
      assert(
        finance.despesasCentavos + c.valorCentavos <= n.condicoes.despesasAutorizadasCentavos,
        'A despesa supera o limite de autorização registrado.'
      );
      if (n.modalidade === 'comissao' && n.vendaEfetivada) {
        assert(
          finance.devidoProprietarioCentavos - c.valorCentavos >= finance.repassadoCentavos,
          'A despesa excede o saldo disponível ou reduziria valor já repassado.'
        );
      }
      n.despesas.push({
        id: c.operacaoId,
        data: c.data,
        valorCentavos: c.valorCentavos,
        comprovante: c.comprovante,
        descricao: c.descricao,
        registradoPor: ctx.autorId,
        registradoEm: ctx.agora
      });
      return touch(
        n,
        ctx,
        c.tipo,
        'Despesa efetiva e comprovada registrada dentro do limite autorizado.'
      );
    }
    case 'devolver': {
      assert(
        n.status === 'ativa' && isConsignacao(n.modalidade),
        'A devolução exige consignação ativa e sem venda.'
      );
      assert(
        n.repasses.length === 0 && n.recebimentos.length === 0,
        'Há valores movimentados: regularize o acerto antes da devolução; a devolução não cria estorno automático.'
      );
      assert(
        c.data >= n.condicoes.dataInicio,
        'A devolução não pode anteceder o recebimento contratual.'
      );
      assert(
        c.km >= n.veiculo.km,
        'A quilometragem de devolução não pode ser menor que a de entrada.'
      );
      n.devolucao = {
        data: c.data,
        km: c.km,
        vistoria: c.vistoria,
        pendencias: c.pendencias,
        evidencia: c.evidencia
      };
      n.status = 'devolvida';
      return touch(
        n,
        ctx,
        c.tipo,
        'Veículo devolvido com vistoria e pendências registradas. O encerramento operacional não gera quitação geral.'
      );
    }
    case 'encerrar': {
      const finance = calcularResumoFinanceiro(n);
      const paidEstimatedPrice =
        n.modalidade === 'consignacao_estimatoria' &&
        n.status === 'ativa' &&
        finance.devidoProprietarioCentavos > 0 &&
        finance.saldoRepasseCentavos === 0;
      assert(
        n.status === 'vendida' || paidEstimatedPrice,
        'Registre a venda ou o pagamento integral do preço estimado antes de liquidar.'
      );
      assert(finance.aReceberCentavos === 0, 'Ainda há saldo a receber do comprador.');
      assert(finance.saldoRepasseCentavos === 0, 'Ainda há saldo a pagar ao proprietário.');
      n.status = 'liquidada';
      return touch(n, ctx, c.tipo, `Liquidação operacional registrada: ${c.observacoes}`);
    }
    case 'cancelar': {
      assert(
        !n.vendaEfetivada && !n.recebimentos.length && !n.repasses.length,
        'Negociação com venda ou valores recebidos/pagos requer acerto; não pode ser cancelada diretamente.'
      );
      assert(
        n.despesas.length === 0 ||
          (n.modalidade === 'intermediacao' && n.condicoes.posse === 'proprietario'),
        'Despesas registradas exigem acerto e devolução documentada; esta operação não pode ser cancelada diretamente.'
      );
      assert(
        n.status === 'rascunho' || n.condicoes.posse === 'proprietario',
        'O veículo está sob guarda da loja; registre a devolução com vistoria.'
      );
      n.status = 'cancelada';
      return touch(
        n,
        ctx,
        c.tipo,
        `Cancelamento registrado: ${c.motivo}. Despesas e demais obrigações permanecem ressalvadas; o cancelamento não representa quitação.`
      );
    }
  }
}

export function snapshotNegociacao(n: Negociacao): NegociacaoSnapshot {
  const { documentos: _documentos, eventos: _eventos, ...snapshot } = n;
  return structuredClone(snapshot);
}

export function appendDocumentoDomain(
  current: Negociacao,
  documento: DocumentoNegociacao,
  ctx: DomainContext
): Negociacao {
  assertContext(current, ctx);
  assert(documento.negociacaoId === current.id, 'Documento pertence a outra negociação.');
  const n = structuredClone(current);
  n.documentos.push(structuredClone(documento));
  return touch(
    n,
    ctx,
    'documento_emitido',
    `${documento.status === 'minuta' ? 'Minuta' : 'Documento para assinatura'} gerado: ${documento.titulo}. Versão anterior preservada.`
  );
}
