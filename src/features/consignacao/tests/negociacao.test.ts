import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { isValidDocumento, normalizarDocumento } from '../domain/documento';
import {
  appendDocumentoDomain,
  applyNegociacaoCommand,
  assertVersion,
  calcularComissaoCentavos,
  calcularResumoFinanceiro,
  createNegociacaoDomain,
  pendenciasVenda,
  snapshotNegociacao,
  updateNegociacaoDomain
} from '../domain/negociacao';
import { negociacaoSchema } from '../schemas/negociacao';
import type {
  DocumentoNegociacao,
  ModalidadeNegociacao,
  Negociacao,
  NegociacaoCommand
} from '../api/types';
import { context, fixtureInput } from './fixtures';
import { resolveStorageMode } from '../domain/storage-mode';

function active(modalidade: ModalidadeNegociacao = 'consignacao_estimatoria'): Negociacao {
  return applyNegociacaoCommand(
    createNegociacaoDomain(fixtureInput(modalidade), context()),
    { tipo: 'ativar', contratoReferencia: 'Contrato externo TESTE-01' },
    context()
  );
}

function sold(modalidade: ModalidadeNegociacao = 'consignacao_estimatoria'): Negociacao {
  return applyNegociacaoCommand(
    active(modalidade),
    { tipo: 'vender', data: '2026-10-29', evidenciaContrato: 'Instrumento de venda TESTE-02' },
    context()
  );
}

function movement(
  tipo: 'registrar_recebimento' | 'registrar_repasse',
  valorCentavos: number
): NegociacaoCommand {
  return {
    tipo,
    operacaoId: randomUUID(),
    data: '2026-10-29',
    valorCentavos,
    comprovante: 'Comprovante fictício TESTE-03'
  };
}

function reverseKeys(value: unknown): unknown {
  return Array.isArray(value)
    ? value.map(reverseKeys)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.entries(value)
            .toReversed()
            .map(([key, nested]) => [key, reverseKeys(nested)])
        )
      : value;
}

test('production cannot fall back to demo even when the demo flag is set', () => {
  for (const nodeEnv of ['production', 'test', undefined]) {
    assert.equal(
      resolveStorageMode({ nodeEnv, databaseConfigured: false, demoEnabled: true }),
      'unconfigured'
    );
  }
  assert.equal(
    resolveStorageMode({ nodeEnv: 'development', databaseConfigured: false, demoEnabled: false }),
    'unconfigured'
  );
  assert.equal(
    resolveStorageMode({ nodeEnv: 'development', databaseConfigured: false, demoEnabled: true }),
    'demo'
  );
  assert.equal(
    resolveStorageMode({ nodeEnv: 'production', databaseConfigured: true, demoEnabled: true }),
    'postgres'
  );
});

test('CPF and numeric/alphanumeric CNPJ validate check digits without dropping letters', () => {
  assert.equal(isValidDocumento('529.982.247-25'), true);
  assert.equal(isValidDocumento('11.222.333/0001-81'), true);
  assert.equal(isValidDocumento('12.ABC.345/01DE-35'), true);
  assert.equal(normalizarDocumento('12.abc.345/01de-35'), '12ABC34501DE35');
  for (const invalid of [
    '00000000000',
    '00000000000000',
    '52998224724',
    '12ABC34501DE36',
    '12!BC34501DE35'
  ]) {
    assert.equal(isValidDocumento(invalid), false, invalid);
  }
});

test('draft validates integer cents, real dates and forbids forged tenant/status fields', () => {
  const input = fixtureInput();
  assert.equal(negociacaoSchema.safeParse(input).success, true);
  assert.equal(negociacaoSchema.safeParse({ ...input, organizacaoId: 'attacker' }).success, false);
  assert.equal(negociacaoSchema.safeParse({ ...input, status: 'liquidada' }).success, false);
  input.condicoes.precoMinimoCentavos = 1.5;
  assert.equal(negociacaoSchema.safeParse(input).success, false);
  input.condicoes.precoMinimoCentavos = 9_000_000;
  input.condicoes.dataInicio = '2026-02-30';
  assert.equal(negociacaoSchema.safeParse(input).success, false);
});

