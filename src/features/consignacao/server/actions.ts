'use server';

import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { MODELOS_DOCUMENTO, renderDocumento } from '@/features/contratos/lib/templates';
import type {
  DocumentoNegociacao,
  IssueDocumentoInput,
  ListNegociacoesResult,
  Negociacao,
  NegociacaoCommand,
  NegociacaoInput,
  NegociacoesContext
} from '../api/types';
import {
  appendDocumentoDomain,
  applyNegociacaoCommand,
  createNegociacaoDomain,
  NegociacaoError,
  snapshotNegociacao,
  updateNegociacaoDomain,
  type DomainContext
} from '../domain/negociacao';
import { issueDocumentoSchema } from '../schemas/negociacao';
import { requireOrganization, type AuthorizedContext } from './auth';
import {
  CONFIGURATION_MESSAGE,
  getStoredNegociacao,
  insertStoredNegociacao,
  listStoredNegociacoes,
  mutateStoredNegociacao,
  storageMode
} from './storage';
import type { ActionResult } from './result';

function domainContext(auth: AuthorizedContext): DomainContext {
  return {
    organizacaoId: auth.organizacaoId,
    autorId: auth.autorId,
    agora: new Date().toISOString(),
    novoId: randomUUID
  };
}

function validateId(id: unknown): string {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success)
    throw new NegociacaoError('Identificador de negociação ou documento inválido.');
  return parsed.data;
}

function validateVersion(version: unknown): number {
  const parsed = z.number().int().positive().safeParse(version);
  if (!parsed.success) throw new NegociacaoError('Versão do dossiê inválida. Atualize a página.');
  return parsed.data;
}

async function safely<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    if (error instanceof NegociacaoError)
      return { ok: false, message: error.message, code: error.code };
    if (error instanceof z.ZodError)
      return {
        ok: false,
        message: error.issues
          .slice(0, 5)
          .map((issue) => issue.message)
          .join(' '),
        code: 'VALIDACAO'
      };
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === '23505')
      return {
        ok: false,
        message:
          'Já existe uma operação ativa para esta placa/chassi ou este registro já foi salvo. Atualize o dossiê.',
        code: 'CONFLITO'
      };
    if (code === '40001' || code === '40P01')
      return {
        ok: false,
        message: 'Outra sessão alterou esta negociação. Atualize a página antes de continuar.',
        code: 'CONFLITO'
      };
    if (code === '42P01')
      return { ok: false, message: CONFIGURATION_MESSAGE, code: 'CONFIGURACAO' };
    // Do not serialize SQL, connection strings, provider errors, or personal data into client messages.
    return {
      ok: false,
      message:
        'Não foi possível concluir a operação. Verifique a conexão e a configuração do armazenamento e tente novamente.',
      code: 'INDISPONIVEL'
    };
  }
}

export async function contextAction(): Promise<ActionResult<NegociacoesContext>> {
  return safely(async () => {
    const auth = await requireOrganization();
    const mode = storageMode();
    return {
      organizacaoId: auth.organizacaoId,
      canManage: auth.canManage,
      storageMode: mode,
      configurationMessage:
        mode === 'unconfigured'
          ? CONFIGURATION_MESSAGE
          : mode === 'demo'
            ? 'Demonstração de desenvolvimento: os dados ficam apenas na memória deste processo e são perdidos quando ele reinicia. Use somente dados fictícios.'
            : null
    };
  });
}

export async function listAction(): Promise<ActionResult<ListNegociacoesResult>> {
  return safely(async () => {
    const auth = await requireOrganization();
    const negociacoes = await listStoredNegociacoes(auth.organizacaoId);
    return {
      negociacoes,
      organizacaoId: auth.organizacaoId,
      canManage: auth.canManage,
      storageMode: storageMode() === 'demo' ? 'demo' : 'postgres'
    };
  });
}

export async function getAction(id: string): Promise<ActionResult<Negociacao>> {
  return safely(async () => {
    const auth = await requireOrganization();
    return getStoredNegociacao(auth.organizacaoId, validateId(id));
  });
}

export async function createAction(input: NegociacaoInput): Promise<ActionResult<Negociacao>> {
  return safely(async () => {
    const auth = await requireOrganization(true);
    const negociacao = createNegociacaoDomain(input, domainContext(auth));
    return insertStoredNegociacao(negociacao);
  });
}

export async function updateAction(
  id: string,
  expectedVersion: number,
  input: NegociacaoInput
): Promise<ActionResult<Negociacao>> {
  return safely(async () => {
    const auth = await requireOrganization(true);
    const ctx = domainContext(auth);
    return mutateStoredNegociacao(
      auth.organizacaoId,
      validateId(id),
      validateVersion(expectedVersion),
      (current) => updateNegociacaoDomain(current, input, ctx)
    );
  });
}

export async function commandAction(
  id: string,
  expectedVersion: number,
  command: NegociacaoCommand
): Promise<ActionResult<Negociacao>> {
  return safely(async () => {
    const auth = await requireOrganization(true);
    const ctx = domainContext(auth);
    return mutateStoredNegociacao(
      auth.organizacaoId,
      validateId(id),
      validateVersion(expectedVersion),
      (current) => applyNegociacaoCommand(current, command, ctx)
    );
  });
}

export async function issueAction(
  id: string,
  expectedVersion: number,
  input: IssueDocumentoInput
): Promise<ActionResult<DocumentoNegociacao>> {
  return safely(async () => {
    const auth = await requireOrganization(true);
    const payload = issueDocumentoSchema.parse(input);
    if (!MODELOS_DOCUMENTO.some((model) => model.id === payload.modeloId))
      throw new NegociacaoError('Modelo de documento não encontrado.');
    const ctx = domainContext(auth);
    const documentId = randomUUID();
    const result = await mutateStoredNegociacao(
      auth.organizacaoId,
      validateId(id),
      validateVersion(expectedVersion),
      (current) => {
        const rendered = renderDocumento(current, payload.modeloId, payload.campos);
        if (payload.finalidade === 'emissao' && rendered.pendencias.length > 0) {
          throw new NegociacaoError(
            `Complete os dados antes de emitir: ${rendered.pendencias.join(' ')}`
          );
        }
        const documento: DocumentoNegociacao = {
          id: documentId,
          negociacaoId: current.id,
          modeloId: payload.modeloId,
          versaoModelo: rendered.versaoModelo,
          titulo: rendered.titulo,
          conteudo: rendered.conteudo,
          sha256: createHash('sha256').update(rendered.conteudo, 'utf8').digest('hex'),
          status: payload.finalidade === 'minuta' ? 'minuta' : 'emitido',
          emitidoEm: ctx.agora,
          emitidoPor: auth.autorId,
          campos: payload.campos,
          pendencias: rendered.pendencias,
          snapshot: snapshotNegociacao(current)
        };
        return appendDocumentoDomain(current, documento, ctx);
      }
    );
    const document = result.documentos.find((item) => item.id === documentId);
    if (!document)
      throw new NegociacaoError('Documento não localizado após emissão.', 'INDISPONIVEL');
    return document;
  });
}

export async function documentAction(
  negociacaoId: string,
  documentoId: string
): Promise<ActionResult<DocumentoNegociacao>> {
  return safely(async () => {
    const auth = await requireOrganization();
    const n = await getStoredNegociacao(auth.organizacaoId, validateId(negociacaoId));
    const id = validateId(documentoId);
    const document = n.documentos.find((item) => item.id === id);
    if (!document)
      throw new NegociacaoError('Documento não encontrado nesta empresa.', 'NAO_ENCONTRADO');
    return document;
  });
}
