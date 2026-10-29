'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { scrollToFirstError, useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getQueryClient } from '@/lib/query-client';
import { getVeiculoById } from '@/features/estoque/api/service';
import type { Veiculo } from '@/features/estoque/api/types';
import { emptyNegociacaoInput } from '../api/defaults';
import { createNegociacao, updateNegociacao } from '../api/service';
import { negociacaoKeys } from '../api/queries';
import type { ModalidadeNegociacao, Negociacao, NegociacaoInput } from '../api/types';
import { negociacaoSchema } from '../schemas/negociacao';
import {
  FormDateField,
  FormMoneyField,
  mensagemErro,
  type NegociacaoFormValues
} from './form-fields';
import PessoaFields from './pessoa-fields';
import EstoquePicker from './estoque-picker';

export interface NegociacaoFormProps {
  initialData?: Negociacao;
  defaultModalidade?: ModalidadeNegociacao;
  onSaved?: (negociacao: Negociacao) => void;
  disabled?: boolean;
  estoqueId?: number;
}

const MODALIDADES = [
  {
    value: 'consignacao_estimatoria',
    label: 'Consignação estimatória'
  },
  { value: 'comissao', label: 'Comissão mercantil' },
  { value: 'intermediacao', label: 'Intermediação de venda' },
  { value: 'compra_venda', label: 'Compra e venda de veículo' },
  { value: 'repasse_revenda', label: 'Repasse para revenda' }
];

const EXPLICACAO: Record<ModalidadeNegociacao, string> = {
  consignacao_estimatoria:
    'A loja recebe o veículo e assume pagar ao proprietário o preço estimado ajustado ou devolver o bem no prazo. O pagamento ao proprietário não depende de a loja vender o veículo.',
  comissao:
    'A loja negocia em nome próprio por conta do proprietário. A remuneração, as despesas autorizadas e a prestação de contas ficam expressas no contrato.',
  intermediacao:
    'A loja aproxima as partes. Comprador e vendedor celebram a venda; poderes para receber valores ou transferir o veículo exigem autorização específica.',
  compra_venda:
    'Registre vendedor, comprador, condições do veículo, preço e pagamento para preparar o contrato e o termo de entrega.',
  repasse_revenda:
    'Use quando o adquirente atua profissionalmente na revenda e compra com essa finalidade. O nome “repasse” não afasta direitos legais aplicáveis.'
};

const PAINEIS = ['loja', 'vendedor', 'comprador', 'veiculo', 'condicoes', 'venda', 'observacoes'];

function valoresIniciais(
  initialData: Negociacao | undefined,
  modalidade: ModalidadeNegociacao
): NegociacaoFormValues {
  if (!initialData) return emptyNegociacaoInput(modalidade);
  const { loja, vendedor, comprador, veiculo, condicoes, venda, observacoes } = initialData;
  return structuredClone({
    modalidade: initialData.modalidade,
    loja,
    vendedor,
    comprador,
    veiculo,
    condicoes,
    venda,
    observacoes
  });
}

