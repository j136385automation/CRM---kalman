'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

export default function NegociacoesError({ reset }: { reset: () => void }) {
  return (
    <Alert variant='destructive'>
      <Icons.warning />
      <AlertTitle>Não foi possível carregar a operação</AlertTitle>
      <AlertDescription>
        <p>
          Confira a empresa selecionada e sua conexão. Se persistir, peça ao administrador para
          verificar o armazenamento da empresa.
        </p>
        <Button variant='outline' className='mt-3' onClick={reset}>
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
}