test('payment schedule must total exact sale price before storing draft', () => {
  const input = fixtureInput();
  input.venda.parcelas[0].valorCentavos -= 1;
  assert.throws(() => createNegociacaoDomain(input, context()), /parcelas devem totalizar/);
});

test('activation refuses incomplete legal identification and retains draft unchanged', () => {
  const input = fixtureInput();
  input.vendedor.documento = '';
  const draft = createNegociacaoDomain(input, context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        draft,
        { tipo: 'ativar', contratoReferencia: 'Referência TESTE' },
        context()
      ),
    /CPF\/CNPJ/
  );
  assert.equal(draft.status, 'rascunho');
  assert.equal(draft.versao, 1);
});

test('estimatory contract requires delivery; simple intermediation is separately supported', () => {
  const input = fixtureInput();
  input.condicoes.posse = 'proprietario';
  const draft = createNegociacaoDomain(input, context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        draft,
        { tipo: 'ativar', contratoReferencia: 'Referência TESTE' },
        context()
      ),
    /exige entrega/
  );
  assert.equal(active('intermediacao').status, 'ativa');
});

test('sale below agreed floor is rejected even when buyer, document and instalments are valid', () => {
  let n = active();
  const input = fixtureInput();
  input.venda.precoCentavos = 8_999_999;
  input.venda.parcelas[0].valorCentavos = input.venda.precoCentavos;
  n = updateNegociacaoDomain(n, input, context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        { tipo: 'vender', data: '2026-10-29', evidenciaContrato: 'Contrato TESTE' },
        context()
      ),
    /piso autorizado/
  );
});

test('repasse to reseller requires actual business purpose; it cannot relabel a consumer sale', () => {
  const input = fixtureInput('repasse_revenda');
  input.venda.compradorRevendedor = false;
  input.venda.finalidadeRevenda = '';
  assert.ok(pendenciasVenda(input).some((message) => message.includes('consumidor final')));
  const n = createNegociacaoDomain(input, context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        { tipo: 'vender', data: '2026-10-29', evidenciaContrato: 'Contrato TESTE' },
        context()
      ),
    /Repasse exige/
  );
});

test('reseller declaration alone cannot classify a CPF buyer as a business repasse', () => {
  const input = fixtureInput('repasse_revenda');
  input.comprador.documento = '11144477735';
  const draft = createNegociacaoDomain(input, context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        draft,
        { tipo: 'vender', data: '2026-10-29', evidenciaContrato: 'Contrato TESTE' },
        context()
      ),
    /comprador com CNPJ/
  );
});

test('estimated price is payable before a sale or customer payment and can discharge contract', () => {
  let n = active();
  assert.equal(calcularResumoFinanceiro(n).devidoProprietarioCentavos, 8_000_000);
  n = applyNegociacaoCommand(n, movement('registrar_repasse', 8_000_000), context());
  n = applyNegociacaoCommand(
    n,
    { tipo: 'encerrar', observacoes: 'Preço estimado integralmente pago pela própria loja.' },
    context()
  );
  assert.equal(n.status, 'liquidada');
  assert.equal(n.vendaEfetivada, null);
  assert.equal(n.recebimentos.length, 0);
  assert.equal(calcularResumoFinanceiro(n).saldoRepasseCentavos, 0);
});

test('authorized expense budget never reduces owner settlement without an actual expense', () => {
  const n = sold('comissao');
  const finance = calcularResumoFinanceiro(n);
  assert.equal(n.condicoes.despesasAutorizadasCentavos, 100_000);
  assert.equal(finance.despesasCentavos, 0);
  assert.equal(finance.remuneracaoCentavos, 500_000);
  assert.equal(finance.devidoProprietarioCentavos, 9_500_000);
});

