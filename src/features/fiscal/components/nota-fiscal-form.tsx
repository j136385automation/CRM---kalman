'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyBRL } from '@/lib/format';
import { notaFiscalSchema, type NotaFiscalFormValues } from '../schemas/nota-fiscal';
import { REGIME_TRIBUTARIO_OPTIONS, TIPO_NOTA_OPTIONS } from '../constants/notas-fiscais';
import { calcularImpostos } from '../lib/impostos';

const defaultValues: NotaFiscalFormValues = {
  tipo: '',
  cliente: '',
  veiculoMarca: '',
  veiculoModelo: '',
  veiculoAno: undefined,
  veiculoPlaca: '',
  valor: undefined,
  regime: ''
};

function ResumoImpostosCard({ valor, regime }: { valor: number | undefined; regime: string }) {
  const resumo = calcularImpostos(valor, regime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Resumo estimado de impostos</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {resumo.impostos.map((imposto) => (
          <div key={imposto.nome} className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              {imposto.nome} ({(imposto.aliquota * 100).toLocaleString('pt-BR')}%)
            </span>
            <span>{formatCurrencyBRL(imposto.valor)}</span>
          </div>
        ))}
        <Separator />
        <div className='flex items-center justify-between text-sm font-medium'>
          <span>Total de impostos</span>
          <span>{formatCurrencyBRL(resumo.totalImpostos)}</span>
        </div>
        <div className='flex items-center justify-between text-sm font-medium'>
          <span>Valor líquido estimado</span>
          <span>{formatCurrencyBRL(resumo.valorLiquido)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotaFiscalForm() {
  const router = useRouter();
  const [simulacaoAberta, setSimulacaoAberta] = useState(false);

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: notaFiscalSchema
    },
    onSubmit: () => {
      toast.success('Nota fiscal emitida com sucesso (simulação)');
      router.push('/dashboard/fiscal');
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<NotaFiscalFormValues>();

  const simularNota = () => {
    const resultado = notaFiscalSchema.safeParse(form.state.values);
    if (!resultado.success) {
      toast.error('Preencha todos os campos obrigatórios para simular a nota');
      return;
    }
    setSimulacaoAberta(true);
  };

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
      <Card className='lg:col-span-2'>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>Dados da nota</CardTitle>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form.Form className='space-y-8'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormSelectField
                  name='tipo'
                  label='Tipo da nota'
                  required
                  options={TIPO_NOTA_OPTIONS}
                  placeholder='Selecione o tipo'
                />
                <FormTextField
                  name='cliente'
                  label='Cliente / Fornecedor'
                  required
                  placeholder='Ex.: Carlos Eduardo Santos'
                />
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormTextField
                  name='veiculoMarca'
                  label='Marca do veículo'
                  required
                  placeholder='Ex.: Toyota'
                />
                <FormTextField
                  name='veiculoModelo'
                  label='Modelo do veículo'
                  required
                  placeholder='Ex.: Corolla XEi'
                />
                <FormTextField
                  name='veiculoAno'
                  label='Ano'
                  required
                  type='number'
                  min={1950}
                  max={2030}
                  placeholder='Ex.: 2022'
                />
                <FormTextField
                  name='veiculoPlaca'
                  label='Placa'
                  required
                  placeholder='Ex.: ABC1D23'
                />
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormTextField
                  name='valor'
                  label='Valor da nota (R$)'
                  required
                  type='number'
                  min={0}
                  step={0.01}
                  placeholder='Ex.: 89900'
                />
                <FormSelectField
                  name='regime'
                  label='Regime tributário'
                  required
                  options={REGIME_TRIBUTARIO_OPTIONS}
                  placeholder='Selecione o regime'
                />
              </div>

              <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => router.back()}>
                  Voltar
                </Button>
                <Button type='button' variant='secondary' onClick={simularNota}>
                  Simular nota
                </Button>
                <form.SubmitButton>Emitir nota</form.SubmitButton>
              </div>
            </form.Form>
          </form.AppForm>
        </CardContent>
      </Card>

      <form.Subscribe selector={(state) => [state.values.valor, state.values.regime] as const}>
        {([valor, regime]) => <ResumoImpostosCard valor={valor} regime={regime} />}
      </form.Subscribe>

      <Dialog open={simulacaoAberta} onOpenChange={setSimulacaoAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prévia da nota fiscal</DialogTitle>
            <DialogDescription>
              Confira os valores estimados antes de emitir a nota.
            </DialogDescription>
          </DialogHeader>
          <form.Subscribe
            selector={(state) =>
              [
                state.values.tipo,
                state.values.cliente,
                state.values.veiculoMarca,
                state.values.veiculoModelo,
                state.values.veiculoAno,
                state.values.veiculoPlaca,
                state.values.valor,
                state.values.regime
              ] as const
            }
          >
            {([tipo, cliente, marca, modelo, ano, placa, valor, regime]) => {
              const resumo = calcularImpostos(valor, regime);
              return (
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tipo</span>
                    <span className='font-medium'>{tipo}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Cliente / Fornecedor</span>
                    <span className='font-medium'>{cliente}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Veículo</span>
                    <span className='font-medium'>
                      {marca} {modelo} {ano} · {placa?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Regime tributário</span>
                    <span className='font-medium'>{regime}</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Valor da nota</span>
                    <span className='font-medium'>{formatCurrencyBRL(valor)}</span>
                  </div>
                  {resumo.impostos.map((imposto) => (
                    <div key={imposto.nome} className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        {imposto.nome} ({(imposto.aliquota * 100).toLocaleString('pt-BR')}%)
                      </span>
                      <span>{formatCurrencyBRL(imposto.valor)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className='flex justify-between font-medium'>
                    <span>Valor líquido estimado</span>
                    <span>{formatCurrencyBRL(resumo.valorLiquido)}</span>
                  </div>
                </div>
              );
            }}
          </form.Subscribe>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setSimulacaoAberta(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
