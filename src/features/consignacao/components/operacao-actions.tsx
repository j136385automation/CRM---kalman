'use client';

import { useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { Icons } from '@/components/icons';
import { useAppForm, useFormFields, scrollToFirstError } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { getQueryClient } from '@/lib/query-client';
import { executeNegociacaoCommand } from '../api/service';
import { negociacaoKeys } from '../api/queries';
import type { CondicoesNegociacao, Negociacao, NegociacaoCommand } from '../api/types';
import {
  calcularResumoFinanceiro,
  isConsignacao,
  isEncerrada,
  pendenciasAtivacao,
  pendenciasVenda
} from '../domain/negociacao';
import { commandSchema } from '../schemas/negociacao';
import { dataHojeBrasil, FormDateField, FormMoneyField, mensagemErro } from './form-fields';

type Acao = NegociacaoCommand['tipo'];

export interface OperacaoActionsProps {
  negociacao: Negociacao;
  onUpdated?: (negociacao: Negociacao) => void;
  disabled?: boolean;
}

const TITULOS: Record<Acao, string> = {
  ativar: 'Confirmar contrato e ativar',
  aditar: 'Registrar aditivo',
  vender: 'Registrar venda',
  registrar_recebimento: 'Registrar recebimento',
  registrar_repasse: 'Registrar pagamento ao proprietário',
  registrar_despesa: 'Registrar despesa comprovada',
  devolver: 'Registrar devolução do veículo',
  encerrar: 'Concluir acerto da operação',
  cancelar: 'Cancelar negociação'
};

const DESCRICOES: Record<Acao, string> = {
  ativar:
    'Confirme a referência do acordo formalizado. Os termos da operação ficam preservados após a ativação.',
  aditar:
    'Registre condições já ajustadas em aditivo formalizado pelas partes. Os termos anteriores e a referência do aditivo permanecem no histórico.',
  vender:
    'Registre uma venda efetivamente celebrada com o comprador e as condições já salvas no cadastro.',
  registrar_recebimento:
    'Registre um valor efetivamente recebido e identifique o comprovante correspondente.',
  registrar_repasse:
    'Registre um pagamento já realizado ao proprietário, com valor, data e comprovante.',
  registrar_despesa:
    'Registre uma despesa efetiva, comprovada e coberta pela autorização das partes.',
  devolver:
    'Documente a devolução, o estado do veículo e as pendências verificadas com o proprietário.',
  encerrar:
    'Conclua o acerto após conferir recebimentos, pagamentos ao proprietário e documentos. O registro preserva as obrigações legais aplicáveis.',
  cancelar:
    'Registre o motivo do cancelamento. Operações com movimentação financeira exigem acerto prévio.'
};

function acoesDisponiveis(n: Negociacao): Acao[] {
  if (isEncerrada(n)) return [];
  const financeiro = calcularResumoFinanceiro(n);
  const result: Acao[] = [];
  if (n.status === 'rascunho') {
    if (isConsignacao(n.modalidade)) result.push('ativar');
    else result.push('vender');
  }
  if (n.status === 'ativa') {
    result.push('vender');
    if (isConsignacao(n.modalidade)) result.push('aditar');
  }
  if (n.status === 'vendida' && financeiro.aReceberCentavos > 0)
    result.push('registrar_recebimento');
  const podePagarEstimado =
    n.modalidade === 'consignacao_estimatoria' && ['ativa', 'vendida'].includes(n.status);
  const podeRepassarComissao =
    n.modalidade === 'comissao' && n.status === 'vendida' && financeiro.aReceberCentavos === 0;
  if ((podePagarEstimado || podeRepassarComissao) && financeiro.saldoRepasseCentavos > 0)
    result.push('registrar_repasse');
  if (
    ['ativa', 'vendida'].includes(n.status) &&
    isConsignacao(n.modalidade) &&
    financeiro.despesasCentavos < n.condicoes.despesasAutorizadasCentavos
  )
    result.push('registrar_despesa');
  if (
    n.status === 'ativa' &&
    isConsignacao(n.modalidade) &&
    n.condicoes.posse === 'loja' &&
    !n.repasses.length &&
    !n.recebimentos.length
  )
    result.push('devolver');
  const estimadoPago =
    n.modalidade === 'consignacao_estimatoria' &&
    n.status === 'ativa' &&
    financeiro.devidoProprietarioCentavos > 0 &&
    financeiro.saldoRepasseCentavos === 0;
  if (
    (n.status === 'vendida' || estimadoPago) &&
    financeiro.aReceberCentavos === 0 &&
    financeiro.saldoRepasseCentavos === 0
  )
    result.push('encerrar');
  if (
    !n.vendaEfetivada &&
    !n.recebimentos.length &&
    !n.repasses.length &&
    (!n.despesas.length ||
      (n.modalidade === 'intermediacao' && n.condicoes.posse === 'proprietario')) &&
    (n.status === 'rascunho' || n.condicoes.posse === 'proprietario')
  )
    result.push('cancelar');
  return result;
}

type AcaoFormValues = {
  data: string;
  valorCentavos: number;
  referencia: string;
  descricao: string;
  km: number;
  vistoria: string;
  pendencias: string;
  notaOperacao: string;
  termosAditivo: CondicoesNegociacao;
};

function montarComando(tipo: Acao, values: AcaoFormValues, operacaoId: string): NegociacaoCommand {
  switch (tipo) {
    case 'ativar':
      return { tipo, contratoReferencia: values.referencia };
    case 'aditar':
      return { tipo, referenciaAditivo: values.referencia, condicoes: values.termosAditivo };
    case 'vender':
      return { tipo, data: values.data, evidenciaContrato: values.referencia };
    case 'registrar_recebimento':
    case 'registrar_repasse':
      return {
        tipo,
        operacaoId,
        data: values.data,
        valorCentavos: values.valorCentavos,
        comprovante: values.referencia
      };
    case 'registrar_despesa':
      return {
        tipo,
        operacaoId,
        data: values.data,
        valorCentavos: values.valorCentavos,
        comprovante: values.referencia,
        descricao: values.descricao
      };
    case 'devolver':
      return {
        tipo,
        data: values.data,
        km: values.km,
        vistoria: values.vistoria,
        pendencias: values.pendencias,
        evidencia: values.referencia
      };
    case 'encerrar':
      return { tipo, observacoes: values.notaOperacao };
    case 'cancelar':
      return { tipo, motivo: values.notaOperacao };
  }
}

function schemaAcao(tipo: Acao, operacaoId: string) {
  return z
    .object({
      data: z.string(),
      valorCentavos: z.number(),
      referencia: z.string(),
      descricao: z.string(),
      km: z.number(),
      vistoria: z.string(),
      pendencias: z.string(),
      notaOperacao: z.string(),
      termosAditivo: z.custom<CondicoesNegociacao>()
    })
    .superRefine((values, ctx) => {
      const parsed = commandSchema.safeParse(montarComando(tipo, values, operacaoId));
      if (parsed.success) return;
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        const path = [
          'contratoReferencia',
          'evidenciaContrato',
          'comprovante',
          'evidencia',
          'referenciaAditivo'
        ].includes(key)
          ? ['referencia']
          : key === 'motivo' || key === 'observacoes'
            ? ['notaOperacao']
            : key === 'condicoes'
              ? ['termosAditivo', ...issue.path.slice(1)]
              : issue.path;
        ctx.addIssue({ code: 'custom', path, message: issue.message });
      }
    });
}

