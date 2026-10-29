import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { issueDocumento } from './service';
import { negociacaoKeys } from './queries';
import type { IssueDocumentoInput } from './types';

export const issueDocumentoMutation = mutationOptions({
  mutationFn: ({ id, versao, input }: { id: string; versao: number; input: IssueDocumentoInput }) =>
    issueDocumento(id, versao, input),
  onSuccess: async () => {
    await getQueryClient().invalidateQueries({ queryKey: negociacaoKeys.all });
  }
});
