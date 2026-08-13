import * as z from 'zod';

export const agendamentoSchema = z.object({
  tipo: z.string().min(1, 'Selecione o tipo de agendamento'),
  cliente: z.string().min(2, 'Informe o nome do cliente'),
  veiculo: z.string().min(2, 'Informe o veículo'),
  data: z.string().min(1, 'Informe a data'),
  horario: z.string().min(1, 'Informe o horário'),
  responsavel: z.string().min(1, 'Selecione o responsável'),
  observacoes: z.string().optional()
});

export type AgendamentoFormValues = {
  tipo: string;
  cliente: string;
  veiculo: string;
  data: string;
  horario: string;
  responsavel: string;
  observacoes?: string;
};
