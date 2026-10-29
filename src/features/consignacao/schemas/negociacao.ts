import { z } from 'zod';
import { isValidDocumento, normalizarDocumento } from '../domain/documento';

const text = (max = 2000) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);
export const centavosSchema = z
  .number()
  .int('Informe centavos inteiros.')
  .min(0)
  .max(100_000_000_000);
const positivo = centavosSchema.min(1, 'Informe um valor positivo.');

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export const dataSchema = text(10).refine(isIsoDate, 'Informe uma data válida.');
const dataOpcional = text(10).refine(
  (value) => !value || isIsoDate(value),
  'Informe uma data válida.'
);
const estados = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO'
]);

export const parteSchema = z
  .object({
    nome: text(180),
    documento: text(25)
      .transform(normalizarDocumento)
      .refine(
        (value) => !value || isValidDocumento(value),
        'CPF/CNPJ com formato ou dígitos verificadores inválidos.'
      ),
    endereco: text(300),
    cidade: text(100),
    uf: text(2)
      .transform((value) => value.toUpperCase())
      .refine((value) => !value || estados.has(value), 'Informe uma UF brasileira válida.'),
    email: text(200).refine(
      (value) => !value || z.email().safeParse(value).success,
      'E-mail inválido.'
    ),
    telefone: text(40),
    representante: text(500)
  })
  .strict();

export const negociacaoSchema = z
  .object({
    modalidade: z.enum([
      'compra_venda',
      'consignacao_estimatoria',
      'comissao',
      'intermediacao',
      'repasse_revenda'
    ]),
    loja: parteSchema,
    vendedor: parteSchema,
    comprador: parteSchema,
    veiculo: z
      .object({
        estoqueId: z.number().int().positive().optional(),
        marca: text(80).min(1, 'Informe a marca.'),
        modelo: text(160).min(1, 'Informe o modelo.'),
        anoFabricacao: z
          .number()
          .int()
          .min(1886)
          .max(new Date().getFullYear() + 1),
        anoModelo: z
          .number()
          .int()
          .min(1886)
          .max(new Date().getFullYear() + 2),
        placa: text(10)
          .transform((value) => value.replace(/[-\s]/g, '').toUpperCase())
          .refine((value) => !value || /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(value), 'Placa inválida.'),
        chassi: text(17)
          .transform((value) => value.toUpperCase())
          .refine(
            (value) => !value || /^[A-HJ-NPR-Z0-9]{17}$/.test(value),
            'Chassi deve ter 17 caracteres válidos.'
          ),
        renavam: text(11).refine(
          (value) => !value || /^\d{9,11}$/.test(value),
          'Renavam deve ter de 9 a 11 dígitos.'
        ),
        cor: text(80),
        km: z.number().int().min(0).max(10_000_000),
        combustivel: text(80),
        restricoes: text(5000),
        avarias: text(5000),
        acessorios: text(3000)
      })
      .strict(),
    condicoes: z
      .object({
        precoAnunciadoCentavos: centavosSchema,
        precoMinimoCentavos: centavosSchema,
        precoEstimadoCentavos: centavosSchema,
        comissaoTipo: z.enum(['fixa', 'percentual']),
        comissaoFixaCentavos: centavosSchema,
        comissaoPercentualBps: z.number().int().min(0).max(10000),
        dataInicio: dataOpcional,
        dataFim: dataOpcional,
        prazoRepasseDias: z.number().int().min(0).max(365),
        posse: z.enum(['loja', 'proprietario']),
        localGuarda: text(500),
        seguro: text(2000),
        exclusividade: z.boolean(),
        despesasAutorizadasCentavos: centavosSchema,
        despesasDescricao: text(3000),
        cidadeAssinatura: text(180),
        foro: text(300)
      })
      .strict(),
    venda: z
      .object({
        precoCentavos: centavosSchema,
        formaPagamento: text(2000),
        parcelas: z
          .array(
            z
              .object({
                vencimento: dataSchema,
                valorCentavos: positivo,
                descricao: text(300)
              })
              .strict()
          )
          .max(360),
        dataEntrega: dataOpcional,
        localEntrega: text(300),
        compradorRevendedor: z.boolean(),
        finalidadeRevenda: text(1000)
      })
      .strict(),
    observacoes: text(10000)
  })
  .strict()
  .superRefine((value, ctx) => {
    const c = value.condicoes;
    if (c.dataInicio && c.dataFim && c.dataFim < c.dataInicio) {
      ctx.addIssue({
        code: 'custom',
        path: ['condicoes', 'dataFim'],
        message: 'O fim não pode anteceder o início.'
      });
    }
    if (c.precoAnunciadoCentavos > 0 && c.precoMinimoCentavos > c.precoAnunciadoCentavos) {
      ctx.addIssue({
        code: 'custom',
        path: ['condicoes', 'precoMinimoCentavos'],
        message: 'O piso não pode superar o preço anunciado.'
      });
    }
    if (
      value.modalidade === 'consignacao_estimatoria' &&
      c.precoEstimadoCentavos > c.precoMinimoCentavos &&
      c.precoMinimoCentavos > 0
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['condicoes', 'precoEstimadoCentavos'],
        message: 'O preço estimado não pode superar o piso autorizado.'
      });
    }
    if (
      value.venda.parcelas.length &&
      value.venda.parcelas.reduce((sum, p) => sum + p.valorCentavos, 0) !==
        value.venda.precoCentavos
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['venda', 'parcelas'],
        message: 'As parcelas devem totalizar exatamente o preço de venda.'
      });
    }
  });

const operacao = {
  operacaoId: z.uuid(),
  data: dataSchema,
  valorCentavos: positivo,
  comprovante: text(2000).min(3, 'Identifique o comprovante da operação.')
};

export const commandSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('ativar'), contratoReferencia: text(2000).min(3) }).strict(),
  z
    .object({
      tipo: z.literal('aditar'),
      referenciaAditivo: text(2000).min(3),
      condicoes: negociacaoSchema.shape.condicoes
    })
    .strict(),
  z
    .object({ tipo: z.literal('vender'), data: dataSchema, evidenciaContrato: text(2000).min(3) })
    .strict(),
  z.object({ tipo: z.literal('registrar_recebimento'), ...operacao }).strict(),
  z.object({ tipo: z.literal('registrar_repasse'), ...operacao }).strict(),
  z
    .object({ tipo: z.literal('registrar_despesa'), ...operacao, descricao: text(2000).min(3) })
    .strict(),
  z
    .object({
      tipo: z.literal('devolver'),
      data: dataSchema,
      km: z.number().int().min(0),
      vistoria: text(5000).min(3),
      pendencias: text(5000).min(3),
      evidencia: text(2000).min(3)
    })
    .strict(),
  z.object({ tipo: z.literal('encerrar'), observacoes: text(3000).min(3) }).strict(),
  z.object({ tipo: z.literal('cancelar'), motivo: text(3000).min(3) }).strict()
]);

export const issueDocumentoSchema = z
  .object({
    modeloId: text(100).regex(/^[a-z_]+$/, 'Modelo inválido.'),
    campos: z
      .record(z.string().max(100), z.string().max(10000))
      .refine((value) => Object.keys(value).length <= 80, 'Número excessivo de campos.'),
    finalidade: z.enum(['minuta', 'emissao'])
  })
  .strict();
