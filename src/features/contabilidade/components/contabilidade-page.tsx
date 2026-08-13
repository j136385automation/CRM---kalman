import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icons } from '@/components/icons';
import { formatCurrencyBRL, formatDateBR } from '@/lib/format';
import { IMPOSTOS_DO_MES, RELATORIOS_CONTABEIS, RESUMO_CONTABIL } from '../constants/contabilidade';

// Ícones 'calculator', 'receipt' e 'fileContract' são adicionados ao mapa Icons
// pelo contrato do SPEC; o fallback garante renderização antes do merge.
const getCardIcon = (name: string) => Icons[name as keyof typeof Icons] ?? Icons.page;

const resumoCards = [
  {
    titulo: 'Impostos a recolher',
    valor: formatCurrencyBRL(RESUMO_CONTABIL.impostosARecolher),
    descricao: 'Competência novembro/2025',
    icon: 'calculator'
  },
  {
    titulo: 'Notas pendentes',
    valor: String(RESUMO_CONTABIL.notasPendentes),
    descricao: 'Aguardando emissão ou cancelamento',
    icon: 'receipt'
  },
  {
    titulo: 'Documentos arquivados',
    valor: String(RESUMO_CONTABIL.documentosArquivados),
    descricao: 'Notas, contratos e laudos',
    icon: 'fileContract'
  }
];

export default function ContabilidadePage() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {resumoCards.map((card) => {
          const Icon = getCardIcon(card.icon);
          return (
            <Card key={card.titulo}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{card.titulo}</CardTitle>
                <Icon className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{card.valor}</div>
                <p className='text-muted-foreground text-xs'>{card.descricao}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios prontos para a contabilidade</CardTitle>
          <CardDescription>Envie direto para o seu contador ou baixe em PDF.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {RELATORIOS_CONTABEIS.map((relatorio) => (
            <div
              key={relatorio.id}
              className='flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium'>{relatorio.nome}</p>
                  <Badge variant='outline'>{relatorio.competencia}</Badge>
                </div>
                <p className='text-muted-foreground text-sm'>{relatorio.descricao}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className='inline-flex shrink-0 cursor-not-allowed'>
                        <Button variant='outline' size='sm' disabled>
                          <Icons.fileTypePdf className='mr-2 h-4 w-4' />
                          Baixar PDF
                        </Button>
                      </span>
                    }
                  />
                  <TooltipContent>Disponível no plano Básico</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impostos do mês</CardTitle>
          <CardDescription>Apuração por tipo de imposto e regime tributário.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imposto</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead className='text-right'>Base de cálculo</TableHead>
                <TableHead className='text-right'>Alíquota</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
                <TableHead className='text-right'>Vencimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {IMPOSTOS_DO_MES.map((imposto) => (
                <TableRow key={imposto.imposto}>
                  <TableCell className='font-medium'>{imposto.imposto}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{imposto.regime}</Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrencyBRL(imposto.baseCalculo)}
                  </TableCell>
                  <TableCell className='text-right'>{imposto.aliquota}</TableCell>
                  <TableCell className='text-right'>{formatCurrencyBRL(imposto.valor)}</TableCell>
                  <TableCell className='text-right'>{formatDateBR(imposto.vencimento)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
