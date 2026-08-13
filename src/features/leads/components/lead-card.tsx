'use client';

import { Badge } from '@/components/ui/badge';
import { KanbanItem } from '@/components/ui/kanban';
import type { Lead, OrigemLead } from '../utils/store';

const origemVariant: Record<OrigemLead, 'default' | 'secondary' | 'outline'> = {
  OLX: 'default',
  WhatsApp: 'secondary',
  Site: 'outline',
  Instagram: 'secondary',
  Facebook: 'outline'
};

interface LeadCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, 'value'> {
  lead: Lead;
}

export function LeadCard({ lead, ...props }: LeadCardProps) {
  return (
    <KanbanItem
      key={lead.id}
      value={lead.id}
      {...props}
      render={<div className='bg-card rounded-md border p-3 shadow-xs' />}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-2'>
          <span className='line-clamp-1 text-sm font-medium'>{lead.nome}</span>
          <Badge
            variant={origemVariant[lead.origem]}
            className='pointer-events-none h-5 rounded-sm px-1.5 text-[11px]'
          >
            {lead.origem}
          </Badge>
        </div>
        <div className='text-muted-foreground flex items-center justify-between text-xs'>
          <span className='line-clamp-1'>{lead.veiculo}</span>
          {lead.telefone && <span className='text-[10px] tabular-nums'>{lead.telefone}</span>}
        </div>
      </div>
    </KanbanItem>
  );
}
