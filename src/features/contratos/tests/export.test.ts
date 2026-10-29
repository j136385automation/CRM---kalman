import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import {
  createNegociacaoDomain,
  snapshotNegociacao
} from '@/features/consignacao/domain/negociacao';
import { context, fixtureInput } from '@/features/consignacao/tests/fixtures';
import type { DocumentoNegociacao } from '@/features/consignacao/api/types';
import { documentoHtml, escapeHtml } from '../lib/export';

function documentFixture(): DocumentoNegociacao {
  const n = createNegociacaoDomain(fixtureInput(), context());
  const conteudo = 'VENDEDOR: <script>alert("x")</script>\nPreço: R$ 10.000,00 & parcelas.';
  return {
    id: 'document-test',
    negociacaoId: n.id,
    modeloId: 'compra_venda',
    versaoModelo: 'test-1',
    titulo: 'Contrato <exemplo>',
    conteudo,
    sha256: createHash('sha256').update(conteudo).digest('hex'),
    status: 'emitido',
    emitidoEm: '2026-10-29T15:00:00Z',
    emitidoPor: 'user_test',
    campos: {},
    pendencias: [],
    snapshot: snapshotNegociacao(n)
  };
}

test('export HTML escapes personal fields and cannot execute user-provided markup', () => {
  const html = documentoHtml(documentFixture());
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<exemplo>'));
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(html, /default-src 'none'/);
  assert.match(html, /Preço: R\$ 10\.000,00 &amp; parcelas/);
});

test('export clearly distinguishes issuance from signature and includes immutable identity', () => {
  const document = documentFixture();
  const html = documentoHtml(document);
  assert.match(html, /AGUARDANDO ASSINATURA/);
  assert.ok(html.includes(document.sha256));
  assert.match(html, /Versão do cadastro 1/);
  assert.match(html, /@page\{size:A4/);
});

test('draft export preserves pending items without creating a seemingly final document', () => {
  const document = documentFixture();
  document.status = 'minuta';
  document.pendencias = ['Complete <nome> & CPF.'];
  const html = documentoHtml(document);
  assert.match(html, /MINUTA — NÃO ASSINADA/);
  assert.match(html, /Complete &lt;nome&gt; &amp; CPF/);
});

test('HTML escape handles all attribute delimiters', () => {
  assert.equal(escapeHtml('<>&"\''), '&lt;&gt;&amp;&quot;&#39;');
});
