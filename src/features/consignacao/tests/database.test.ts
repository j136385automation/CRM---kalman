import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  applyNegociacaoCommand,
  createNegociacaoDomain,
  snapshotNegociacao
} from '../domain/negociacao';
import { context, fixtureInput } from './fixtures';
import type { Negociacao } from '../api/types';

interface TestDatabase {
  exec: (sql: string) => Promise<unknown>;
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
  close: () => Promise<void>;
}

/** Optional integration suite: PostgreSQL-compatible PGlite, or an isolated TEST_DATABASE_URL. */
async function openTestDatabase(): Promise<TestDatabase> {
  if (process.env.PGLITE_MODULE_PATH) {
    const pglitePackage = (await import(process.env.PGLITE_MODULE_PATH)) as {
      PGlite: new () => TestDatabase;
    };
    return new pglitePackage.PGlite();
  }
  const { Client } = await import('pg');
  const client = new Client({ connectionString: process.env.TEST_DATABASE_URL });
  await client.connect();
  return {
    exec: (sql) => client.query(sql),
    query: async (sql, params) => client.query(sql, params),
    close: () => client.end()
  };
}

function sqlCode(code: string): (error: unknown) => boolean {
  return (error) =>
    Boolean(error && typeof error === 'object' && 'code' in error && error.code === code);
}

async function insert(db: TestDatabase, n: Negociacao): Promise<void> {
  await db.query(
    'INSERT INTO kalman_negociacoes (organization_id,id,version,payload,created_at,updated_at) VALUES ($1,$2,$3,$4::jsonb,$5,$6)',
    [
      n.organizacaoId,
      n.id,
      n.versao,
      JSON.stringify(snapshotNegociacao(n)),
      n.criadoEm,
      n.atualizadoEm
    ]
  );
}

