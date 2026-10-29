import 'server-only';
import { Pool, type PoolClient } from 'pg';
import { assertVersion, NegociacaoError, snapshotNegociacao } from '../domain/negociacao';
import { resolveStorageMode } from '../domain/storage-mode';
import type {
  DocumentoNegociacao,
  EventoNegociacao,
  Negociacao,
  NegociacaoSnapshot
} from '../api/types';

interface AggregateRow {
  payload: NegociacaoSnapshot;
  version: number;
}

interface JsonRow<T> {
  payload: T;
}

declare global {
  var kalmanConsignacaoPool: Pool | undefined;
  var kalmanConsignacaoDemo: Map<string, Map<string, Negociacao>> | undefined;
}

export function storageMode(): 'postgres' | 'demo' | 'unconfigured' {
  return resolveStorageMode({
    nodeEnv: process.env.NODE_ENV,
    databaseConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    demoEnabled: process.env.CONSIGNACAO_DEMO === 'true'
  });
}

export const CONFIGURATION_MESSAGE =
  'O armazenamento de negociações ainda não foi configurado. Configure DATABASE_URL e aplique a migração de consignações antes de cadastrar dados reais.';

function requireStorage(): 'postgres' | 'demo' {
  const mode = storageMode();
  if (mode === 'unconfigured') throw new NegociacaoError(CONFIGURATION_MESSAGE, 'CONFIGURACAO');
  return mode;
}

function pool(): Pool {
  if (!globalThis.kalmanConsignacaoPool) {
    globalThis.kalmanConsignacaoPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      statement_timeout: 15000,
      application_name: 'kalman-consignacao'
    });
    // Idle connection failures must not crash the process or expose connection strings.
    globalThis.kalmanConsignacaoPool.on('error', () => {
      console.error('Falha em conexão ociosa do armazenamento de negociações.');
    });
  }
  return globalThis.kalmanConsignacaoPool;
}

