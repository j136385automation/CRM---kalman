import * as z from 'zod';

export const veiculoSchema = z.object({
  marca: z.string().min(1, 'Selecione a marca'),
  modelo: z.string().min(2, 'Informe o modelo (mín. 2 caracteres)'),
  ano: z
    .number({ message: 'Informe o ano' })
    .int('Ano inválido')
    .min(1960, 'Ano mínimo: 1960')
    .max(new Date().getFullYear() + 1, 'Ano não pode ser futuro'),
  placa: z
    .string()
    .min(7, 'Placa inválida')
    .max(8, 'Placa inválida')
    .regex(
      /^[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}$|^[A-Za-z]{3}-?[0-9]{4}$/,
      'Formato de placa inválido'
    ),
  chassi: z.string().length(17, 'O chassi deve ter 17 caracteres'),
  cor: z.string().min(1, 'Informe a cor'),
  km: z.number({ message: 'Informe a quilometragem' }).min(0, 'Quilometragem inválida'),
  valorCompra: z.number({ message: 'Informe o valor de compra' }).min(1, 'Valor inválido'),
  valorVenda: z.number({ message: 'Informe o valor de venda pretendido' }).min(1, 'Valor inválido'),
  origem: z.enum(['Compra', 'Consignação', 'Troca'], { message: 'Selecione a origem' }),
  observacoes: z.string().max(500, 'Máximo de 500 caracteres').optional()
});

export type VeiculoFormValues = {
  marca: string;
  modelo: string;
  ano: number | undefined;
  placa: string;
  chassi: string;
  cor: string;
  km: number | undefined;
  valorCompra: number | undefined;
  valorVenda: number | undefined;
  origem: 'Compra' | 'Consignação' | 'Troca';
  observacoes?: string;
};
