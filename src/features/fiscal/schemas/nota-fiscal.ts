import * as z from 'zod';

export const notaFiscalSchema = z.object({
  tipo: z.string().min(1, 'Selecione o tipo da nota'),
  cliente: z.string().min(3, 'Informe o cliente ou fornecedor'),
  veiculoMarca: z.string().min(2, 'Informe a marca do veículo'),
  veiculoModelo: z.string().min(1, 'Informe o modelo do veículo'),
  veiculoAno: z
    .number({ message: 'Informe o ano do veículo' })
    .min(1950, 'Ano inválido')
    .max(2030, 'Ano inválido'),
  veiculoPlaca: z
    .string()
    .regex(/^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/, 'Placa inválida (ex.: ABC-1234 ou ABC1D23)'),
  valor: z
    .number({ message: 'Informe o valor da nota' })
    .positive('O valor deve ser maior que zero'),
  regime: z.string().min(1, 'Selecione o regime tributário')
});

export type NotaFiscalFormValues = {
  tipo: string;
  cliente: string;
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoAno: number | undefined;
  veiculoPlaca: string;
  valor: number | undefined;
  regime: string;
};
