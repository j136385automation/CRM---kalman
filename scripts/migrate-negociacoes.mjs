import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString?.trim()) {
  console.error('Configure MIGRATION_DATABASE_URL ou DATABASE_URL no ambiente do servidor.');
  process.exitCode = 1;
} else {
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000, statement_timeout: 60000 });
  try {
    const migration = await readFile(new URL('../migrations/001_negociacoes.sql', import.meta.url), 'utf8');
    await client.connect();
    await client.query(migration);
    console.info('Migração de negociações aplicada. Configure a role de aplicação conforme a documentação.');
  } catch {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Não foi possível aplicar a migração. Verifique conexão, permissões e a configuração do banco.');
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}
