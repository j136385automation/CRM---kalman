'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { CANAL_ANUNCIO_LABELS, type Anuncio, type CanalAnuncio } from '../../constants/anuncios';

export function CellAction({ data }: { data: Anuncio }) {
  const canaisPendentes = (Object.keys(data.canais) as CanalAnuncio[]).filter(
    (canal) => !data.canais[canal]
  );
  const [publicado, setPublicado] = useState(canaisPendentes.length === 0);

  const handlePublicar = () => {
    toast.success('Anúncio publicado com sucesso', {
      description: `${data.veiculo} publicado em: ${canaisPendentes
        .map((canal) => CANAL_ANUNCIO_LABELS[canal])
        .join(', ')}`
    });
    setPublicado(true);
  };

  if (publicado) {
    return (
      <Button variant='ghost' size='sm' disabled>
        <Icons.circleCheck className='mr-1 h-4 w-4' />
        Publicado
      </Button>
    );
  }

  return (
    <Button variant='outline' size='sm' onClick={handlePublicar}>
      <Icons.upload className='mr-1 h-4 w-4' />
      Publicar
    </Button>
  );
}
