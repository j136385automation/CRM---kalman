'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createVeiculoMutation } from '../api/mutations';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { veiculoSchema, type VeiculoFormValues } from '../schemas/veiculo';
import { MARCA_OPTIONS, ORIGEM_OPTIONS } from '../constants/veiculos';

export default function VeiculoForm() {
  const router = useRouter();

  const createMutation = useMutation({
    ...createVeiculoMutation,
    onSuccess: () => {
      toast.success('Veículo cadastrado com sucesso');
      router.push('/dashboard/estoque');
    },
    onError: () => {
      toast.error('Falha ao cadastrar o veículo');
    }
  });

  const form = useAppForm({
    defaultValues: {
      marca: '',
      modelo: '',
      ano: undefined,
      placa: '',
      chassi: '',
      cor: '',
      km: undefined,
      valorCompra: undefined,
      valorVenda: undefined,
      origem: 'Compra',
      observacoes: ''
    } as VeiculoFormValues,
    validators: {
      onSubmit: veiculoSchema
    },
    onSubmit: ({ value }) => {
      createMutation.mutate({
        marca: value.marca,
        modelo: value.modelo,
        ano: value.ano!,
        placa: value.placa,
        chassi: value.chassi,
        cor: value.cor,
        km: value.km!,
        valorCompra: value.valorCompra!,
        valorVenda: value.valorVenda!,
        origem: value.origem,
        observacoes: value.observacoes
      });
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } = useFormFields<VeiculoFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>Cadastrar veículo</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormSelectField
                name='marca'
                label='Marca'
                required
                options={MARCA_OPTIONS}
                placeholder='Selecione a marca'
                validators={{
                  onBlur: z.string().min(1, 'Selecione a marca')
                }}
              />

              <FormTextField
                name='modelo'
                label='Modelo'
                required
                placeholder='Ex.: Civic Touring 1.5 Turbo'
                validators={{
                  onBlur: z.string().min(2, 'Informe o modelo (mín. 2 caracteres)')
                }}
              />

              <FormTextField
                name='ano'
                label='Ano'
                required
                type='number'
                min={1960}
                max={new Date().getFullYear() + 1}
                placeholder='Ex.: 2022'
                validators={{
                  onBlur: z.number({ message: 'Informe o ano' })
                }}
              />

              <FormTextField
                name='placa'
                label='Placa'
                required
                placeholder='Ex.: BRA2E19'
                validators={{
                  onBlur: z.string().min(7, 'Placa inválida')
                }}
              />

              <FormTextField
                name='chassi'
                label='Chassi'
                required
                placeholder='17 caracteres'
                validators={{
                  onBlur: z.string().length(17, 'O chassi deve ter 17 caracteres')
                }}
              />

              <FormTextField
                name='cor'
                label='Cor'
                required
                placeholder='Ex.: Prata'
                validators={{
                  onBlur: z.string().min(1, 'Informe a cor')
                }}
              />

              <FormTextField
                name='km'
                label='Quilometragem'
                required
                type='number'
                min={0}
                placeholder='Ex.: 38400'
                validators={{
                  onBlur: z.number({ message: 'Informe a quilometragem' })
                }}
              />

              <FormSelectField
                name='origem'
                label='Origem'
                required
                options={ORIGEM_OPTIONS}
                placeholder='Selecione a origem'
                validators={{
                  onBlur: z.enum(['Compra', 'Consignação', 'Troca'], {
                    message: 'Selecione a origem'
                  })
                }}
              />

              <FormTextField
                name='valorCompra'
                label='Valor de compra (R$)'
                required
                type='number'
                min={0}
                step={0.01}
                placeholder='Ex.: 138500'
                validators={{
                  onBlur: z.number({ message: 'Informe o valor de compra' })
                }}
              />

              <FormTextField
                name='valorVenda'
                label='Valor de venda pretendido (R$)'
                required
                type='number'
                min={0}
                step={0.01}
                placeholder='Ex.: 152900'
                validators={{
                  onBlur: z.number({ message: 'Informe o valor de venda pretendido' })
                }}
              />
            </div>

            <FormTextareaField
              name='observacoes'
              label='Observações'
              placeholder='Anotações internas sobre o veículo (opcional)'
              maxLength={500}
              rows={4}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Voltar
              </Button>
              <form.SubmitButton>Cadastrar veículo</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
