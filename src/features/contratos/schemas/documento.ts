import * as z from 'zod';

export const documentoSchema = z.object({
  tipo: z.string().min(1, 'Selecione o tipo de documento'),
  cliente: z.string().min(3, 'Informe o cliente'),
  veiculo: z.string().min(3, 'Informe o veículo')
});

export type DocumentoFormValues = {
  tipo: string;
  cliente: string;
  veiculo: string;
};
