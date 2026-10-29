import {
  commandAction,
  contextAction,
  createAction,
  documentAction,
  getAction,
  issueAction,
  listAction,
  updateAction
} from '../server/actions';
import type { ActionResult } from '../server/result';
import type {
  DocumentoNegociacao,
  IssueDocumentoInput,
  ListNegociacoesResult,
  Negociacao,
  NegociacaoCommand,
  NegociacaoInput,
  NegociacoesContext
} from './types';

/** Expected errors are returned by Server Actions and thrown here so production preserves safe messages. */
function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.message);
  return result.value;
}

export async function getNegociacoesContext(): Promise<NegociacoesContext> {
  return unwrap(await contextAction());
}

export async function listNegociacoes(): Promise<ListNegociacoesResult> {
  return unwrap(await listAction());
}

export async function getNegociacao(id: string): Promise<Negociacao> {
  return unwrap(await getAction(id));
}

export async function createNegociacao(input: NegociacaoInput): Promise<Negociacao> {
  return unwrap(await createAction(input));
}

export async function updateNegociacao(
  id: string,
  expectedVersion: number,
  input: NegociacaoInput
): Promise<Negociacao> {
  return unwrap(await updateAction(id, expectedVersion, input));
}

export async function executeNegociacaoCommand(
  id: string,
  expectedVersion: number,
  command: NegociacaoCommand
): Promise<Negociacao> {
  return unwrap(await commandAction(id, expectedVersion, command));
}

export async function issueDocumento(
  id: string,
  expectedVersion: number,
  input: IssueDocumentoInput
): Promise<DocumentoNegociacao> {
  return unwrap(await issueAction(id, expectedVersion, input));
}

export async function getDocumento(
  negociacaoId: string,
  documentoId: string
): Promise<DocumentoNegociacao> {
  return unwrap(await documentAction(negociacaoId, documentoId));
}