test('actual expenses reduce commission settlement but never the guaranteed estimated price', () => {
  for (const modalidade of ['consignacao_estimatoria', 'comissao'] as const) {
    const n = applyNegociacaoCommand(
      sold(modalidade),
      {
        tipo: 'registrar_despesa',
        operacaoId: randomUUID(),
        data: '2026-10-29',
        valorCentavos: 25_000,
        comprovante: 'Nota fiscal TESTE',
        descricao: 'Lavagem autorizada e realizada'
      },
      context()
    );
    assert.equal(calcularResumoFinanceiro(n).despesasCentavos, 25_000);
    assert.equal(
      calcularResumoFinanceiro(n).devidoProprietarioCentavos,
      modalidade === 'consignacao_estimatoria' ? 8_000_000 : 9_475_000
    );
  }
});

test('expense over authorization ceiling is rejected without mutation', () => {
  const n = active('comissao');
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        {
          tipo: 'registrar_despesa',
          operacaoId: randomUUID(),
          data: '2026-10-29',
          valorCentavos: 100_001,
          comprovante: 'Nota fiscal TESTE',
          descricao: 'Reparo'
        },
        context()
      ),
    /limite de autorização/
  );
  assert.equal(n.despesas.length, 0);
});

test('partial customer payment cannot authorize commission payout or full settlement', () => {
  const n = applyNegociacaoCommand(
    sold('comissao'),
    movement('registrar_recebimento', 1_000_000),
    context()
  );
  assert.throws(
    () => applyNegociacaoCommand(n, movement('registrar_repasse', 1), context()),
    /recebimento integral/
  );
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        { tipo: 'encerrar', observacoes: 'Tentativa de liquidar' },
        context()
      ),
    /saldo a receber/
  );
  assert.equal(calcularResumoFinanceiro(n).aReceberCentavos, 9_000_000);
});

test('overpayment, duplicate financial operation and payout above debt are all rejected', () => {
  let n = sold('comissao');
  assert.throws(
    () => applyNegociacaoCommand(n, movement('registrar_recebimento', 10_000_001), context()),
    /supera o saldo/
  );
  const receipt = movement('registrar_recebimento', 10_000_000);
  n = applyNegociacaoCommand(n, receipt, context());
  assert.throws(() => applyNegociacaoCommand(n, receipt, context()), /já foi registrada/);
  assert.throws(
    () => applyNegociacaoCommand(n, movement('registrar_repasse', 9_500_001), context()),
    /supera o saldo/
  );
  n = applyNegociacaoCommand(n, movement('registrar_repasse', 9_500_000), context());
  n = applyNegociacaoCommand(
    n,
    { tipo: 'encerrar', observacoes: 'Valores registrados integralmente.' },
    context()
  );
  assert.equal(n.status, 'liquidada');
});

test('expense cannot retroactively consume money already paid to the owner', () => {
  let n = applyNegociacaoCommand(
    sold('comissao'),
    movement('registrar_recebimento', 10_000_000),
    context()
  );
  n = applyNegociacaoCommand(n, movement('registrar_repasse', 9_500_000), context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        {
          tipo: 'registrar_despesa',
          operacaoId: randomUUID(),
          data: '2026-10-29',
          valorCentavos: 100,
          comprovante: 'Nota TESTE',
          descricao: 'Despesa tardia'
        },
        context()
      ),
    /valor já repassado/
  );
});

test('intermediation never presumes power to receive and transfer owner money', () => {
  const n = sold('intermediacao');
  assert.equal(calcularResumoFinanceiro(n).devidoProprietarioCentavos, 0);
  assert.throws(
    () => applyNegociacaoCommand(n, movement('registrar_repasse', 1000), context()),
    /não presume poderes/
  );
});

