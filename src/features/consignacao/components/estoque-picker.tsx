'use client';

import { useRef, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { getQueryClient } from '@/lib/query-client';
import { veiculosQueryOptions } from '@/features/estoque/api/queries';
import type { Veiculo } from '@/features/estoque/api/types';
import { mensagemErro } from './form-fields';

interface EstoquePickerProps {
  onPick: (veiculo: Veiculo) => void;
  disabled?: boolean;
}

export default function EstoquePicker({ onPick, disabled }: EstoquePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const request = useRef(0);

  async function carregar(busca: string) {
    const sequence = ++request.current;
    setLoading(true);
    setError('');
    try {
      const result = await getQueryClient().fetchQuery(
        veiculosQueryOptions({ page: 1, limit: 30, busca: busca.trim() })
      );
      if (request.current !== sequence) return;
      setItems(result.veiculos);
      setTotal(result.total_veiculos);
    } catch (cause) {
      if (request.current === sequence) setError(mensagemErro(cause));
    } finally {
      if (request.current === sequence) setLoading(false);
    }
  }

  return (
    <>
      <Button
        type='button'
        variant='outline'
        disabled={disabled}
        onClick={() => {
          setOpen(true);
          void carregar(search);
        }}
      >
        <Icons.car /> Preencher com veículo do estoque
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-h-[85dvh] overflow-y-auto sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Selecionar veículo</DialogTitle>
            <DialogDescription>
              Os dados selecionados substituem os campos básicos do veículo neste cadastro. Confira
              as informações e complete RENAVAM, restrições e vistoria.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='busca-estoque-negociacao'>Marca, modelo ou placa</Label>
            <div className='flex gap-2'>
              <Input
                id='busca-estoque-negociacao'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void carregar(search);
                  }
                }}
              />
              <Button type='button' isLoading={loading} onClick={() => void carregar(search)}>
                Buscar
              </Button>
            </div>
          </div>
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          {loading ? (
            <p role='status' className='text-muted-foreground flex items-center gap-2 py-6 text-sm'>
              <Icons.spinner className='size-4 animate-spin' /> Consultando estoque…
            </p>
          ) : (
            <div className='space-y-2'>
              {!items.length && !error && (
                <p className='text-muted-foreground py-6 text-sm'>Nenhum veículo encontrado.</p>
              )}
              {items.map((veiculo) => (
                <Button
                  key={veiculo.id}
                  type='button'
                  variant='outline'
                  className='h-auto w-full justify-between gap-4 py-3 text-left whitespace-normal'
                  onClick={() => {
                    onPick(veiculo);
                    setOpen(false);
                  }}
                >
                  <span>
                    <span className='block font-medium'>
                      {veiculo.marca} {veiculo.modelo}
                    </span>
                    <span className='text-muted-foreground block text-xs'>
                      {veiculo.placa} · {veiculo.ano} · {veiculo.status}
                    </span>
                  </span>
                  <Icons.chevronRight className='size-4 shrink-0' />
                </Button>
              ))}
              {total > items.length && (
                <p className='text-muted-foreground text-xs'>
                  Exibindo {items.length} de {total} veículos. Refine a busca para localizar outro.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
