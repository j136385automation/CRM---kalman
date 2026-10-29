import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function NovoDocumentoSheet() {
  return (
    <Button
      nativeButton={false}
      render={
        <Link
          href='/dashboard/consignacoes/nova?modalidade=compra_venda'
          aria-label='Novo contrato'
        />
      }
    >
      <Icons.add className='size-4' />
      Novo contrato
    </Button>
  );
}