function valorBRL(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    centavos / 100
  );
}

interface AcaoFormProps extends OperacaoActionsProps {
  tipo: Acao;
  onClose: () => void;
}

function AcaoForm({ negociacao, tipo, onUpdated, onClose }: AcaoFormProps) {
  // A retry of the same operation keeps its identifier and cannot append twice.
  const [operacaoId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  const financeiro = calcularResumoFinanceiro(negociacao);
  const pendencias =
    tipo === 'ativar'
      ? pendenciasAtivacao(negociacao)
      : tipo === 'vender'
        ? pendenciasVenda(negociacao)
        : [];
  const financeiroTipo = [
    'registrar_recebimento',
    'registrar_repasse',
    'registrar_despesa'
  ].includes(tipo);
  const temData = financeiroTipo || tipo === 'vender' || tipo === 'devolver';
  const limite =
    tipo === 'registrar_recebimento'
      ? financeiro.aReceberCentavos
      : tipo === 'registrar_repasse'
        ? financeiro.saldoRepasseCentavos
        : negociacao.condicoes.despesasAutorizadasCentavos - financeiro.despesasCentavos;

  const mutation = useMutation({
    mutationFn: (command: NegociacaoCommand) =>
      executeNegociacaoCommand(negociacao.id, negociacao.versao, command),
    onSuccess: (updated) => {
      void getQueryClient().invalidateQueries({ queryKey: negociacaoKeys.all });
      toast.success('Registro salvo no histórico da operação');
      onUpdated?.(updated);
      onClose();
    },
    onError: (cause) => setError(mensagemErro(cause))
  });

  const form = useAppForm({
    defaultValues: {
      data: dataHojeBrasil(),
      valorCentavos: 0,
      referencia: '',
      descricao: '',
      km: negociacao.veiculo.km,
      vistoria: '',
      pendencias: '',
      notaOperacao: '',
      termosAditivo: structuredClone(negociacao.condicoes)
    } as AcaoFormValues,
    validators: { onSubmit: schemaAcao(tipo, operacaoId) },
    onSubmitInvalid: () => {
      setError('Revise os campos indicados antes de confirmar.');
      scrollToFirstError();
    },
    onSubmit: async ({ value }) => {
      if (pendencias.length) return;
      setError('');
      try {
        await mutation.mutateAsync(montarComando(tipo, value, operacaoId));
      } catch {
        // Keep the command and its idempotency identifier available for retry.
      }
    }
  });
  const { FormTextField, FormTextareaField, FormSelectField, FormCheckboxField } =
    useFormFields<AcaoFormValues>();
  const comissaoTipo = useStore(form.store, (state) => state.values.termosAditivo.comissaoTipo);

  return (
    <form.AppForm>
      <form.Form className='gap-5 p-0 md:p-0 [&_fieldset]:min-w-0 [&_[data-slot=select-trigger]]:max-w-full [&_[data-slot=select-trigger]]:min-w-0 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-value]]:truncate'>
        {error && (
          <Alert variant='destructive'>
            <Icons.warning />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {pendencias.length > 0 && (
          <Alert>
            <Icons.info />
            <AlertTitle>Complete o cadastro antes deste registro</AlertTitle>
            <AlertDescription>
              <ul className='list-disc space-y-1 pl-4'>
                {pendencias.map((pendencia) => (
                  <li key={pendencia}>{pendencia}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {financeiroTipo && (
          <div className='bg-muted/40 rounded-lg border p-3 text-sm'>
            <p className='font-medium'>
              {tipo === 'registrar_despesa' ? 'Limite autorizado restante' : 'Saldo desta operação'}
              : {valorBRL(limite)}
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              Este registro guarda a referência da movimentação realizada. Não executa cobrança ou
              transferência bancária.
            </p>
            {tipo === 'registrar_recebimento' && negociacao.modalidade === 'intermediacao' && (
              <p className='mt-2 text-xs'>
                Informe o valor recebido diretamente pelo vendedor, conforme comprovante.
              </p>
            )}
          </div>
        )}
        {tipo === 'vender' && (
          <p className='text-sm'>
            Preço registrado no cadastro:{' '}
            <strong>{valorBRL(negociacao.venda.precoCentavos)}</strong>. As condições de venda serão
            preservadas após esta confirmação.
          </p>
        )}
        {tipo === 'cancelar' && negociacao.despesas.length > 0 && (
          <Alert>
            <Icons.info />
            <AlertDescription>
              As despesas registradas permanecem no histórico. Descreva o acerto e os responsáveis:
              este cancelamento não declara quitação dos valores pendentes.
            </AlertDescription>
          </Alert>
        )}
        <fieldset disabled={mutation.isPending} className='space-y-4'>
          {tipo === 'aditar' && (
            <>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormDateField
                  name='termosAditivo.dataFim'
                  label='Novo término do acordo'
                  required
                />
                <FormTextField
                  name='termosAditivo.prazoRepasseDias'
                  label='Prazo de pagamento / repasse (dias)'
                  type='number'
                  min={0}
                  max={365}
                />
                <FormMoneyField
                  name='termosAditivo.precoAnunciadoCentavos'
                  label='Preço anunciado'
                  required
                />
                <FormMoneyField
                  name='termosAditivo.precoMinimoCentavos'
                  label='Preço mínimo autorizado'
                  required
                />
                {negociacao.modalidade === 'consignacao_estimatoria' && (
                  <FormMoneyField
                    name='termosAditivo.precoEstimadoCentavos'
                    label='Preço estimado devido ao proprietário'
                    required
                  />
                )}
              </div>
              {negociacao.modalidade !== 'consignacao_estimatoria' && (
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormSelectField
                    name='termosAditivo.comissaoTipo'
                    label='Forma de remuneração'
                    options={[
                      { value: 'fixa', label: 'Valor fixo' },
                      { value: 'percentual', label: 'Percentual do preço da venda' }
                    ]}
                  />
                  {comissaoTipo === 'fixa' ? (
                    <FormMoneyField
                      name='termosAditivo.comissaoFixaCentavos'
                      label='Remuneração fixa'
                    />
                  ) : (
                    <FormMoneyField
                      name='termosAditivo.comissaoPercentualBps'
                      label='Comissão'
                      unit='percent'
                      max={100}
                    />
                  )}
                </div>
              )}
              <FormCheckboxField
                name='termosAditivo.exclusividade'
                label='Exclusividade ajustada no aditivo'
              />
              <FormMoneyField
                name='termosAditivo.despesasAutorizadasCentavos'
                label='Novo limite total de despesas autorizadas'
                description='O limite considera também as despesas já registradas.'
              />
              <FormTextareaField
                name='termosAditivo.despesasDescricao'
                label='Finalidade e condições das despesas autorizadas'
                rows={3}
                maxLength={3000}
              />
              <FormTextField
                name='termosAditivo.localGuarda'
                label='Local de guarda ajustado'
                maxLength={500}
              />
              <FormTextareaField
                name='termosAditivo.seguro'
                label='Seguro e responsabilidades de guarda'
                rows={3}
                maxLength={2000}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormTextField
                  name='termosAditivo.cidadeAssinatura'
                  label='Cidade / UF da assinatura'
                  maxLength={180}
                />
                <FormTextField
                  name='termosAditivo.foro'
                  label='Foro pertinente ajustado'
                  maxLength={300}
                />
              </div>
              <FormTextareaField
                name='referencia'
                label='Referência do aditivo formalizado'
                description='Identifique o instrumento assinado pelas partes. A data de início e a pessoa que mantém a posse permanecem as mesmas.'
                required
                rows={3}
                maxLength={2000}
              />
            </>
          )}
          {temData && (
            <FormDateField
              name='data'
              label={
                tipo === 'devolver'
                  ? 'Data da devolução'
                  : tipo === 'vender'
                    ? 'Data da venda'
                    : 'Data da movimentação'
              }
              required
            />
          )}
          {financeiroTipo && (
            <FormMoneyField
              name='valorCentavos'
              label='Valor efetivamente movimentado'
              max={limite / 100}
              required
            />
          )}
          {tipo === 'registrar_despesa' && (
            <FormTextareaField
              name='descricao'
              label='Descrição da despesa e vínculo com a autorização'
              required
              rows={3}
              maxLength={2000}
            />
          )}
          {['ativar', 'vender'].includes(tipo) && (
            <FormTextareaField
              name='referencia'
              label='Referência do contrato formalizado'
              description='Identifique o arquivo assinado ou protocolo guardado pela loja. O registro desta referência não verifica a assinatura.'
              placeholder='Ex.: identificação do instrumento, arquivo e data da assinatura'
              required
              rows={3}
              maxLength={2000}
            />
          )}
          {financeiroTipo && (
            <FormTextareaField
              name='referencia'
              label='Referência do comprovante'
              description='Identificação do recibo, documento ou transação e onde o comprovante está guardado.'
              required
              rows={3}
              maxLength={2000}
            />
          )}
          {tipo === 'devolver' && (
            <>
              <FormTextField
                name='km'
                label='Quilometragem na devolução'
                type='number'
                min={negociacao.veiculo.km}
                required
              />
              <FormTextareaField
                name='vistoria'
                label='Estado do veículo e conferência dos itens'
                required
                rows={3}
                maxLength={5000}
              />
              <FormTextareaField
                name='pendencias'
                label='Pendências e responsáveis pelo acerto'
                placeholder='Descreva as pendências ou registre expressamente que não foram identificadas.'
                required
                rows={3}
                maxLength={5000}
              />
              <FormTextareaField
                name='referencia'
                label='Referência do termo de devolução e evidências'
                description='Identifique o documento assinado e as fotos ou laudos da conferência.'
                required
                rows={3}
                maxLength={2000}
              />
            </>
          )}
          {['encerrar', 'cancelar'].includes(tipo) && (
            <FormTextareaField
              name='notaOperacao'
              label={
                tipo === 'cancelar'
                  ? 'Motivo do cancelamento'
                  : 'Conferência do acerto e documentos de suporte'
              }
              required
              rows={4}
              maxLength={3000}
            />
          )}
        </fieldset>
        <div className='flex flex-wrap justify-end gap-2 border-t pt-4'>
          <Button type='button' variant='outline' onClick={onClose} disabled={mutation.isPending}>
            Voltar
          </Button>
          <form.SubmitButton disabled={pendencias.length > 0 || mutation.isPending}>
            <Icons.check /> Confirmar registro
          </form.SubmitButton>
        </div>
      </form.Form>
    </form.AppForm>
  );
}

export default function OperacaoActions({
  negociacao,
  onUpdated,
  disabled = false
}: OperacaoActionsProps) {
  const [selected, setSelected] = useState<Acao | null>(null);
  const acoes = acoesDisponiveis(negociacao);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Andamento e movimentações</CardTitle>
        <CardDescription>
          Registre cada fato com sua data e referência documental para manter o histórico da
          negociação.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isEncerrada(negociacao) ? (
          <p className='text-muted-foreground flex items-center gap-2 text-sm'>
            <Icons.check /> Operação encerrada. Documentos e histórico continuam disponíveis.
          </p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {acoes.map((tipo) => (
              <Button
                key={tipo}
                type='button'
                variant='outline'
                disabled={disabled}
                onClick={() => setSelected(tipo)}
              >
                {tipo === 'cancelar' ? <Icons.close /> : <Icons.add />}
                {tipo === 'registrar_recebimento' && negociacao.modalidade === 'intermediacao'
                  ? 'Registrar recebimento pelo vendedor'
                  : TITULOS[tipo]}
              </Button>
            ))}
          </div>
        )}
        <Dialog
          open={selected !== null}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-2xl'>
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>{TITULOS[selected]}</DialogTitle>
                  <DialogDescription>{DESCRICOES[selected]}</DialogDescription>
                </DialogHeader>
                <AcaoForm
                  key={`${negociacao.id}:${selected}`}
                  tipo={selected}
                  negociacao={negociacao}
                  onUpdated={onUpdated}
                  onClose={() => setSelected(null)}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
