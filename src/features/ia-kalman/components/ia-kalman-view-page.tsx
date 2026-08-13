import PageContainer from '@/components/layout/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { InsightsTable } from './insights-tables';
import { formatarMoeda, insightsMock } from '../constants/insights';

export default function IaKalmanViewPage() {
  const custoTotalParado = insightsMock.reduce((acc, item) => acc + item.custoParadoDia, 0);
  const veiculosCriticos = insightsMock.filter((item) => item.diasEmEstoque > 60).length;

  return (
    <PageContainer
      pageTitle='IA Kalman'
      pageDescription='Inteligência artificial para precificação, giro de estoque e previsão de vendas'
    >
      <div className='flex flex-col gap-4'>
        <Alert>
          <Icons.sparkles className='h-4 w-4' />
          <AlertTitle>Plano IA Generativa</AlertTitle>
          <AlertDescription>
            Você está vendo uma amostra dos insights. Os recursos completos da IA Kalman —
            precificação automática, alertas em tempo real e simulações de negociação — estão
            disponíveis no plano IA Generativa.
          </AlertDescription>
        </Alert>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card className='border-primary/40 bg-primary/5'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Previsão de faturamento do mês</CardTitle>
              <Icons.trendingUp className='text-primary h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>R$ 210.000,00</div>
              <p className='text-muted-foreground text-xs'>
                Confiança de 82% com base no histórico de vendas e no estoque atual
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Custo do estoque parado</CardTitle>
              <Icons.clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>
                {formatarMoeda(custoTotalParado)}/dia
              </div>
              <p className='text-muted-foreground text-xs'>soma dos veículos monitorados pela IA</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Veículos em atenção</CardTitle>
              <Icons.warning className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>{veiculosCriticos}</div>
              <p className='text-muted-foreground text-xs'>
                parados há mais de 60 dias — sugestão de redução ativa
              </p>
            </CardContent>
          </Card>
        </div>

        <InsightsTable />
      </div>
    </PageContainer>
  );
}
