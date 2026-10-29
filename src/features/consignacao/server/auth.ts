import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { NegociacaoError } from '../domain/negociacao';

export interface AuthorizedContext {
  organizacaoId: string;
  autorId: string;
  canManage: boolean;
}

/** All server entry points call this; navigation visibility is never authorization. */
export async function requireOrganization(write = false): Promise<AuthorizedContext> {
  const session = await auth();
  if (!session.userId)
    throw new NegociacaoError('Entre na sua conta para acessar negociações.', 'NAO_AUTENTICADO');
  if (!session.orgId)
    throw new NegociacaoError('Selecione uma empresa para acessar negociações.', 'SEM_EMPRESA');
  const canManage =
    session.orgRole === 'org:admin' || session.has({ permission: 'org:consignacao:manage' });
  if (write && !canManage)
    throw new NegociacaoError(
      'Você precisa da permissão de gestão de consignações para realizar esta operação.',
      'SEM_PERMISSAO'
    );
  return { organizacaoId: session.orgId, autorId: session.userId, canManage };
}
