import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export type OrigemLead = 'OLX' | 'WhatsApp' | 'Site' | 'Instagram' | 'Facebook';

export type Lead = {
  id: string;
  nome: string;
  veiculo: string;
  origem: OrigemLead;
  telefone?: string;
};

export const COLUNAS_PIPELINE: Record<string, string> = {
  novo: 'Novo',
  contato: 'Contato feito',
  visita: 'Visita agendada',
  proposta: 'Proposta',
  fechado: 'Fechado'
};

type LeadsState = {
  columns: Record<string, Lead[]>;
  setColumns: (columns: Record<string, Lead[]>) => void;
  addLead: (nome: string, veiculo: string, origem: OrigemLead) => void;
};

const initialColumns: Record<string, Lead[]> = {
  novo: [
    {
      id: 'lead-1',
      nome: 'Marcos Vinícius Souza',
      veiculo: 'Toyota Corolla XEi 2023',
      origem: 'OLX',
      telefone: '(11) 98812-3456'
    },
    {
      id: 'lead-2',
      nome: 'Luciana Pereira Santos',
      veiculo: 'Hyundai HB20 Platinum 2023',
      origem: 'WhatsApp',
      telefone: '(11) 97654-2198'
    },
    {
      id: 'lead-3',
      nome: 'Beatriz Mendes Oliveira',
      veiculo: 'Honda HR-V EXL 2023',
      origem: 'Site'
    }
  ],
  contato: [
    {
      id: 'lead-4',
      nome: 'Thiago Barros Cavalcanti',
      veiculo: 'Toyota Hilux SRV 2023',
      origem: 'OLX',
      telefone: '(11) 96543-7821'
    },
    {
      id: 'lead-5',
      nome: 'Ana Beatriz Cardoso',
      veiculo: 'Volkswagen T-Cross Sense 2021',
      origem: 'Instagram'
    }
  ],
  visita: [
    {
      id: 'lead-6',
      nome: 'Patrícia Gomes Ferreira',
      veiculo: 'Honda Civic Touring 2022',
      origem: 'OLX',
      telefone: '(11) 95432-1098'
    },
    {
      id: 'lead-7',
      nome: 'Eduardo Martins Ribeiro',
      veiculo: 'Chevrolet Onix Plus Premier 2024',
      origem: 'Site'
    }
  ],
  proposta: [
    {
      id: 'lead-8',
      nome: 'Roberto Nogueira Lima',
      veiculo: 'Jeep Compass Longitude 2023',
      origem: 'WhatsApp',
      telefone: '(11) 94321-8765'
    }
  ],
  fechado: [
    {
      id: 'lead-9',
      nome: 'Fábio Henrique Duarte',
      veiculo: 'Fiat Toro Volcano 2022',
      origem: 'Facebook',
      telefone: '(11) 93210-6543'
    }
  ]
};

export const useLeadsStore = create<LeadsState>()((set) => ({
  columns: initialColumns,

  setColumns: (columns) => set({ columns }),

  addLead: (nome, veiculo, origem) =>
    set((state) => ({
      columns: {
        ...state.columns,
        novo: [
          {
            id: uuid(),
            nome,
            veiculo,
            origem
          },
          ...(state.columns.novo ?? [])
        ]
      }
    }))
}));