async function transaction<T>(
  orgId: string,
  fn: (client: PoolClient) => Promise<T>,
  readOnly = false
): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query(readOnly ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN');
    await client.query("SELECT set_config('app.organization_id', $1, true)", [orgId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

function demoStore(orgId: string): Map<string, Negociacao> {
  globalThis.kalmanConsignacaoDemo ??= new Map();
  let records = globalThis.kalmanConsignacaoDemo.get(orgId);
  if (!records) {
    records = new Map();
    globalThis.kalmanConsignacaoDemo.set(orgId, records);
  }
  return records;
}

function notFound(): never {
  throw new NegociacaoError('Negociação não encontrada nesta empresa.', 'NAO_ENCONTRADA');
}

async function hydrate(client: PoolClient, orgId: string, row: AggregateRow): Promise<Negociacao> {
  const id = row.payload.id;
  const docs = await client.query<JsonRow<DocumentoNegociacao>>(
    'SELECT payload FROM kalman_negociacao_documentos WHERE organization_id = $1 AND negotiation_id = $2 ORDER BY issued_at, id',
    [orgId, id]
  );
  const events = await client.query<JsonRow<EventoNegociacao>>(
    'SELECT payload FROM kalman_negociacao_eventos WHERE organization_id = $1 AND negotiation_id = $2 ORDER BY version, id',
    [orgId, id]
  );
  return {
    ...row.payload,
    versao: row.version,
    documentos: docs.rows.map((item) => item.payload),
    eventos: events.rows.map((item) => item.payload)
  };
}

async function insertHistory(
  client: PoolClient,
  n: Negociacao,
  previous?: Negociacao
): Promise<void> {
  const oldDocIds = new Set(previous?.documentos.map((item) => item.id));
  const oldEventIds = new Set(previous?.eventos.map((item) => item.id));
  for (const doc of n.documentos.filter((item) => !oldDocIds.has(item.id))) {
    await client.query(
      'INSERT INTO kalman_negociacao_documentos (organization_id, negotiation_id, id, issued_at, payload) VALUES ($1, $2, $3, $4, $5::jsonb)',
      [n.organizacaoId, n.id, doc.id, doc.emitidoEm, JSON.stringify(doc)]
    );
  }
  for (const event of n.eventos.filter((item) => !oldEventIds.has(item.id))) {
    await client.query(
      'INSERT INTO kalman_negociacao_eventos (organization_id, negotiation_id, id, version, payload) VALUES ($1, $2, $3, $4, $5::jsonb)',
      [n.organizacaoId, n.id, event.id, event.versao, JSON.stringify(event)]
    );
  }
}

function assertNoActiveDuplicate(records: Iterable<Negociacao>, next: Negociacao): void {
  if (!['ativa', 'vendida'].includes(next.status)) return;
  for (const existing of records) {
    if (existing.id === next.id || !['ativa', 'vendida'].includes(existing.status)) continue;
    if (
      (next.veiculo.placa && existing.veiculo.placa === next.veiculo.placa) ||
      (next.veiculo.chassi && existing.veiculo.chassi === next.veiculo.chassi)
    ) {
      throw new NegociacaoError(
        'Já existe uma operação ativa para esta placa ou chassi nesta empresa.',
        'CONFLITO'
      );
    }
  }
}

export async function listStoredNegociacoes(orgId: string): Promise<Negociacao[]> {
  if (requireStorage() === 'demo')
    return structuredClone(
      [...demoStore(orgId).values()].toSorted((a, b) =>
        b.atualizadoEm.localeCompare(a.atualizadoEm)
      )
    );
  return transaction(
    orgId,
    async (client) => {
      const rows = await client.query<AggregateRow>(
        'SELECT payload, version FROM kalman_negociacoes WHERE organization_id = $1 ORDER BY updated_at DESC',
        [orgId]
      );
      const docs = await client.query<JsonRow<DocumentoNegociacao> & { negotiation_id: string }>(
        'SELECT negotiation_id, payload FROM kalman_negociacao_documentos WHERE organization_id = $1 ORDER BY issued_at, id',
        [orgId]
      );
      const events = await client.query<JsonRow<EventoNegociacao> & { negotiation_id: string }>(
        'SELECT negotiation_id, payload FROM kalman_negociacao_eventos WHERE organization_id = $1 ORDER BY version, id',
        [orgId]
      );
      const documentMap = new Map<string, DocumentoNegociacao[]>();
      const eventMap = new Map<string, EventoNegociacao[]>();
      for (const row of docs.rows)
        documentMap.set(row.negotiation_id, [
          ...(documentMap.get(row.negotiation_id) ?? []),
          row.payload
        ]);
      for (const row of events.rows)
        eventMap.set(row.negotiation_id, [
          ...(eventMap.get(row.negotiation_id) ?? []),
          row.payload
        ]);
      return rows.rows.map((row) => ({
        ...row.payload,
        versao: row.version,
        documentos: documentMap.get(row.payload.id) ?? [],
        eventos: eventMap.get(row.payload.id) ?? []
      }));
    },
    true
  );
}

export async function getStoredNegociacao(orgId: string, id: string): Promise<Negociacao> {
  if (requireStorage() === 'demo') {
    const n = demoStore(orgId).get(id);
    return n ? structuredClone(n) : notFound();
  }
  return transaction(
    orgId,
    async (client) => {
      const result = await client.query<AggregateRow>(
        'SELECT payload, version FROM kalman_negociacoes WHERE organization_id = $1 AND id = $2',
        [orgId, id]
      );
      if (!result.rows[0]) return notFound();
      return hydrate(client, orgId, result.rows[0]);
    },
    true
  );
}

export async function insertStoredNegociacao(n: Negociacao): Promise<Negociacao> {
  if (requireStorage() === 'demo') {
    demoStore(n.organizacaoId).set(n.id, structuredClone(n));
    return structuredClone(n);
  }
  return transaction(n.organizacaoId, async (client) => {
    await client.query(
      'INSERT INTO kalman_negociacoes (organization_id, id, version, payload, created_at, updated_at) VALUES ($1, $2, $3, $4::jsonb, $5, $6)',
      [
        n.organizacaoId,
        n.id,
        n.versao,
        JSON.stringify(snapshotNegociacao(n)),
        n.criadoEm,
        n.atualizadoEm
      ]
    );
    await insertHistory(client, n);
    return n;
  });
}

/** Transformer is synchronous: demo updates are atomic in one JS turn, PostgreSQL uses a row lock. */
export async function mutateStoredNegociacao(
  orgId: string,
  id: string,
  expectedVersion: number,
  transform: (current: Negociacao) => Negociacao
): Promise<Negociacao> {
  if (requireStorage() === 'demo') {
    const records = demoStore(orgId);
    const current = records.get(id);
    if (!current) return notFound();
    assertVersion(current, expectedVersion);
    const next = transform(structuredClone(current));
    assertNoActiveDuplicate(records.values(), next);
    records.set(id, structuredClone(next));
    return structuredClone(next);
  }
  return transaction(orgId, async (client) => {
    const result = await client.query<AggregateRow>(
      'SELECT payload, version FROM kalman_negociacoes WHERE organization_id = $1 AND id = $2 FOR UPDATE',
      [orgId, id]
    );
    if (!result.rows[0]) return notFound();
    assertVersion({ versao: result.rows[0].version } as Negociacao, expectedVersion);
    const current = await hydrate(client, orgId, result.rows[0]);
    const next = transform(current);
    await client.query(
      'UPDATE kalman_negociacoes SET version = $3, payload = $4::jsonb, updated_at = $5 WHERE organization_id = $1 AND id = $2',
      [orgId, id, next.versao, JSON.stringify(snapshotNegociacao(next)), next.atualizadoEm]
    );
    await insertHistory(client, next, current);
    return next;
  });
}
