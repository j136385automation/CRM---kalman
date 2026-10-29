import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { CondicoesNegociacao, EventoNegociacao } from '../api/types';
import { formatCentavos, formatData } from '../lib/presentation';

function descreverCondicoes(condicoes: CondicoesNegociacao): Record<string, string> {
  return {
    'Preço anunciado': formatCentavos(condicoes.precoAnunciadoCentavos),
    'Preço mínimo autorizado': formatCentavos(condicoes.precoMinimoCentavos),
    'Preço estimado do proprietário': formatCentavos(condicoes.precoEstimadoCentavos),
    'Forma de comissão': condicoes.comissaoTipo === 'fixa' ? 'Valor fixo' : 'Percentual',
    'Comissão fixa': formatCentavos(condicoes.comissaoFixaCentavos),
    'Comissão percentual': `${(condicoes.comissaoPercentualBps / 100).toLocaleString('pt-BR')}%`,
    Início: formatData(condicoes.dataInicio),
    'Vigência final': formatData(condicoes.dataFim),
    'Prazo de repasse': `${condicoes.prazoRepasseDias} dias`,
    'Posse do veículo': condicoes.posse === 'loja' ? 'Loja' : 'Proprietário',
    'Local de guarda': condicoes.localGuarda || 'Não informado',
    Seguro: condicoes.seguro || 'Não informado',
    Exclusividade: condicoes.exclusividade ? 'Sim' : 'Não',
    'Limite de despesas': formatCentavos(condicoes.despesasAutorizadasCentavos),
    'Despesas autorizadas': condicoes.despesasDescricao || 'Não informadas',
    'Cidade de assinatura': condicoes.cidadeAssinatura || 'Não informada',
    Foro: condicoes.foro || 'Não informado'
  };
}

export default function HistoricoAditivo({
  dados
}: {
  dados: NonNullable<EventoNegociacao['dados']>;
}) {
  const anteriores = descreverCondicoes(dados.condicoesAnteriores);
  const novas = descreverCondicoes(dados.condicoesNovas);
  const alteracoes = Object.keys(anteriores).filter((campo) => anteriores[campo] !== novas[campo]);

  return (
    <details className='mt-2 text-sm'>
      <summary className='cursor-pointer'>Ver condições alteradas por este aditivo</summary>
      <p className='my-3 break-words'>Referência do aditivo: {dados.referenciaAditivo}</p>
      {alteracoes.length === 0 ? (
        <p>Nenhuma condição comercial foi alterada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Condição</TableHead>
              <TableHead>Antes</TableHead>
              <TableHead>Após o aditivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alteracoes.map((campo) => (
              <TableRow key={campo}>
                <TableCell className='whitespace-normal'>{campo}</TableCell>
                <TableCell className='max-w-sm whitespace-normal'>{anteriores[campo]}</TableCell>
                <TableCell className='max-w-sm whitespace-normal'>{novas[campo]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </details>
  );
}