test('vehicle return preserves condition evidence and cannot replace a sold transaction', () => {
  const command = {
    tipo: 'devolver',
    data: '2026-10-29',
    km: 40010,
    vistoria: 'Conforme entrada e fotos TESTE',
    pendencias: 'Nenhuma pendência identificada',
    evidencia: 'Termo físico TESTE'
  } as const;
  const n = applyNegociacaoCommand(active(), command, context());
  assert.equal(n.status, 'devolvida');
  assert.equal(n.devolucao?.km, 40010);
  assert.throws(() => applyNegociacaoCommand(sold(), command, context()), /sem venda/);
  assert.throws(
    () => applyNegociacaoCommand(active(), { ...command, km: 39999 }, context()),
    /quilometragem/
  );
  assert.throws(
    () =>
      applyNegociacaoCommand(active(), { tipo: 'cancelar', motivo: 'Não quer vender' }, context()),
    /registre a devolução/
  );
});

test('paid owner money cannot be erased through return or cancellation', () => {
  const n = applyNegociacaoCommand(active(), movement('registrar_repasse', 100), context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        {
          tipo: 'devolver',
          data: '2026-10-29',
          km: 40000,
          vistoria: 'Sem alteração',
          pendencias: 'Acerto pendente',
          evidencia: 'Termo TESTE'
        },
        context()
      ),
    /Há valores movimentados/
  );
  assert.throws(
    () => applyNegociacaoCommand(n, { tipo: 'cancelar', motivo: 'Tentativa cancelar' }, context()),
    /não pode ser cancelada/
  );
});

test('active records allow buyer/planned sale edits after JSONB key reordering but preserve terms', () => {
  const n = reverseKeys(active()) as Negociacao;
  const input = fixtureInput();
  input.comprador.nome = 'Nova Pessoa Compradora Fictícia';
  assert.equal(updateNegociacaoDomain(n, input, context()).comprador.nome, input.comprador.nome);
  input.condicoes.precoEstimadoCentavos -= 1;
  assert.throws(() => updateNegociacaoDomain(n, input, context()), /termos da operação ativa/);
});

test('commission uses exact integer half-up rounding even at the safe-integer boundary', () => {
  assert.equal(calcularComissaoCentavos(101, 5000), 51);
  assert.equal(calcularComissaoCentavos(100_000_000_000, 3333), 33_330_000_000);
  assert.equal(calcularComissaoCentavos(Number.MAX_SAFE_INTEGER, 10000), Number.MAX_SAFE_INTEGER);
  assert.equal(calcularComissaoCentavos(Number.MAX_SAFE_INTEGER, 5000), 4_503_599_627_370_496);
});

test('amendment can extend an active agreement and retains exact previous and new terms', () => {
  const n = active();
  const nextTerms = { ...n.condicoes, dataFim: '2027-01-31', precoAnunciadoCentavos: 11_000_000 };
  const updated = applyNegociacaoCommand(
    n,
    {
      tipo: 'aditar',
      referenciaAditivo: 'Aditivo assinado externo TESTE-04',
      condicoes: nextTerms
    },
    context()
  );
  assert.equal(updated.condicoes.dataFim, '2027-01-31');
  const event = updated.eventos.at(-1);
  assert.deepEqual(event?.dados?.condicoesAnteriores, n.condicoes);
  assert.deepEqual(event?.dados?.condicoesNovas, nextTerms);
  assert.equal(event?.dados?.referenciaAditivo, 'Aditivo assinado externo TESTE-04');
  assert.equal(n.condicoes.dataFim, '2026-12-31');
});

test('amendment cannot reduce owner debt below money paid or expense cap below incurred cost', () => {
  let n = applyNegociacaoCommand(active(), movement('registrar_repasse', 7_000_000), context());
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        {
          tipo: 'aditar',
          referenciaAditivo: 'Aditivo TESTE',
          condicoes: { ...n.condicoes, precoEstimadoCentavos: 6_000_000 }
        },
        context()
      ),
    /inferior ao valor já pago/
  );
  n = applyNegociacaoCommand(
    n,
    {
      tipo: 'registrar_despesa',
      operacaoId: randomUUID(),
      data: '2026-10-29',
      valorCentavos: 10_000,
      comprovante: 'Nota TESTE',
      descricao: 'Lavagem'
    },
    context()
  );
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        {
          tipo: 'aditar',
          referenciaAditivo: 'Aditivo TESTE',
          condicoes: { ...n.condicoes, despesasAutorizadasCentavos: 9_999 }
        },
        context()
      ),
    /despesas efetivas/
  );
});