export default function NegociacaoForm({
  initialData,
  defaultModalidade = 'consignacao_estimatoria',
  onSaved,
  disabled = false,
  estoqueId
}: NegociacaoFormProps) {
  const router = useRouter();
  const id = useRef(initialData?.id);
  const version = useRef(initialData?.versao ?? 0);
  const [openPanels, setOpenPanels] = useState<string[]>(['loja', 'veiculo']);
  const [serverError, setServerError] = useState('');
  const [prefillMessage, setPrefillMessage] = useState('');
  const termsLocked = !!initialData && initialData.status !== 'rascunho';
  const readOnly =
    disabled || (!!initialData && !['rascunho', 'ativa'].includes(initialData.status));

  const saveMutation = useMutation({
    mutationFn: (values: NegociacaoInput) =>
      id.current ? updateNegociacao(id.current, version.current, values) : createNegociacao(values),
    onSuccess: (negociacao) => {
      id.current = negociacao.id;
      version.current = negociacao.versao;
      form.reset(valoresIniciais(negociacao, negociacao.modalidade));
      void getQueryClient().invalidateQueries({ queryKey: negociacaoKeys.all });
      toast.success('Dados da negociação salvos');
      if (onSaved) onSaved(negociacao);
      else router.push(`/dashboard/consignacoes/${negociacao.id}`);
    },
    onError: (error) => {
      setServerError(mensagemErro(error));
      toast.error('Não foi possível salvar a negociação');
    }
  });

  const form = useAppForm({
    defaultValues: valoresIniciais(initialData, defaultModalidade),
    validators: { onSubmit: negociacaoSchema },
    onSubmitInvalid: () => {
      setOpenPanels(PAINEIS);
      toast.error('Revise os campos indicados antes de salvar.');
      requestAnimationFrame(scrollToFirstError);
    },
    onSubmit: async ({ value }) => {
      if (readOnly) return;
      setServerError('');
      try {
        await saveMutation.mutateAsync(value);
      } catch {
        // Mutation feedback keeps the filled form available for correction/retry.
      }
    }
  });

  const modalidade = useStore(form.store, (state) => state.values.modalidade);
  const comissaoTipo = useStore(form.store, (state) => state.values.condicoes.comissaoTipo);
  const isConsignacao = ['consignacao_estimatoria', 'comissao', 'intermediacao'].includes(
    modalidade
  );
  const { FormTextField, FormTextareaField, FormSelectField, FormCheckboxField } =
    useFormFields<NegociacaoFormValues>();
  const locked = readOnly || termsLocked || saveMutation.isPending;

  const preencherVeiculo = useCallback(
    (veiculo: Veiculo) => {
      form.setFieldValue('veiculo', {
        estoqueId: veiculo.id,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        anoFabricacao: veiculo.ano,
        anoModelo: veiculo.ano,
        placa: veiculo.placa,
        chassi: veiculo.chassi,
        cor: veiculo.cor,
        km: veiculo.km,
        renavam: '',
        restricoes: '',
        avarias: '',
        acessorios: '',
        combustivel: ''
      });
      form.setFieldValue('condicoes.precoAnunciadoCentavos', Math.round(veiculo.preco * 100));
    },
    [form]
  );

  useEffect(() => {
    if (initialData || !estoqueId || disabled) return;
    let active = true;
    setPrefillMessage('Carregando o veículo selecionado…');
    void getVeiculoById(estoqueId)
      .then((veiculo) => {
        if (!active) return;
        if (!veiculo) {
          setPrefillMessage(
            'Veículo não encontrado. Selecione outro veículo ou preencha os dados.'
          );
        } else if (form.state.isDirty) {
          setPrefillMessage(
            'Seus dados já preenchidos foram preservados. Use o seletor de estoque se quiser trocar o veículo.'
          );
        } else {
          preencherVeiculo(veiculo);
          setPrefillMessage(
            'Veículo carregado. Confira os anos e complete os dados de documentação e vistoria.'
          );
        }
      })
      .catch((error: unknown) => {
        if (active)
          setPrefillMessage(`Não foi possível carregar o veículo. ${mensagemErro(error)}`);
      });
    return () => {
      active = false;
    };
  }, [estoqueId, initialData, disabled, form, preencherVeiculo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da negociação</CardTitle>
        <CardDescription>
          Preencha uma vez para reutilizar nos contratos, anexos e registros da operação. Você pode
          salvar o cadastro e completar as informações antes de emitir os documentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='gap-6 p-0 md:p-0 [&_fieldset]:min-w-0 [&_[data-slot=select-trigger]]:max-w-full [&_[data-slot=select-trigger]]:min-w-0 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-value]]:truncate'>
            {serverError && (
              <Alert variant='destructive'>
                <Icons.warning />
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            {termsLocked && !readOnly && (
              <Alert>
                <Icons.info />
                <AlertDescription>
                  A operação está ativa. Os termos originais estão preservados; você pode completar
                  comprador, condições de venda e observações. Mudanças no acordo devem ser
                  formalizadas por aditivo.
                </AlertDescription>
              </Alert>
            )}
            <fieldset disabled={locked} className='space-y-3'>
              <FormSelectField
                name='modalidade'
                label='Modalidade da operação'
                options={MODALIDADES}
              />
              <p className='text-muted-foreground text-sm'>{EXPLICACAO[modalidade]}</p>
            </fieldset>

            <Accordion
              multiple
              value={openPanels}
              onValueChange={(value) => setOpenPanels(value as string[])}
            >
              <AccordionItem value='loja'>
                <AccordionTrigger type='button'>1. Loja e responsável</AccordionTrigger>
                <AccordionContent keepMounted>
                  <PessoaFields prefix='loja' disabled={locked} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='vendedor'>
                <AccordionTrigger type='button'>2. Proprietário / vendedor</AccordionTrigger>
                <AccordionContent keepMounted className='space-y-4'>
                  <p className='text-muted-foreground text-sm'>
                    Identifique quem tem a propriedade ou poderes comprovados para negociar o
                    veículo.
                  </p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={locked}
                    onClick={() =>
                      form.setFieldValue('vendedor', { ...form.getFieldValue('loja') })
                    }
                  >
                    Usar dados da loja como vendedora
                  </Button>
                  <PessoaFields prefix='vendedor' disabled={locked} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='comprador'>
                <AccordionTrigger type='button'>
                  3. Comprador {isConsignacao && '— preencher quando definido'}
                </AccordionTrigger>
                <AccordionContent keepMounted>
                  <PessoaFields prefix='comprador' disabled={readOnly || saveMutation.isPending} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='veiculo'>
                <AccordionTrigger type='button'>
                  4. Veículo e estado de conservação
                </AccordionTrigger>
                <AccordionContent keepMounted className='space-y-5'>
                  <EstoquePicker
                    disabled={locked}
                    onPick={(veiculo) => {
                      preencherVeiculo(veiculo);
                      setPrefillMessage('');
                      toast.success('Dados copiados. Confira os anos e complete a documentação.');
                    }}
                  />
                  {prefillMessage && (
                    <p role='status' className='text-muted-foreground text-sm'>
                      {prefillMessage}
                    </p>
                  )}
                  <fieldset disabled={locked} className='space-y-5'>
                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                      <FormTextField name='veiculo.marca' label='Marca' required maxLength={80} />
                      <FormTextField
                        name='veiculo.modelo'
                        label='Modelo / versão'
                        required
                        maxLength={160}
                      />
                      <FormTextField
                        name='veiculo.placa'
                        label='Placa'
                        placeholder='ABC1D23'
                        maxLength={10}
                      />
                      <FormTextField
                        name='veiculo.anoFabricacao'
                        label='Ano de fabricação'
                        type='number'
                        min={1886}
                        max={new Date().getFullYear() + 1}
                      />
                      <FormTextField
                        name='veiculo.anoModelo'
                        label='Ano do modelo'
                        type='number'
                        min={1886}
                        max={new Date().getFullYear() + 2}
                      />
                      <FormTextField
                        name='veiculo.km'
                        label='Quilometragem atual'
                        type='number'
                        min={0}
                        step={1}
                      />
                      <FormTextField
                        name='veiculo.chassi'
                        label='Chassi'
                        placeholder='17 caracteres'
                        maxLength={17}
                      />
                      <FormTextField
                        name='veiculo.renavam'
                        label='RENAVAM'
                        placeholder='Conforme o CRLV-e'
                        maxLength={11}
                      />
                      <FormTextField name='veiculo.cor' label='Cor' maxLength={80} />
                      <FormTextField
                        name='veiculo.combustivel'
                        label='Combustível'
                        placeholder='Ex.: flex'
                        maxLength={80}
                      />
                    </div>
                    <FormTextareaField
                      name='veiculo.restricoes'
                      label='Gravames, débitos e restrições'
                      placeholder='Descreva alienação, multas, tributos, bloqueios e responsáveis pela regularização. Se não houver, registre a verificação realizada.'
                      rows={3}
                      maxLength={5000}
                    />
                    <FormTextareaField
                      name='veiculo.avarias'
                      label='Vistoria, avarias e histórico conhecido'
                      placeholder='Registre desgaste, danos, defeitos informados, sinistros e referências de laudos ou fotos.'
                      rows={3}
                      maxLength={5000}
                    />
                    <FormTextareaField
                      name='veiculo.acessorios'
                      label='Acessórios, chaves e documentos entregues'
                      placeholder='Descreva itens e quantidades conferidos.'
                      rows={2}
                      maxLength={3000}
                    />
                  </fieldset>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='condicoes'>
                <AccordionTrigger type='button'>5. Condições da operação</AccordionTrigger>
                <AccordionContent keepMounted>
                  <fieldset disabled={locked} className='space-y-5'>
                    {isConsignacao && (
                      <>
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                          <FormMoneyField
                            name='condicoes.precoAnunciadoCentavos'
                            label='Preço anunciado'
                          />
                          <FormMoneyField
                            name='condicoes.precoMinimoCentavos'
                            label='Preço mínimo autorizado'
                          />
                          {modalidade === 'consignacao_estimatoria' && (
                            <FormMoneyField
                              name='condicoes.precoEstimadoCentavos'
                              label='Preço estimado devido ao proprietário'
                              description='Obrigação própria da loja prevista na consignação estimatória.'
                            />
                          )}
                          <FormDateField name='condicoes.dataInicio' label='Início do acordo' />
                          <FormDateField
                            name='condicoes.dataFim'
                            label='Término / prazo de devolução'
                          />
                          <FormTextField
                            name='condicoes.prazoRepasseDias'
                            label='Prazo de pagamento / repasse (dias)'
                            type='number'
                            min={0}
                            max={365}
                          />
                        </div>
                        {modalidade !== 'consignacao_estimatoria' && (
                          <div className='grid gap-4 sm:grid-cols-2'>
                            <FormSelectField
                              name='condicoes.comissaoTipo'
                              label='Forma de remuneração'
                              options={[
                                { value: 'fixa', label: 'Valor fixo' },
                                { value: 'percentual', label: 'Percentual do preço da venda' }
                              ]}
                            />
                            {comissaoTipo === 'fixa' ? (
                              <FormMoneyField
                                name='condicoes.comissaoFixaCentavos'
                                label='Remuneração fixa'
                              />
                            ) : (
                              <FormMoneyField
                                name='condicoes.comissaoPercentualBps'
                                label='Comissão'
                                unit='percent'
                                max={100}
                              />
                            )}
                          </div>
                        )}
                        <FormCheckboxField
                          name='condicoes.exclusividade'
                          label='Exclusividade expressamente ajustada entre as partes'
                        />
                        <div className='grid gap-4 sm:grid-cols-2'>
                          <FormSelectField
                            name='condicoes.posse'
                            label='Quem permanece com o veículo'
                            options={[
                              { value: 'loja', label: 'Loja' },
                              { value: 'proprietario', label: 'Proprietário' }
                            ]}
                          />
                          <FormTextField
                            name='condicoes.localGuarda'
                            label='Local de guarda'
                            maxLength={500}
                          />
                        </div>
                        <FormTextareaField
                          name='condicoes.seguro'
                          label='Seguro e responsabilidades de guarda'
                          placeholder='Seguradora, apólice, cobertura, franquia e responsáveis; registre também se não há seguro contratado.'
                          rows={3}
                          maxLength={2000}
                        />
                        <div className='grid gap-4 sm:grid-cols-2'>
                          <FormMoneyField
                            name='condicoes.despesasAutorizadasCentavos'
                            label='Limite de despesas autorizadas'
                            description='O limite não registra uma despesa nem comprova seu pagamento.'
                          />
                          <FormTextareaField
                            name='condicoes.despesasDescricao'
                            label='Quais despesas foram autorizadas'
                            placeholder='Serviços, limites, necessidade de aprovação e forma de comprovação.'
                            rows={3}
                            maxLength={3000}
                          />
                        </div>
                      </>
                    )}
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <FormTextField
                        name='condicoes.cidadeAssinatura'
                        label='Cidade / UF da assinatura'
                        placeholder='Ex.: Campinas/SP'
                        maxLength={180}
                      />
                      <FormTextField
                        name='condicoes.foro'
                        label='Foro proposto e relação com a operação'
                        placeholder='Comarca ligada às partes ou ao cumprimento da obrigação'
                        maxLength={300}
                        description='A cláusula respeita as competências obrigatórias e a proteção do consumidor.'
                      />
                    </div>
                  </fieldset>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='venda'>
                <AccordionTrigger type='button'>
                  6. Preço, pagamento e entrega ao comprador
                </AccordionTrigger>
                <AccordionContent keepMounted>
                  <fieldset disabled={readOnly || saveMutation.isPending} className='space-y-5'>
                    <p className='text-muted-foreground text-sm'>
                      Estas são as condições negociadas. A efetivação da venda, os recebimentos e os
                      repasses são registrados nas ações da operação.
                    </p>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <FormMoneyField name='venda.precoCentavos' label='Preço total de venda' />
                      <FormDateField name='venda.dataEntrega' label='Data prevista para entrega' />
                    </div>
                    <FormTextareaField
                      name='venda.formaPagamento'
                      label='Forma e condições de pagamento'
                      placeholder='Sinal, saldo, meio de pagamento, vencimentos e eventual financiamento sujeito à aprovação.'
                      rows={3}
                      maxLength={2000}
                    />
                    <FormTextField
                      name='venda.localEntrega'
                      label='Local de entrega'
                      maxLength={300}
                    />
                    {modalidade === 'repasse_revenda' && (
                      <div className='bg-muted/40 space-y-4 rounded-lg border p-4'>
                        <FormCheckboxField
                          name='venda.compradorRevendedor'
                          label='Comprador exerce profissionalmente a revenda de veículos'
                        />
                        <FormTextareaField
                          name='venda.finalidadeRevenda'
                          label='Finalidade de revenda e elementos de comprovação'
                          placeholder='Descreva a atividade do adquirente e a destinação comercial do veículo.'
                          rows={3}
                          maxLength={1000}
                        />
                      </div>
                    )}
                    <form.AppField name='venda.parcelas' mode='array'>
                      {(field) => (
                        <div className='space-y-3'>
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <h3 className='text-sm font-medium'>Cronograma de pagamento</h3>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              disabled={readOnly || field.state.value.length >= 360}
                              onClick={() =>
                                field.pushValue({ vencimento: '', valorCentavos: 0, descricao: '' })
                              }
                            >
                              <Icons.add /> Adicionar parcela
                            </Button>
                          </div>
                          <p className='text-muted-foreground text-xs'>
                            Preencha antes de emitir a venda, inclusive uma parcela para pagamento à
                            vista. A soma deve ser igual ao preço total, incluindo o sinal.
                          </p>
                          {field.state.value.map((_, index) => (
                            <div
                              key={index}
                              className='grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto]'
                            >
                              <FormDateField
                                name={`venda.parcelas[${index}].vencimento`}
                                label={`Parcela ${index + 1}: vencimento`}
                              />
                              <FormMoneyField
                                name={`venda.parcelas[${index}].valorCentavos`}
                                label='Valor'
                              />
                              <FormTextField
                                name={`venda.parcelas[${index}].descricao`}
                                label='Descrição'
                                placeholder='Ex.: sinal / saldo'
                                maxLength={300}
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                disabled={readOnly}
                                aria-label={`Remover parcela ${index + 1}`}
                                onClick={() => field.removeValue(index)}
                              >
                                <Icons.trash />
                              </Button>
                            </div>
                          ))}
                          <field.FieldError />
                        </div>
                      )}
                    </form.AppField>
                  </fieldset>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='observacoes'>
                <AccordionTrigger type='button'>7. Observações da negociação</AccordionTrigger>
                <AccordionContent keepMounted>
                  <FormTextareaField
                    name='observacoes'
                    label='Observações e condições adicionais para revisão'
                    description='Revise o conteúdo de cada documento antes da emissão. Este campo não altera sozinho um contrato já emitido.'
                    rows={4}
                    maxLength={10000}
                    disabled={readOnly || saveMutation.isPending}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className='flex flex-wrap items-center justify-between gap-3 border-t pt-5'>
              <p className='text-muted-foreground max-w-xl text-xs'>
                O cadastro salva os dados para os documentos. A emissão e os registros da operação
                ficam disponíveis após salvar.
              </p>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/consignacoes')}
                >
                  Voltar
                </Button>
                {!readOnly && (
                  <form.SubmitButton>
                    <Icons.check /> Salvar negociação
                  </form.SubmitButton>
                )}
              </div>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
