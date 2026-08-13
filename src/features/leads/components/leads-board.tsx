'use client';

import { useCallback, useRef } from 'react';
import { Kanban, KanbanBoard, KanbanOverlay } from '@/components/ui/kanban';
import { useLeadsStore } from '../utils/store';
import { LeadColumn } from './board-column';
import { LeadCard } from './lead-card';
import { createRestrictToContainer } from '../utils/restrict-to-container';

export function LeadsBoard() {
  const { columns, setColumns } = useLeadsStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- factory function, stable after mount
  const restrictToBoard = useCallback(
    createRestrictToContainer(() => containerRef.current),
    []
  );

  return (
    <div ref={containerRef}>
      <Kanban
        value={columns}
        onValueChange={setColumns}
        getItemValue={(item) => item.id}
        modifiers={[restrictToBoard]}
        autoScroll={false}
      >
        <div className='w-full overflow-x-auto rounded-md pb-4'>
          <KanbanBoard className='flex flex-col items-start gap-4 md:flex-row'>
            {Object.entries(columns).map(([columnValue, leads]) => (
              <LeadColumn key={columnValue} value={columnValue} leads={leads} />
            ))}
          </KanbanBoard>
        </div>
        <KanbanOverlay>
          {({ value, variant }) => {
            if (variant === 'column') {
              const leads = columns[value] ?? [];
              return <LeadColumn value={value} leads={leads} />;
            }

            const lead = Object.values(columns)
              .flat()
              .find((lead) => lead.id === value);

            if (!lead) return null;
            return <LeadCard lead={lead} />;
          }}
        </KanbanOverlay>
      </Kanban>
    </div>
  );
}
