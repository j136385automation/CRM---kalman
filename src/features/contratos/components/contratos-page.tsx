import { Suspense } from 'react';
import NegociacoesScreen from '@/features/consignacao/components/negociacoes-screen';
import { NegociacoesSkeleton } from '@/features/consignacao/components/negociacoes-gate';
import CatalogoModelos from './catalogo-modelos';

export default function ContratosPage() {
  return (
    <div className='space-y-6'>
      <Suspense fallback={<NegociacoesSkeleton />}>
        <NegociacoesScreen view='list' />
      </Suspense>
      <CatalogoModelos />
    </div>
  );
}
