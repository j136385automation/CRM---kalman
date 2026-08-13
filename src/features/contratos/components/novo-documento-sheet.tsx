'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { documentoSchema, type DocumentoFormValues } from '../schemas/documento';
import { TIPO_DOCUMENTO_OPTIONS } from '../constants/contratos';

export default function NovoDocumentoSheet() {
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    defaultValues: {
      tipo: '',
      cliente: '',
      veiculo: ''
    } as DocumentoFormValues,
    validators: {
      onSubmit: documentoSchema
    },
    onSubmit: () => {
      toast.success('Documento criado com sucesso (simulação)');
      setOpen(false);
      form.reset();
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<DocumentoFormValues>();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className='text-xs md:text-sm' />}>
        <Icons.add className='mr-2 h-4 w-4' />
        Novo documento
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>Novo documento</SheetTitle>
          <SheetDescription>Gere um contrato ou documento para um cliente.</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form.AppForm>
            <form.Form id='novo-documento-form' className='space-y-4'>
              <FormSelectField
                name='tipo'
                label='Tipo de documento'
                required
                options={TIPO_DOCUMENTO_OPTIONS}
                placeholder='Selecione o tipo'
              />
              <FormTextField
                name='cliente'
                label='Cliente'
                required
                placeholder='Ex.: Carlos Eduardo Santos'
              />
              <FormTextField
                name='veiculo'
                label='Veículo'
                required
                placeholder='Ex.: Toyota Corolla XEi 2022 · PRK-4F28'
              />
            </form.Form>
          </form.AppForm>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='novo-documento-form'>
            Criar documento
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