test(
  'database migration enforces tenant isolation, immutable history, vehicle uniqueness and atomic rollback',
  {
    skip:
      !process.env.PGLITE_MODULE_PATH && !process.env.TEST_DATABASE_URL
        ? 'Configure PGLITE_MODULE_PATH or an isolated TEST_DATABASE_URL to run PostgreSQL integration checks.'
        : false
  },
  async () => {
    const db = await openTestDatabase();
    // Names contain only this generated safe hex string; no caller-controlled SQL identifiers.
    const suffix = randomUUID().replaceAll('-', '');
    const schema = `kalman_test_${suffix}`;
    const role = `kalman_role_${suffix}`;
    try {
      await db.exec(`CREATE SCHEMA ${schema}; SET search_path TO ${schema};`);
      const migration = await readFile(
        path.resolve(process.cwd(), 'migrations/001_negociacoes.sql'),
        'utf8'
      );
      await db.exec(migration);
      await db.exec(
        `CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS; GRANT USAGE ON SCHEMA ${schema} TO ${role}; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schema} TO ${role}; SET ROLE ${role};`
      );

      await db.query("SELECT set_config('app.organization_id', $1, false)", ['org_a']);
      const n = createNegociacaoDomain(fixtureInput(), context('org_a'));
      await insert(db, n);
      const found = await db.query('SELECT id FROM kalman_negociacoes');
      assert.equal(found.rows.length, 1);

      await db.query("SELECT set_config('app.organization_id', $1, false)", ['org_b']);
      assert.equal((await db.query('SELECT id FROM kalman_negociacoes')).rows.length, 0);
      assert.equal(
        (
          await db.query(
            'UPDATE kalman_negociacoes SET updated_at = now() WHERE id=$1 RETURNING id',
            [n.id]
          )
        ).rows.length,
        0
      );
      await assert.rejects(
        () => insert(db, createNegociacaoDomain(fixtureInput(), context('org_a'))),
        sqlCode('42501')
      );

      // A matching plate in a different organization is allowed and invisible to org_a.
      const otherOrg = applyNegociacaoCommand(
        createNegociacaoDomain(fixtureInput(), context('org_b')),
        { tipo: 'ativar', contratoReferencia: 'Contrato TESTE' },
        context('org_b')
      );
      await insert(db, otherOrg);
      await db.query("SELECT set_config('app.organization_id', $1, false)", ['org_a']);
      assert.equal((await db.query('SELECT id FROM kalman_negociacoes')).rows.length, 1);

      const active = applyNegociacaoCommand(
        n,
        { tipo: 'ativar', contratoReferencia: 'Contrato TESTE' },
        context('org_a')
      );
      await db.query('UPDATE kalman_negociacoes SET version=$2, payload=$3::jsonb WHERE id=$1', [
        n.id,
        active.versao,
        JSON.stringify(snapshotNegociacao(active))
      ]);
      const duplicate = applyNegociacaoCommand(
        createNegociacaoDomain(fixtureInput(), context('org_a')),
        { tipo: 'ativar', contratoReferencia: 'Contrato TESTE' },
        context('org_a')
      );
      await assert.rejects(() => insert(db, duplicate), sqlCode('23505'));

      // Both client-supplied organization and id mismatches are rejected by database constraints.
      await assert.rejects(
        () =>
          db.query(
            "UPDATE kalman_negociacoes SET payload=jsonb_set(payload,'{organizacaoId}','\"org_b\"') WHERE id=$1",
            [n.id]
          ),
        sqlCode('23514')
      );

      const docId = randomUUID();
      const doc = {
        id: docId,
        negociacaoId: n.id,
        status: 'emitido',
        snapshot: snapshotNegociacao(active),
        conteudo: 'Documento de teste imutável'
      };
      await db.query(
        'INSERT INTO kalman_negociacao_documentos (organization_id,negotiation_id,id,issued_at,payload) VALUES ($1,$2,$3,$4,$5::jsonb)',
        ['org_a', n.id, docId, context().agora, JSON.stringify(doc)]
      );
      await assert.rejects(
        () =>
          db.query('UPDATE kalman_negociacao_documentos SET payload=payload WHERE id=$1', [docId]),
        sqlCode('55000')
      );
      await assert.rejects(
        () => db.query('DELETE FROM kalman_negociacao_documentos WHERE id=$1', [docId]),
        sqlCode('55000')
      );

      const event = active.eventos.at(-1)!;
      await db.query(
        'INSERT INTO kalman_negociacao_eventos (organization_id,negotiation_id,id,version,payload) VALUES ($1,$2,$3,$4,$5::jsonb)',
        ['org_a', n.id, event.id, event.versao, JSON.stringify(event)]
      );
      await assert.rejects(
        () => db.query('DELETE FROM kalman_negociacao_eventos WHERE id=$1', [event.id]),
        sqlCode('55000')
      );
      await assert.rejects(
        () =>
          db.query('UPDATE kalman_negociacao_eventos SET payload=payload WHERE id=$1', [event.id]),
        sqlCode('55000')
      );

      await db.query("SELECT set_config('app.organization_id', $1, false)", ['org_b']);
      assert.equal((await db.query('SELECT id FROM kalman_negociacao_documentos')).rows.length, 0);
      assert.equal((await db.query('SELECT id FROM kalman_negociacao_eventos')).rows.length, 0);
      await db.query("SELECT set_config('app.organization_id', $1, false)", ['org_a']);

      const before = await db.query('SELECT version FROM kalman_negociacoes WHERE id=$1', [n.id]);
      await db.exec('BEGIN');
      const modified = { ...snapshotNegociacao(active), versao: active.versao + 1 };
      await db.query('UPDATE kalman_negociacoes SET version=$2,payload=$3::jsonb WHERE id=$1', [
        n.id,
        modified.versao,
        JSON.stringify(modified)
      ]);
      await assert.rejects(
        () =>
          db.query(
            'INSERT INTO kalman_negociacao_eventos (organization_id,negotiation_id,id,version,payload) VALUES ($1,$2,$3,$4,$5::jsonb)',
            ['org_a', n.id, event.id, event.versao, JSON.stringify(event)]
          ),
        sqlCode('23505')
      );
      await db.exec('ROLLBACK');
      assert.deepEqual(
        (await db.query('SELECT version FROM kalman_negociacoes WHERE id=$1', [n.id])).rows,
        before.rows
      );
    } finally {
      await db.exec('ROLLBACK').catch(() => undefined);
      await db.exec('RESET ROLE').catch(() => undefined);
      await db.exec(`DROP SCHEMA IF EXISTS ${schema} CASCADE`).catch(() => undefined);
      await db.exec(`DROP ROLE IF EXISTS ${role}`).catch(() => undefined);
      await db.close();
    }
  }
);
