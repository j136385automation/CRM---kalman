import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { MODELOS_DOCUMENTO } from '../lib/templates';

export default function CatalogoModelos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Biblioteca de modelos</CardTitle>
        <CardDescription>
          Os modelos são preenchidos a partir da negociação. Cada modalidade reúne as condições e os
          termos pertinentes à operação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {MODELOS_DOCUMENTO.map((modelo) => (
            <div key={modelo.id} className='rounded-lg border p-4'>
              <div className='flex items-start gap-3'>
                <Icons.fileContract className='text-muted-foreground mt-0.5 size-5 shrink-0' />
                <div>
                  <h3 className='text-sm font-semibold'>{modelo.titulo}</h3>
                  <p className='text-muted-foreground mt-2 text-xs leading-5'>{modelo.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-4'>
          <p className='text-muted-foreground max-w-3xl text-sm'>
            O contrato do CRM registra o acordo. A assinatura das partes, a documentação oficial do
            veículo e a transferência perante o órgão de trânsito são etapas próprias da operação.
          </p>
          <Button
            variant='outline'
            nativeButton={false}
            render={
              <Link
                href='/dashboard/consignacoes/nova?modalidade=compra_venda'
                aria-label='Cadastrar negociação'
              />
            }
          >
            Cadastrar negociação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
