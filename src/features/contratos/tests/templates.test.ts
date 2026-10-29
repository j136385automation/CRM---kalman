import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyNegociacaoInput } from '@/features/consignacao/api/defaults';
import type {
  CamposDocumento,
  ModalidadeNegociacao,
  Negociacao
} from '@/features/consignacao/api/types';
import { createNegociacaoDomain } from '@/features/consignacao/domain/negociacao';
import { context, fixtureInput } from '@/features/consignacao/tests/fixtures';
import { MODELOS_DOCUMENTO, renderDocumento, type ModeloDocumentoId } from '../lib/templates';

function negociacao(modalidade: ModalidadeNegociacao = 'consignacao_estimatoria'): Negociacao {
  const input = fixtureInput(modalidade);
  input.vendedor.email = 'vendedor@example.invalid';
  input.comprador.email = 'comprador@example.invalid';
  if (modalidade === 'repasse_revenda') {
    input.comprador.documento = '04.252.011/0001-10';
    input.comprador.nome = 'Revenda Compradora Fictícia';
    input.comprador.representante = 'Representante fictício com poderes no contrato social';
  }
  return createNegociacaoDomain(input, context());
}

function camposPara(id: ModeloDocumentoId): CamposDocumento {
  const modelo = MODELOS_DOCUMENTO.find((item) => item.id === id)!;
  const campos: CamposDocumento = {};
  for (const campo of modelo.campos) {
    if (campo.obrigatorio)
      campos[campo.chave] =
        campo.tipo === 'date'
          ? '2026-10-29'
          : `Informação fictícia específica de teste: ${campo.rotulo}`;
  }
  campos.poderesRepresentacao =
    'Contrato social da loja, conferido somente neste cenário de teste.';
  return campos;
}

function comVenda(n: Negociacao): Negociacao {
  n.status = 'vendida';
  n.vendaEfetivada = {
    data: '2026-10-29',
    precoCentavos: n.venda.precoCentavos,
    evidenciaContrato: 'contrato-ficticio-1',
    registradaPor: 'user_test',
    registradaEm: '2026-10-29T15:00:00Z'
  };
  return n;
}

function comRepasse(n: Negociacao): Negociacao {
  n.repasses.push({
    id: 'repasse-teste',
    valorCentavos: 50_000,
    data: '2026-10-29',
    comprovante: 'comprovante-ficticio-1',
    registradoPor: 'user_test',
    registradoEm: '2026-10-29T15:00:00Z'
  });
  return n;
}

