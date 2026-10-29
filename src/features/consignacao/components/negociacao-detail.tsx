'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import DocumentosPanel from '@/features/contratos/components/documentos-panel';
import { negociacaoQueryOptions } from '../api/queries';
import { calcularResumoFinanceiro } from '../domain/negociacao';
import { formatCentavos, formatData, MODALIDADE_LABELS, STATUS_LABELS } from '../lib/presentation';
import NegociacaoForm from './negociacao-form';
import OperacaoActions from './operacao-actions';
import HistoricoAditivo from './historico-aditivo';
import type { NegociacoesViewContext } from './negociacoes-gate';

export default function NegociacaoDetail({
  context,
  id
}: {
  context: NegociacoesViewContext;
  id: string;
}) {
  const { data: negociacao } = useSuspenseQuery(negociacaoQueryOptions(context.organizacaoId, id));
  const resumo = calcularResumoFinanceiro(negociacao);
  const podeEditar = context.canManage && ['rascunho', 'ativa'].includes(negociacao.status);

  return (
    <div className='space-y-5'>
      <Card>
        <CardHeader className='gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge>{STATUS_LABELS[negociacao.status]}</Badge>
            <Badge variant='outline'>{MODALIDADE_LABELS[negociacao.modalidade]}</Badge>
            <span className='text-muted-foreground text-xs'>Versão {negociacao.versao}</span>
          </div>
          <CardTitle className='text-xl'>
            {negociacao.veiculo.marca} {negociacao.veiculo.modelo}
          </CardTitle>
          <CardDescription>
            {negociacao.veiculo.placa || 'Placa não preenchida'} ·{' '}
            {negociacao.vendedor.nome || 'Proprietário não preenchido'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OperacaoActions
            key={`${id}:${negociacao.versao}`}
            negociacao={negociacao}
            disabled={!context.canManage}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue='documentos'>
        <TabsList className='mb-3 h-auto w-full flex-wrap justify-start gap-1 sm:w-fit'>
          <TabsTrigger value='documentos'>
            <Icons.fileContract />
            Documentos
          </TabsTrigger>
          <TabsTrigger value='cadastro'>
            <Icons.userPen />
            Dados da negociação
          </TabsTrigger>
          <TabsTrigger value='acerto'>
            <Icons.cash />
            Acerto financeiro
          </TabsTrigger>
          <TabsTrigger value='historico'>
            <Icons.clock />
            Histórico
          </TabsTrigger>
        </TabsList>
        <TabsContent value='documentos'>
          <DocumentosPanel negociacao={negociacao} canManage={context.canManage} />
        </TabsContent>
        <TabsContent value='cadastro'>
          <NegociacaoForm
            key={`${id}:${negociacao.versao}`}
            initialData={negociacao}
            disabled={!podeEditar}
          />
        </TabsContent>
        <TabsContent value='acerto'>
          <div className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              {[
                ['Preço da venda', resumo.valorVendaCentavos],
                ['Recebimentos registrados', resumo.recebidoCentavos],
                ['Remuneração da loja', resumo.remuneracaoCentavos],
                ['Despesas comprovadas', resumo.despesasCentavos],
                ['Devido ao proprietário', resumo.devidoProprietarioCentavos],
                ['Repasses registrados', resumo.repassadoCentavos],
                ['Saldo a repassar', resumo.saldoRepasseCentavos],
                ['Saldo a receber', resumo.aReceberCentavos]
              ].map(([title, value]) => (
                <Card key={String(title)}>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                  </CardHeader>
                  <CardContent className='text-xl font-semibold tabular-nums'>
                    {formatCentavos(Number(value))}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Alert>
              <Icons.info />
              <AlertTitle>Registro do acerto</AlertTitle>
              <AlertDescription>
                Estes lançamentos registram valores e referências dos comprovantes. O pagamento deve
                ser realizado pelos meios acordados entre as partes. O limite de despesas autorizado
                não é uma despesa efetiva e não é descontado automaticamente.
              </AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                <CardTitle>Movimentações da negociação</CardTitle>
              </CardHeader>
              <CardContent>
                {negociacao.recebimentos.length +
                  negociacao.repasses.length +
                  negociacao.despesas.length ===
                0 ? (
                  <p className='text-muted-foreground text-sm'>
                    Nenhum recebimento, repasse ou despesa registrado.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Referência do comprovante</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ...negociacao.recebimentos.map((item) => ({
                          ...item,
                          tipo: 'Recebimento'
                        })),
                        ...negociacao.repasses.map((item) => ({
                          ...item,
                          tipo: 'Repasse ao proprietário'
                        })),
                        ...negociacao.despesas.map((item) => ({
                          ...item,
                          tipo: 'Despesa autorizada'
                        }))
                      ]
                        .toSorted((a, b) => a.data.localeCompare(b.data))
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.tipo}</TableCell>
                            <TableCell>{formatData(item.data)}</TableCell>
                            <TableCell className='whitespace-nowrap'>
                              {formatCentavos(item.valorCentavos)}
                            </TableCell>
                            <TableCell className='max-w-sm whitespace-normal'>
                              {item.comprovante}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='historico'>
          <Card>
            <CardHeader>
              <CardTitle>Histórico da operação</CardTitle>
              <CardDescription>
                Alterações e eventos registrados com data, autor e versão do cadastro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className='space-y-4'>
                {negociacao.eventos.toReversed().map((evento) => (
                  <li key={evento.id} className='border-l-2 pl-4'>
                    <p className='font-medium'>{evento.descricao}</p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {formatData(evento.data)} · Versão {evento.versao} · Autor {evento.autorId}
                    </p>
                    {evento.dados && <HistoricoAditivo dados={evento.dados} />}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
