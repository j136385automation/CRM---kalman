'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KanbanColumn, KanbanColumnHandle } from '@/components/ui/kanban';
import { COLUNAS_PIPELINE, type Lead } from '../utils/store';
import { LeadCard } from './lead-card';

interface LeadColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, 'children'> {
  leads: Lead[];
}

export function LeadColumn({ value, leads, ...props }: LeadColumnProps) {
  return (
    <KanbanColumn value={value} className='w-full shrink-0 md:w-[320px]' {...props}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>{COLUNAS_PIPELINE[value] ?? value}</span>
          <Badge variant='secondary' className='pointer-events-none rounded-sm'>
            {leads.length}
          </Badge>
        </div>
        <KanbanColumnHandle render={<Button variant='ghost' size='icon' />}>
          <Icons.gripVertical className='h-4 w-4' />
        </KanbanColumnHandle>
      </div>
      <div className='flex flex-col gap-2 p-0.5'>
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} asHandle />
        ))}
      </div>
    </KanbanColumn>
  );
}
