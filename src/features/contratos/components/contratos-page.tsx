'use client';

import { toast } from 'sonner';
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
import { Icons } from '@/components/icons';
import { formatDateBR } from '@/lib/format';
import { DOCUMENTOS_MOCK } from '../constants/contratos';
import type { StatusDocumento } from '../constants/contratos';

const statusConfig: Record<
  StatusDocumento,
  { variant: 'default' | 'secondary' | 'outline'; icon: keyof typeof Icons }
> = {
  Assinado: { variant: 'default', icon: 'circleCheck' },
  'Pendente de assinatura': { variant: 'secondary', icon: 'clock' },
  Arquivado: { variant: 'outline', icon: 'page' }
};

const solicitarAssinatura = (cliente: string) => {
  toast.success(`Link de assinatura eletrônica enviado para ${cliente} (simulação)`);
};

export default function ContratosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos e documentos</CardTitle>
        <CardDescription>
          Contratos de compra e venda, termos de consignação, procurações, laudos e CRLV-e.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DOCUMENTOS_MOCK.map((documento) => {
              const config = statusConfig[documento.status];
              const Icon = Icons[config.icon];
              const pendente = documento.status === 'Pendente de assinatura';

              return (
                <TableRow key={documento.id}>
                  <TableCell className='font-medium whitespace-nowrap'>{documento.tipo}</TableCell>
                  <TableCell className='whitespace-nowrap'>{documento.cliente}</TableCell>
                  <TableCell className='text-muted-foreground whitespace-nowrap'>
                    {documento.veiculo}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {formatDateBR(documento.data)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className='whitespace-nowrap'>
                      <Icon />
                      {documento.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pendente}
                      onClick={() => solicitarAssinatura(documento.cliente)}
                    >
                      <Icons.userPen className='mr-2 h-4 w-4' />
                      Assinatura eletrônica
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
