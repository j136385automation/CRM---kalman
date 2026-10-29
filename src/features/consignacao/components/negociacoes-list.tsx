'use client';

import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsString, useQueryStates } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { negociacoesQueryOptions } from '../api/queries';
import { calcularResumoFinanceiro } from '../domain/negociacao';
import {
  formatCentavos,
  formatData,
  hojeBrasil,
  MODALIDADE_LABELS,
  MODALIDADES_CONSIGNACAO,
  STATUS_LABELS
} from '../lib/presentation';
import type { NegociacoesViewContext } from './negociacoes-gate';

export default function NegociacoesList({
  context,
  somenteConsignacoes = false
}: {
  context: NegociacoesViewContext;
  somenteConsignacoes?: boolean;
}) {
  const { data } = useSuspenseQuery(negociacoesQueryOptions(context.organizacaoId));
  const [filters, setFilters] = useQueryStates(
    { busca: parseAsString.withDefault(''), situacao: parseAsString.withDefault('todas') },
    { shallow: true }
  );
  const negociações = data.negociacoes.filter(
    (item) => !somenteConsignacoes || MODALIDADES_CONSIGNACAO.includes(item.modalidade)
  );
  const busca = filters.busca.trim().toLocaleLowerCase('pt-BR');
  const visible = negociações.filter((item) => {
    const text = `${item.veiculo.placa} ${item.veiculo.marca} ${item.veiculo.modelo} ${item.vendedor.nome} ${item.comprador.nome}`;
    return (
      text.toLocaleLowerCase('pt-BR').includes(busca) &&
      (filters.situacao === 'todas' || item.status === filters.situacao)
    );
  });
  const today = hojeBrasil();
  const ativas = negociações.filter((item) => item.status === 'ativa');
  const vencidas = ativas.filter(
    (item) => item.condicoes.dataFim && item.condicoes.dataFim < today
  );
  const saldo = negociações.reduce(
    (sum, item) => sum + calcularResumoFinanceiro(item).saldoRepasseCentavos,
    0
  );
  const defaultKind = somenteConsignacoes ? 'consignacao_estimatoria' : 'compra_venda';

  return (
    <div className='space-y-5'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['Operações cadastradas', String(negociações.length)],
          ['Em andamento', String(ativas.length)],
          ['Prazo encerrado', String(vencidas.length)],
          ['Saldo do proprietário', formatCentavos(saldo)]
        ].map(([title, value]) => (
          <Card key={title}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>{title}</CardTitle>
            </CardHeader>
            <CardContent className='text-2xl font-semibold tabular-nums'>{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className='gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle>
                {somenteConsignacoes ? 'Veículos em consignação' : 'Negociações e documentos'}
              </CardTitle>
              <p className='text-muted-foreground mt-1 text-sm'>
                Dados das partes e do veículo reunidos em um único cadastro.
              </p>
            </div>
            <Button
              disabled={!context.canManage}
              nativeButton={false}
              render={
                <Link
                  href={`/dashboard/consignacoes/nova?modalidade=${defaultKind}`}
                  aria-label={somenteConsignacoes ? 'Nova consignação' : 'Nova negociação'}
                />
              }
            >
              <Icons.add className='size-4' />
              {somenteConsignacoes ? 'Nova consignação' : 'Nova negociação'}
            </Button>
          </div>
          <div className='grid gap-3 md:grid-cols-[1fr_220px]'>
            <div className='space-y-1.5'>
              <Label htmlFor='negociacao-busca'>Buscar veículo ou pessoa</Label>
              <Input
                id='negociacao-busca'
                placeholder='Placa, modelo, vendedor ou comprador'
                value={filters.busca}
                onChange={(event) => void setFilters({ busca: event.target.value })}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='negociacao-status'>Situação</Label>
              <Select
                value={filters.situacao}
                onValueChange={(value) => void setFilters({ situacao: value || 'todas' })}
              >
                <SelectTrigger id='negociacao-status' className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='todas'>Todas</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center'>
              <Icons.fileContract className='text-muted-foreground size-10' />
              <h3 className='font-semibold'>
                {negociações.length
                  ? 'Nenhum resultado para os filtros'
                  : 'Comece pelo cadastro da negociação'}
              </h3>
              <p className='text-muted-foreground max-w-lg text-sm'>
                Cadastre a loja, o proprietário e o veículo. Depois, escolha o modelo de contrato,
                confira a prévia e gere o documento preenchido.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Vendedor / proprietário</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((item) => {
                  const vencida =
                    item.status === 'ativa' &&
                    item.condicoes.dataFim &&
                    item.condicoes.dataFim < today;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className='font-medium'>
                          {item.veiculo.marca} {item.veiculo.modelo}
                        </div>
                        <div className='text-muted-foreground font-mono text-xs'>
                          {item.veiculo.placa || 'Placa pendente'} ·{' '}
                          {item.veiculo.anoModelo || 'Ano pendente'}
                        </div>
                      </TableCell>
                      <TableCell>{item.vendedor.nome || 'Cadastro incompleto'}</TableCell>
                      <TableCell className='text-sm'>
                        {MODALIDADE_LABELS[item.modalidade]}
                      </TableCell>
                      <TableCell>
                        <span className='whitespace-nowrap'>
                          {formatData(item.condicoes.dataFim)}
                        </span>
                        {vencida && (
                          <Badge variant='destructive' className='mt-1 block w-fit'>
                            Prazo encerrado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'liquidada' ? 'default' : 'outline'}>
                          {STATUS_LABELS[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.documentos.length}</TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          nativeButton={false}
                          render={
                            <Link
                              href={`/dashboard/consignacoes/${item.id}`}
                              aria-label={`Abrir negociação ${item.veiculo.placa}`}
                            />
                          }
                        >
                          Abrir
                          <Icons.arrowRight className='size-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
