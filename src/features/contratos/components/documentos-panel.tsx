'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getQueryClient } from '@/lib/query-client';
import { issueDocumentoMutation } from '@/features/consignacao/api/mutations';
import { negociacaoKeys } from '@/features/consignacao/api/queries';
import type {
  CamposDocumento,
  DocumentoNegociacao,
  Negociacao
} from '@/features/consignacao/api/types';
import { formatCentavos, formatData, hojeBrasil } from '@/features/consignacao/lib/presentation';
import { FormDateField } from '@/features/consignacao/components/form-fields';
import { MODELOS_DOCUMENTO, renderDocumento } from '../lib/templates';
import { downloadDocumento, printDocumento } from '../lib/export';

type CamposFormValues = {
  campos: CamposDocumento;
  finalidade: 'minuta' | 'emissao';
};

function DocumentoPreview({ documento }: { documento: DocumentoNegociacao }) {
  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <Badge variant={documento.status === 'minuta' ? 'outline' : 'secondary'}>
            {documento.status === 'minuta' ? 'Minuta' : 'Emitido · assinatura pendente'}
          </Badge>
          <p className='text-muted-foreground mt-1 text-xs'>
            {formatData(documento.emitidoEm)} · Modelo {documento.versaoModelo} · Cadastro v
            {documento.snapshot.versao}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button size='sm' variant='outline' onClick={() => downloadDocumento(documento)}>
            <Icons.page className='size-4' />
            Baixar documento
          </Button>
          <Button size='sm' onClick={() => printDocumento(documento)}>
            <Icons.fileTypePdf className='size-4' />
            Imprimir / salvar PDF
          </Button>
        </div>
      </div>
      {documento.pendencias.length > 0 && (
        <Alert>
          <Icons.warning />
          <AlertTitle>Pendências desta minuta</AlertTitle>
          <AlertDescription>
            <ul className='list-disc space-y-1 pl-5'>
              {documento.pendencias.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <div className='max-h-[640px] overflow-y-auto rounded-lg border bg-white p-5 text-slate-900 md:p-9'>
        <h3 className='mb-5 font-serif text-xl font-semibold'>{documento.titulo}</h3>
        <div className='font-serif text-sm leading-7 whitespace-pre-wrap'>{documento.conteudo}</div>
      </div>
      <details className='text-muted-foreground text-xs'>
        <summary className='cursor-pointer'>Identificação e integridade do documento</summary>
        <p className='mt-2 break-all'>
          ID: {documento.id}
          <br />
          SHA-256: {documento.sha256}
        </p>
        <p className='mt-2'>
          Este registro conserva o texto e os dados usados na emissão. Não comprova assinatura
          eletrônica.
        </p>
      </details>
    </div>
  );
}

function GerarDocumentoForm({
  negociacao,
  modeloId,
  disabled,
  onIssued
}: {
  negociacao: Negociacao;
  modeloId: string;
  disabled: boolean;
  onIssued: (documento: DocumentoNegociacao) => void;
}) {
  const modelo = MODELOS_DOCUMENTO.find((item) => item.id === modeloId)!;
  const mutation = useMutation(issueDocumentoMutation);
  const form = useAppForm({
    defaultValues: {
      campos: Object.fromEntries(
        modelo.campos.map((campo) => [
          campo.chave,
          campo.chave === 'dataDocumento' ? hojeBrasil() : ''
        ])
      ),
      finalidade: 'minuta'
    } as CamposFormValues,
    onSubmit: async ({ value }) => {
      try {
        const documento = await mutation.mutateAsync({
          id: negociacao.id,
          versao: negociacao.versao,
          input: { modeloId, campos: value.campos, finalidade: value.finalidade }
        });
        onIssued(documento);
        toast.success(
          value.finalidade === 'minuta'
            ? 'Minuta salva no histórico.'
            : 'Documento emitido. A assinatura deve ser coletada separadamente.'
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o documento.');
        await getQueryClient().invalidateQueries({ queryKey: negociacaoKeys.all });
      }
    }
  });
  const { FormTextField, FormTextareaField, FormSelectField } = useFormFields<CamposFormValues>();

  return (
    <form.AppForm>
      <form.Form className='space-y-5'>
        <p className='text-muted-foreground text-sm'>{modelo.descricao}</p>
        {modelo.campos.length > 0 && (
          <fieldset disabled={disabled} className='grid gap-4 md:grid-cols-2'>
            {modelo.campos.map((campo) =>
              campo.chave === 'repasseId' ? (
                <FormSelectField
                  key={campo.chave}
                  name={`campos.${campo.chave}`}
                  label='Repasse registrado'
                  options={negociacao.repasses.map((movimento) => ({
                    value: movimento.id,
                    label: `${formatData(movimento.data)} · ${formatCentavos(movimento.valorCentavos)} · ${movimento.comprovante}`
                  }))}
                  placeholder='Selecione o pagamento ao proprietário'
                />
              ) : campo.tipo === 'textarea' ? (
                <FormTextareaField
                  key={campo.chave}
                  name={`campos.${campo.chave}`}
                  label={campo.rotulo}
                  description={campo.ajuda}
                  rows={3}
                  disabled={disabled}
                  className='md:col-span-2'
                />
              ) : campo.tipo === 'date' ? (
                <FormDateField
                  key={campo.chave}
                  name={`campos.${campo.chave}`}
                  label={campo.rotulo}
                  description={campo.ajuda}
                  disabled={disabled}
                />
              ) : (
                <FormTextField
                  key={campo.chave}
                  name={`campos.${campo.chave}`}
                  label={campo.rotulo}
                  description={campo.ajuda}
                  disabled={disabled}
                />
              )
            )}
          </fieldset>
        )}
        <form.Subscribe selector={(state) => state.values.campos}>
          {(campos) => {
            const previa = renderDocumento(negociacao, modeloId, campos);
            return (
              <div className='space-y-4'>
                {previa.pendencias.length > 0 && (
                  <Alert>
                    <Icons.info />
                    <AlertTitle>Complete os dados para emitir</AlertTitle>
                    <AlertDescription>
                      <p>
                        A minuta pode ser salva para revisão. A emissão exige resolver os itens
                        abaixo.
                      </p>
                      <ul className='mt-2 list-disc space-y-1 pl-5'>
                        {previa.pendencias.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                <details className='rounded-lg border p-4' open>
                  <summary className='cursor-pointer font-medium'>
                    Prévia do documento preenchido
                  </summary>
                  <div className='mt-4 max-h-[480px] overflow-y-auto rounded border bg-white p-5 font-serif text-sm leading-7 whitespace-pre-wrap text-slate-900'>
                    {previa.conteudo}
                  </div>
                </details>
                <p className='text-muted-foreground text-xs'>
                  Confira os dados e as condições reais. Os modelos exigem revisão jurídica adequada
                  à operação antes da assinatura.
                </p>
                <div className='flex flex-wrap justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={disabled || mutation.isPending}
                    isLoading={mutation.isPending && form.getFieldValue('finalidade') === 'minuta'}
                    onClick={() => {
                      form.setFieldValue('finalidade', 'minuta');
                      void form.handleSubmit();
                    }}
                  >
                    Salvar minuta
                  </Button>
                  <Button
                    type='button'
                    disabled={disabled || mutation.isPending || previa.pendencias.length > 0}
                    isLoading={mutation.isPending && form.getFieldValue('finalidade') === 'emissao'}
                    onClick={() => {
                      form.setFieldValue('finalidade', 'emissao');
                      void form.handleSubmit();
                    }}
                  >
                    <Icons.fileContract className='size-4' />
                    Emitir documento
                  </Button>
                </div>
              </div>
            );
          }}
        </form.Subscribe>
      </form.Form>
    </form.AppForm>
  );
}

export default function DocumentosPanel({
  negociacao,
  canManage
}: {
  negociacao: Negociacao;
  canManage: boolean;
}) {
  const modelos = MODELOS_DOCUMENTO.filter((modelo) =>
    modelo.modalidades.includes(negociacao.modalidade)
  );
  const [modeloSelecionado, setModeloId] = useState(
    modelos.find((modelo) => modelo.id === negociacao.modalidade)?.id ??
      modelos[0]?.id ??
      'compra_venda'
  );
  const modeloId = modelos.some((modelo) => modelo.id === modeloSelecionado)
    ? modeloSelecionado
    : (modelos.find((modelo) => modelo.id === negociacao.modalidade)?.id ??
      modelos[0]?.id ??
      'compra_venda');
  const [selecionado, setSelecionado] = useState<DocumentoNegociacao | null>(null);

  return (
    <div className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle>Gerar contrato ou termo</CardTitle>
          <CardDescription>
            O documento recebe os dados deste cadastro e mantém uma cópia da versão utilizada.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='modelo-documento'>Modelo</Label>
            <Select
              items={modelos.map((modelo) => ({ value: modelo.id, label: modelo.titulo }))}
              value={modeloId}
              onValueChange={(value) => {
                if (value) setModeloId(value);
              }}
            >
              <SelectTrigger id='modelo-documento' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <GerarDocumentoForm
            key={modeloId}
            negociacao={negociacao}
            modeloId={modeloId}
            disabled={!canManage}
            onIssued={setSelecionado}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de documentos</CardTitle>
          <CardDescription>
            As versões emitidas permanecem iguais mesmo que o cadastro seja atualizado.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {negociacao.documentos.length === 0 && !selecionado ? (
            <p className='text-muted-foreground text-sm'>
              Nenhum documento registrado nesta negociação.
            </p>
          ) : (
            <div className='flex flex-col gap-2'>
              {negociacao.documentos.toReversed().map((documento) => (
                <Button
                  key={documento.id}
                  variant={selecionado?.id === documento.id ? 'secondary' : 'outline'}
                  className='h-auto justify-between gap-4 py-3 text-left whitespace-normal'
                  onClick={() => setSelecionado(documento)}
                >
                  <span>
                    <span className='block font-medium'>{documento.titulo}</span>
                    <span className='text-muted-foreground text-xs'>
                      {formatData(documento.emitidoEm)}
                    </span>
                  </span>
                  <Badge variant='outline'>
                    {documento.status === 'minuta' ? 'Minuta' : 'Emitido'}
                  </Badge>
                </Button>
              ))}
            </div>
          )}
          {selecionado && <DocumentoPreview documento={selecionado} />}
        </CardContent>
      </Card>
    </div>
  );
}
