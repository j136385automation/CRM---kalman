import PageContainer from '@/components/layout/page-container';
import NegociacoesScreen from '@/features/consignacao/components/negociacoes-screen';
import { MODALIDADE_LABELS } from '@/features/consignacao/lib/presentation';
import type { ModalidadeNegociacao } from '@/features/consignacao/api/types';

export const metadata = { title: 'Nova negociação | CRM Kalman' };

export default async function Page({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const modalidade =
    typeof params.modalidade === 'string' && Object.hasOwn(MODALIDADE_LABELS, params.modalidade)
      ? (params.modalidade as ModalidadeNegociacao)
      : 'consignacao_estimatoria';
  const veiculo = typeof params.veiculo === 'string' ? Number(params.veiculo) : undefined;
  const estoqueId = veiculo && Number.isSafeInteger(veiculo) && veiculo > 0 ? veiculo : undefined;
  return (
    <PageContainer
      pageTitle='Nova negociação'
      pageDescription='Preencha uma vez os dados da loja, das partes e do veículo para gerar os documentos da operação.'
    >
      <NegociacoesScreen view='nova' defaultModalidade={modalidade} estoqueId={estoqueId} />
    </PageContainer>
  );
}
