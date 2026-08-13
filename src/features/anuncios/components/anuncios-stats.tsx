import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

const stats = [
  {
    titulo: 'Anúncios ativos',
    valor: '24',
    descricao: 'em 5 canais de venda',
    icone: 'sparkles' as const
  },
  {
    titulo: 'Visualizações na semana',
    valor: '1.847',
    descricao: '+18% em relação à semana anterior',
    icone: 'trendingUp' as const
  },
  {
    titulo: 'Leads vindos de anúncios',
    valor: '18',
    descricao: 'OLX, Webmotors, Mercado Livre e redes sociais',
    icone: 'teams' as const
  }
];

export function AnunciosStats() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {stats.map((stat) => {
        const Icone = Icons[stat.icone];
        return (
          <Card key={stat.titulo}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.titulo}</CardTitle>
              <Icone className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>{stat.valor}</div>
              <p className='text-muted-foreground text-xs'>{stat.descricao}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
