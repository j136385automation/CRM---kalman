'use client';

import { useState } from 'react';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { agendamentoSchema, type AgendamentoFormValues } from '../schemas/agendamento';
import { responsavelOptions, tipoAgendamentoOptions } from '../constants/agendamentos';

export default function NovoAgendamentoDialog() {
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    defaultValues: {
      tipo: '',
      cliente: '',
      veiculo: '',
      data: '',
      horario: '',
      responsavel: '',
      observacoes: ''
    } as AgendamentoFormValues,
    validators: {
      onSubmit: agendamentoSchema
    },
    onSubmit: ({ value }) => {
      toast.success('Agendamento criado com sucesso', {
        description: `${value.cliente} — ${value.data} às ${value.horario}`
      });
      setOpen(false);
      form.reset();
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } =
    useFormFields<AgendamentoFormValues>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size='sm' />}>Novo agendamento</DialogTrigger>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            Agende um test-drive, vistoria, entrega, revisão ou reunião com cliente.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form className='space-y-4 p-0 md:p-0'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormSelectField
                name='tipo'
                label='Tipo'
                required
                options={tipoAgendamentoOptions}
                placeholder='Selecione o tipo'
              />
              <FormTextField
                name='cliente'
                label='Cliente'
                required
                placeholder='Nome do cliente'
              />
              <FormTextField
                name='veiculo'
                label='Veículo'
                required
                placeholder='Ex.: Toyota Corolla XEi 2023'
              />
              <FormSelectField
                name='responsavel'
                label='Responsável'
                required
                options={responsavelOptions}
                placeholder='Selecione o responsável'
              />
              <form.AppField name='data'>
                {(field) => (
                  <field.FieldSet>
                    <field.Field>
                      <field.FieldLabel htmlFor={field.name}>Data *</field.FieldLabel>
                      <Input
                        id={field.name}
                        type='date'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </field.Field>
                    <field.FieldError />
                  </field.FieldSet>
                )}
              </form.AppField>
              <form.AppField name='horario'>
                {(field) => (
                  <field.FieldSet>
                    <field.Field>
                      <field.FieldLabel htmlFor={field.name}>Horário *</field.FieldLabel>
                      <Input
                        id={field.name}
                        type='time'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </field.Field>
                    <field.FieldError />
                  </field.FieldSet>
                )}
              </form.AppField>
            </div>
            <FormTextareaField
              name='observacoes'
              label='Observações'
              placeholder='Detalhes do agendamento (opcional)'
              rows={3}
            />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <form.SubmitButton>Agendar</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
