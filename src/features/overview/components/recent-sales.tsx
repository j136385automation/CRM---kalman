import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

const movimentacoes = [
  {
    nome: 'Carlos Almeida',
    detalhe: 'Venda — Honda Civic 2021',
    fallback: 'CA',
    valor: '+R$ 112.900,00'
  },
  {
    nome: 'Fernanda Souza',
    detalhe: 'Venda — Jeep Compass 2022',
    fallback: 'FS',
    valor: '+R$ 139.500,00'
  },
  {
    nome: 'Leilão Sodré Santoro',
    detalhe: 'Entrada — Toyota Corolla 2020',
    fallback: 'LS',
    valor: '-R$ 78.300,00'
  },
  {
    nome: 'Roberto Mendes',
    detalhe: 'Venda — VW T-Cross 2023',
    fallback: 'RM',
    valor: '+R$ 98.700,00'
  },
  {
    nome: 'Juliana Castro',
    detalhe: 'Consignação — Hyundai HB20 2021',
    fallback: 'JC',
    valor: '+R$ 64.900,00'
  }
];

export function RecentSales() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Últimas movimentações</CardTitle>
        <CardDescription>Você registrou 14 movimentações este mês.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {movimentacoes.map((mov, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback>{mov.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{mov.nome}</p>
                <p className='text-muted-foreground text-sm'>{mov.detalhe}</p>
              </div>
              <div className='ml-auto font-medium tabular-nums'>{mov.valor}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