test('intermediation with incurred expenses can close without inventing a physical return or erasing debt', () => {
  let n = active('intermediacao');
  n = applyNegociacaoCommand(
    n,
    {
      tipo: 'registrar_despesa',
      operacaoId: randomUUID(),
      data: '2026-10-29',
      valorCentavos: 10_000,
      comprovante: 'Nota TESTE',
      descricao: 'Publicidade aprovada'
    },
    context()
  );
  n = applyNegociacaoCommand(
    n,
    {
      tipo: 'cancelar',
      motivo:
        'Proprietário retirou oferta. Despesa de publicidade permanece a acertar conforme documento.'
    },
    context()
  );
  assert.equal(n.status, 'cancelada');
  assert.equal(n.devolucao, null);
  assert.equal(n.despesas[0].valorCentavos, 10_000);
  assert.match(n.eventos.at(-1)?.descricao ?? '', /não representa quitação/);
});

test('direct sales cannot enter an inappropriate consignment activation state', () => {
  for (const modalidade of ['compra_venda', 'repasse_revenda'] as const) {
    const n = createNegociacaoDomain(fixtureInput(modalidade), context());
    assert.throws(
      () =>
        applyNegociacaoCommand(
          n,
          { tipo: 'ativar', contratoReferencia: 'Contrato TESTE' },
          context()
        ),
      /diretamente para o registro/
    );
    assert.equal(
      applyNegociacaoCommand(
        n,
        { tipo: 'vender', data: '2026-10-29', evidenciaContrato: 'Contrato TESTE' },
        context()
      ).status,
      'vendida'
    );
  }
});

test('version and organization guards prevent stale and cross-tenant writes', () => {
  const n = active();
  assert.throws(() => assertVersion(n, 1), /outra sessão/);
  assert.throws(
    () => updateNegociacaoDomain(n, fixtureInput(), context('org_other')),
    /nesta empresa/
  );
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        { tipo: 'vender', data: '2026-10-29', evidenciaContrato: 'Contrato TESTE' },
        context('org_other')
      ),
    /nesta empresa/
  );
});

test('dates for actual financial events use Brazil date, not UTC date or future promises', () => {
  const n = sold();
  const ctx = { ...context(), agora: '2026-10-30T01:00:00.000Z' }; // 22:00 on the 29th in São Paulo.
  assert.throws(
    () =>
      applyNegociacaoCommand(
        n,
        { ...movement('registrar_recebimento', 100), data: '2026-10-30' },
        ctx
      ),
    /no futuro/
  );
});

test('issued document data survives subsequent draft changes and neither object shares references', () => {
  const n = createNegociacaoDomain(fixtureInput(), context());
  const document: DocumentoNegociacao = {
    id: randomUUID(),
    negociacaoId: n.id,
    modeloId: 'consignacao_estimatoria',
    versaoModelo: 'test',
    titulo: 'Contrato de teste',
    conteudo: 'Conteúdo imutável',
    sha256: 'test',
    status: 'minuta',
    emitidoEm: context().agora,
    emitidoPor: 'user_test',
    campos: {},
    pendencias: [],
    snapshot: snapshotNegociacao(n)
  };
  const withDoc = appendDocumentoDomain(n, document, context());
  const input = fixtureInput();
  input.vendedor.nome = 'Nome alterado depois da emissão';
  const updated = updateNegociacaoDomain(withDoc, input, context());
  assert.equal(updated.documentos[0].snapshot.vendedor.nome, 'Pessoa Vendedora Fictícia');
  assert.equal(updated.vendedor.nome, input.vendedor.nome);
  document.snapshot.vendedor.nome = 'Mutação externa';
  assert.equal(withDoc.documentos[0].snapshot.vendedor.nome, 'Pessoa Vendedora Fictícia');
  assert.equal(n.documentos.length, 0);
});
