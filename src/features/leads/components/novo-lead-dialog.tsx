'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLeadsStore, type OrigemLead } from '../utils/store';

const origens: OrigemLead[] = ['OLX', 'WhatsApp', 'Site', 'Instagram', 'Facebook'];

export default function NovoLeadDialog() {
  const addLead = useLeadsStore((state) => state.addLead);
  const [open, setOpen] = useState(false);
  const [origem, setOrigem] = useState<OrigemLead>('OLX');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { nome, veiculo } = Object.fromEntries(formData);

    if (typeof nome !== 'string' || typeof veiculo !== 'string') return;
    if (!nome.trim() || !veiculo.trim()) {
      toast.error('Preencha o nome do lead e o veículo de interesse');
      return;
    }

    addLead(nome.trim(), veiculo.trim(), origem);
    toast.success('Lead adicionado ao pipeline');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant='secondary' size='sm' />}>+ Novo lead</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
          <DialogDescription>Cadastre um lead no pipeline de vendas da revenda.</DialogDescription>
        </DialogHeader>
        <form id='lead-form' className='grid gap-4 py-4' onSubmit={handleSubmit}>
          <Input id='nome' name='nome' placeholder='Nome do lead...' />
          <Input
            id='veiculo'
            name='veiculo'
            placeholder='Veículo de interesse (ex.: Toyota Corolla XEi 2023)'
          />
          <Select value={origem} onValueChange={(value) => setOrigem(value as OrigemLead)}>
            <SelectTrigger>
              <SelectValue placeholder='Origem do lead' />
            </SelectTrigger>
            <SelectContent>
              {origens.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
        <DialogFooter>
          <DialogClose render={<Button type='submit' size='sm' form='lead-form' />}>
            Adicionar lead
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
