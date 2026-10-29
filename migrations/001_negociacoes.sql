-- Apply with the application's dedicated PostgreSQL role on its own database.
-- DATABASE_URL is a server secret. The application never runs migrations implicitly.
BEGIN;

CREATE TABLE IF NOT EXISTS kalman_negociacoes (
  organization_id text NOT NULL,
  id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (organization_id, id),
  CHECK (payload->>'organizacaoId' = organization_id),
  CHECK (payload->>'id' = id::text),
  CHECK ((payload->>'versao')::integer = version),
  CHECK (payload->>'status' IN ('rascunho', 'ativa', 'vendida', 'liquidada', 'devolvida', 'cancelada'))
);

CREATE UNIQUE INDEX IF NOT EXISTS kalman_negociacoes_active_plate
  ON kalman_negociacoes (organization_id, (NULLIF(payload->'veiculo'->>'placa', '')))
  WHERE payload->>'status' IN ('ativa', 'vendida');
CREATE UNIQUE INDEX IF NOT EXISTS kalman_negociacoes_active_chassis
  ON kalman_negociacoes (organization_id, (NULLIF(payload->'veiculo'->>'chassi', '')))
  WHERE payload->>'status' IN ('ativa', 'vendida');
CREATE INDEX IF NOT EXISTS kalman_negociacoes_updated ON kalman_negociacoes (organization_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS kalman_negociacao_documentos (
  organization_id text NOT NULL,
  negotiation_id uuid NOT NULL,
  id uuid NOT NULL,
  issued_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id, negotiation_id) REFERENCES kalman_negociacoes (organization_id, id),
  CHECK (payload->>'negociacaoId' = negotiation_id::text),
  CHECK (payload->>'id' = id::text),
  CHECK (payload->'snapshot'->>'organizacaoId' = organization_id),
  CHECK (payload->>'status' IN ('minuta', 'emitido'))
);
CREATE INDEX IF NOT EXISTS kalman_documentos_negociacao ON kalman_negociacao_documentos (organization_id, negotiation_id, issued_at);

CREATE TABLE IF NOT EXISTS kalman_negociacao_eventos (
  organization_id text NOT NULL,
  negotiation_id uuid NOT NULL,
  id uuid NOT NULL,
  version integer NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (organization_id, id),
  UNIQUE (organization_id, negotiation_id, version),
  FOREIGN KEY (organization_id, negotiation_id) REFERENCES kalman_negociacoes (organization_id, id),
  CHECK (payload->>'id' = id::text),
  CHECK ((payload->>'versao')::integer = version)
);

ALTER TABLE kalman_negociacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kalman_negociacoes FORCE ROW LEVEL SECURITY;
ALTER TABLE kalman_negociacao_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kalman_negociacao_documentos FORCE ROW LEVEL SECURITY;
ALTER TABLE kalman_negociacao_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kalman_negociacao_eventos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kalman_org_negociacoes ON kalman_negociacoes;
CREATE POLICY kalman_org_negociacoes ON kalman_negociacoes
  USING (organization_id = NULLIF(current_setting('app.organization_id', true), ''))
  WITH CHECK (organization_id = NULLIF(current_setting('app.organization_id', true), ''));
DROP POLICY IF EXISTS kalman_org_documentos ON kalman_negociacao_documentos;
CREATE POLICY kalman_org_documentos ON kalman_negociacao_documentos
  USING (organization_id = NULLIF(current_setting('app.organization_id', true), ''))
  WITH CHECK (organization_id = NULLIF(current_setting('app.organization_id', true), ''));
DROP POLICY IF EXISTS kalman_org_eventos ON kalman_negociacao_eventos;
CREATE POLICY kalman_org_eventos ON kalman_negociacao_eventos
  USING (organization_id = NULLIF(current_setting('app.organization_id', true), ''))
  WITH CHECK (organization_id = NULLIF(current_setting('app.organization_id', true), ''));

CREATE OR REPLACE FUNCTION kalman_reject_history_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Issued documents and audit events are immutable' USING ERRCODE = '55000';
END;
$$;
DROP TRIGGER IF EXISTS kalman_documentos_immutable ON kalman_negociacao_documentos;
CREATE TRIGGER kalman_documentos_immutable BEFORE UPDATE OR DELETE ON kalman_negociacao_documentos
  FOR EACH ROW EXECUTE FUNCTION kalman_reject_history_change();
DROP TRIGGER IF EXISTS kalman_eventos_immutable ON kalman_negociacao_eventos;
CREATE TRIGGER kalman_eventos_immutable BEFORE UPDATE OR DELETE ON kalman_negociacao_eventos
  FOR EACH ROW EXECUTE FUNCTION kalman_reject_history_change();

COMMIT;