test('todos os doze modelos produzem instrumentos preenchidos sem marcadores pendentes quando completos', () => {
  assert.equal(MODELOS_DOCUMENTO.length, 12);
  assert.equal(new Set(MODELOS_DOCUMENTO.map((item) => item.id)).size, 12);
  for (const modelo of MODELOS_DOCUMENTO) {
    const n = negociacao(
      modelo.id === 'compra_venda' ||
        modelo.id === 'repasse_revenda' ||
        modelo.id === 'comissao' ||
        modelo.id === 'intermediacao'
        ? modelo.id
        : 'consignacao_estimatoria'
    );
    const campos = camposPara(modelo.id);
    if (modelo.id === 'prestacao_contas') comVenda(n);
    if (modelo.id === 'recibo_repasse') {
      n.status = 'ativa';
      comRepasse(n);
      campos.repasseId = 'repasse-teste';
    }
    if (modelo.id === 'devolucao') {
      n.status = 'devolvida';
      n.devolucao = {
        data: '2026-10-29',
        km: 40020,
        vistoria: 'Vistoria fictícia de saída',
        pendencias: 'Sem pendência conhecida neste teste',
        evidencia: 'termo-ficticio'
      };
    }
    const resultado = renderDocumento(n, modelo.id, campos);
    assert.deepEqual(resultado.pendencias, [], modelo.id);
    assert.doesNotMatch(resultado.conteudo, /\[PENDENTE|undefined|NaN/, modelo.id);
    assert.match(resultado.conteudo, /Pessoa Vendedora Fictícia/);
    assert.match(resultado.conteudo, /9BWZZZ377VT004251/);
    assert.match(resultado.conteudo, /EMISSÃO NÃO EQUIVALE A ASSINATURA/);
    assert.ok(
      resultado.conteudo.length > 4000,
      `${modelo.id} deve ter instrumento substancial, não apenas cabeçalhos`
    );
  }
});

test('cadastro vazio gera minuta com pendências acionáveis sem impedir prévia', () => {
  const n = { ...negociacao(), ...emptyNegociacaoInput() };
  const resultado = renderDocumento(n, 'consignacao_estimatoria', {});
  assert.ok(resultado.pendencias.length > 10);
  assert.match(resultado.conteudo, /MINUTA INCOMPLETA/);
  assert.ok(resultado.pendencias.some((item) => item.includes('CPF ou CNPJ')));
  assert.ok(resultado.pendencias.some((item) => item.includes('preço estimado')));
});

test('modelo incompatível e CPF com dígitos incorretos impedem emissão', () => {
  const n = negociacao();
  n.vendedor.documento = '52998224724';
  const resultado = renderDocumento(n, 'comissao', camposPara('comissao'));
  assert.ok(resultado.pendencias.some((item) => item.includes('não se aplica')));
  assert.ok(resultado.pendencias.some((item) => item.includes('formalmente válido')));
});

test('compra e venda pode partir de consignação com vendedor loja e proprietário participante', () => {
  for (const modalidade of ['consignacao_estimatoria', 'comissao'] as const) {
    const n = negociacao(modalidade);
    n.status = 'ativa';
    const resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
    assert.deepEqual(resultado.pendencias, []);
    assert.match(resultado.conteudo, /LOJA\/VENDEDORA EM NOME PRÓPRIO/);
    assert.match(resultado.conteudo, /com participação do PROPRIETÁRIO\/CONSIGNANTE/);
  }
});

test('contrato de venda secundário respeita piso autorizado, inclusive no repasse para revenda', () => {
  for (const modelo of ['compra_venda', 'repasse_revenda'] as const) {
    const n = negociacao();
    n.status = 'ativa';
    n.comprador = negociacao('repasse_revenda').comprador;
    n.venda.compradorRevendedor = true;
    n.venda.finalidadeRevenda = 'Estoque para revenda profissional';
    n.venda.precoCentavos = n.condicoes.precoMinimoCentavos - 1;
    n.venda.parcelas[0].valorCentavos = n.venda.precoCentavos;
    let resultado = renderDocumento(n, modelo, camposPara(modelo));
    assert.ok(resultado.pendencias.some((item) => item.includes('abaixo do piso autorizado')));
    assert.match(resultado.conteudo, /MINUTA INCOMPLETA/);
    n.condicoes.precoMinimoCentavos = n.venda.precoCentavos;
    resultado = renderDocumento(n, modelo, camposPara(modelo));
    assert.deepEqual(resultado.pendencias, []);
  }
});

test('encerramento bloqueia nova venda sem afetar conteúdo de documento já preservado', () => {
  const n = negociacao();
  n.status = 'ativa';
  const original = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
  assert.deepEqual(original.pendencias, []);
  const conteudoOriginal = original.conteudo;
  for (const status of ['devolvida', 'cancelada', 'liquidada'] as const) {
    n.status = status;
    const resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
    assert.ok(
      resultado.pendencias.some((item) => /devolvida ou cancelada|liquidada sem venda/.test(item))
    );
    assert.equal(original.conteudo, conteudoOriginal);
  }
});

test('venda secundária exige ativação e vigência válida sem confundir formalização posterior com nova venda', () => {
  const n = negociacao();
  let resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
  assert.ok(resultado.pendencias.some((item) => item.includes('Ative a consignação')));
  n.status = 'ativa';
  n.condicoes.dataFim = '2026-10-15';
  resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
  assert.ok(resultado.pendencias.some((item) => item.includes('vigência da operação')));
  comVenda(n);
  n.vendaEfetivada!.data = '2026-10-10';
  n.status = 'liquidada';
  resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
  assert.deepEqual(resultado.pendencias, []);
  assert.match(resultado.conteudo, /venda já registrada em 10\/10\/2026/);
  assert.match(resultado.conteudo, /não cria nova venda ou comprova assinatura anterior/);
  n.venda.precoCentavos -= 100;
  n.venda.parcelas[0].valorCentavos -= 100;
  resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
  assert.ok(resultado.pendencias.some((item) => item.includes('difere da venda efetivada')));
});

test('endereço completo permite contrato sem email ou telefone das partes, evitando bloqueio após ativação', () => {
  const n = negociacao();
  n.vendedor.email = '';
  n.vendedor.telefone = '';
  const resultado = renderDocumento(
    n,
    'consignacao_estimatoria',
    camposPara('consignacao_estimatoria')
  );
  assert.deepEqual(resultado.pendencias, []);
  assert.match(resultado.conteudo, /e-mail não cadastrado/);
});

test('repasse de revenda exige pessoa jurídica e destinação explícita, e conserva direitos obrigatórios', () => {
  const n = negociacao('compra_venda');
  let resultado = renderDocumento(n, 'repasse_revenda', camposPara('repasse_revenda'));
  assert.ok(resultado.pendencias.some((item) => item.includes('pessoa jurídica')));
  assert.ok(resultado.pendencias.some((item) => item.includes('adquire para revenda')));
  const revenda = negociacao('repasse_revenda');
  resultado = renderDocumento(revenda, 'repasse_revenda', camposPara('repasse_revenda'));
  assert.deepEqual(resultado.pendencias, []);
  assert.match(resultado.conteudo, /não afastam automaticamente o Código de Defesa do Consumidor/);
  assert.match(resultado.conteudo, /vícios redibitórios e evicção/);
});

test('estimátorio não permite posse do proprietário e mantém a obrigação por impossibilidade de devolução', () => {
  const n = negociacao();
  n.condicoes.posse = 'proprietario';
  const resultado = renderDocumento(
    n,
    'consignacao_estimatoria',
    camposPara('consignacao_estimatoria')
  );
  assert.ok(resultado.pendencias.some((item) => item.includes('exige entrega à loja')));
  assert.match(resultado.conteudo, /ainda que o fato não seja imputável/);
  assert.match(resultado.conteudo, /sem dedução automática de comissão/);
});

test('documento de venda rejeita parcelas inconsistentes e comprador ausente', () => {
  const n = negociacao('compra_venda');
  n.venda.parcelas[0].valorCentavos -= 1;
  n.comprador.nome = '';
  const resultado = renderDocumento(n, 'compra_venda', camposPara('compra_venda'));
  assert.ok(resultado.pendencias.some((item) => item.includes('soma das parcelas')));
  assert.ok(resultado.pendencias.some((item) => item.includes('nome/razão social de Comprador')));
});

test('recibo exige um movimento real e nunca aceita valor alegado em campo livre', () => {
  const n = negociacao();
  n.status = 'ativa';
  const campos = {
    ...camposPara('recibo_repasse'),
    repasseId: 'inexistente',
    valorPago: '80000',
    pago: 'sim'
  };
  const resultado = renderDocumento(n, 'recibo_repasse', campos);
  assert.ok(resultado.pendencias.some((item) => item.includes('repasse financeiro existente')));
  assert.match(resultado.conteudo, /MINUTA INCOMPLETA/);
});

test('pagamento do preço estimado sem venda pode ser documentado sem criar uma venda fictícia', () => {
  const n = comRepasse(negociacao());
  n.status = 'ativa';
  const recibo = renderDocumento(n, 'recibo_repasse', {
    ...camposPara('recibo_repasse'),
    repasseId: 'repasse-teste'
  });
  assert.deepEqual(recibo.pendencias, []);
  assert.match(recibo.conteudo.replace(/\s/g, ' '), /R\$ 500,00/);
  const contas = renderDocumento(n, 'prestacao_contas', camposPara('prestacao_contas'));
  assert.deepEqual(contas.pendencias, []);
  assert.match(contas.conteudo, /Não houve venda a terceiro registrada/);
  assert.doesNotMatch(contas.conteudo, /\[PENDENTE/);
  assert.equal(n.vendaEfetivada, null);
});

test('prestação de contas deduz despesas realizadas e preserva teto como autorização', () => {
  const n = comVenda(negociacao('comissao'));
  n.despesas.push({
    id: 'despesa-real',
    data: '2026-10-29',
    valorCentavos: 10_000,
    comprovante: 'nota-ficticia',
    descricao: 'Lavagem autorizada',
    registradoPor: 'user_test',
    registradoEm: '2026-10-29T15:00:00Z'
  });
  const resultado = renderDocumento(n, 'prestacao_contas', camposPara('prestacao_contas'));
  assert.deepEqual(resultado.pendencias, []);
  const conteudo = resultado.conteudo.replace(/\s/g, ' ');
  assert.match(conteudo, /Despesas efetivas registradas: R\$ 100,00/);
  assert.match(conteudo, /Total apurado ao proprietário: R\$ 94\.900,00/);
  assert.match(conteudo, /nota-ficticia/);
});

test('intermediação não apresenta repasse zero como inexistência da obrigação do comprador', () => {
  const n = comVenda(negociacao('intermediacao'));
  const resultado = renderDocumento(n, 'prestacao_contas', camposPara('prestacao_contas'));
  assert.deepEqual(resultado.pendencias, []);
  assert.match(resultado.conteudo, /o proprietário recebe diretamente o preço da venda/);
  assert.match(resultado.conteudo, /Saldo do comprador:/);
  const recibo = renderDocumento(n, 'recibo_repasse', camposPara('recibo_repasse'));
  assert.ok(recibo.pendencias.some((item) => item.includes('não se aplica')));
});

test('devolução precisa de evento próprio e não pode ser antecipada pela data do termo', () => {
  const n = negociacao();
  let resultado = renderDocumento(n, 'devolucao', camposPara('devolucao'));
  assert.ok(resultado.pendencias.some((item) => item.includes('Registre a devolução')));
  n.devolucao = {
    data: '2026-10-29',
    km: 40010,
    vistoria: 'Saída fictícia',
    pendencias: 'Reparo pendente',
    evidencia: 'comprovante-saida'
  };
  resultado = renderDocumento(n, 'devolucao', {
    ...camposPara('devolucao'),
    dataDocumento: '2026-10-28'
  });
  assert.ok(resultado.pendencias.some((item) => item.includes('não pode anteceder a devolução')));
});

test('datas impossíveis e foro sem pertinência exigem correção antes de emitir', () => {
  const n = negociacao();
  n.condicoes.foro = 'Manaus/AM';
  const resultado = renderDocumento(n, 'consignacao_estimatoria', {
    ...camposPara('consignacao_estimatoria'),
    dataDocumento: '2026-02-31'
  });
  assert.ok(resultado.pendencias.some((item) => item.includes('data válida')));
  assert.ok(resultado.pendencias.some((item) => item.includes('vinculoForo')));
});

test('aditivo de compra e venda exige e inclui o comprador do instrumento original', () => {
  const n = negociacao('compra_venda');
  let resultado = renderDocumento(n, 'aditivo', camposPara('aditivo'));
  assert.deepEqual(resultado.pendencias, []);
  assert.match(resultado.conteudo, /COMPRADOR: Pessoa Compradora Fictícia/);
  n.comprador.documento = '';
  resultado = renderDocumento(n, 'aditivo', camposPara('aditivo'));
  assert.ok(resultado.pendencias.some((item) => item.includes('Comprador')));
});

test('aditivo de consignação não altera silenciosamente a venda secundária sem o comprador', () => {
  const n = comVenda(negociacao());
  const resultado = renderDocumento(n, 'aditivo', camposPara('aditivo'));
  assert.deepEqual(resultado.pendencias, []);
  assert.match(resultado.conteudo, /limita-se ao contrato principal entre proprietário e loja/);
  assert.match(resultado.conteudo, /participação expressa do comprador/);
});

test('renderização preserva os dados e não afirma assinatura, emissão oficial ou taxa legal fixa', () => {
  const n = negociacao('compra_venda');
  const campos = camposPara('compra_venda');
  const antes = structuredClone({ n, campos });
  const resultado = renderDocumento(n, 'compra_venda', campos);
  assert.deepEqual({ n, campos }, antes);
  assert.match(resultado.conteudo, /não substitui ATPV/);
  assert.match(resultado.conteudo, /arts\. 389 e 406/);
  assert.doesNotMatch(
    resultado.conteudo,
    /juros de 1%|juridicamente blindado|assinatura verificada/i
  );
  assert.match(resultado.conteudo, /Um hash ou registro interno, isoladamente, não comprova/);
  assert.throws(
    () => renderDocumento(n, 'crlv_ficticio', campos),
    /Modelo de documento não encontrado/
  );
});
