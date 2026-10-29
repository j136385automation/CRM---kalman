'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { negociacaoKeys } from '../api/queries';

export interface NegociacoesViewContext {
  organizacaoId: string;
  canManage: boolean;
  storageMode: 'postgres' | 'demo';
}

export function NegociacoesSkeleton() {
  return (
    <div className='space-y-4' aria-label='Carregando negociações' aria-busy='true'>
      <Skeleton className='h-24 w-full' />
      <Skeleton className='h-64 w-full' />
    </div>
  );
}

export default function NegociacoesGate({
  context,
  children
}: {
  context: NegociacoesViewContext;
  children: React.ReactNode;
}) {
  const { orgId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const matches = isLoaded && isSignedIn && orgId === context.organizacaoId;

  useEffect(() => {
    if (isLoaded && orgId !== context.organizacaoId) {
      getQueryClient().removeQueries({ queryKey: negociacaoKeys.scope(context.organizacaoId) });
      router.refresh();
    }
  }, [orgId, isLoaded, context.organizacaoId, router]);

  if (!isLoaded) return <NegociacoesSkeleton />;
  if (!matches) {
    return (
      <Alert>
        <Icons.workspace />
        <AlertTitle>Selecione a empresa da operação</AlertTitle>
        <AlertDescription>
          <p>Os contratos e as consignações pertencem à empresa ativa.</p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Button
              nativeButton={false}
              render={<Link href='/dashboard/workspaces' aria-label='Selecionar empresa' />}
            >
              Selecionar empresa
            </Button>
            <Button variant='outline' onClick={() => router.refresh()}>
              Atualizar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-5'>
      {context.storageMode === 'demo' && (
        <Alert>
          <Icons.info />
          <AlertTitle>Ambiente de demonstração</AlertTitle>
          <AlertDescription>
            Use dados fictícios. Os registros deste ambiente são temporários e podem ser apagados ao
            reiniciar a aplicação.
          </AlertDescription>
        </Alert>
      )}
      {!context.canManage && (
        <Alert>
          <Icons.lock />
          <AlertTitle>Acesso de consulta</AlertTitle>
          <AlertDescription>
            Você pode consultar os documentos. Para cadastrar, emitir ou registrar movimentações,
            solicite acesso ao administrador da sua empresa.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
}
