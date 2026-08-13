// Estimativas de impostos para simulação de emissão de nota fiscal.
// Simples Nacional: DAS unificado (Anexo I — comércio, alíquota efetiva estimada).
// Regime Normal: lucro presumido (PIS 0,65% + COFINS 3%) + ICMS interno (18%).

export type ImpostoEstimado = {
  nome: string;
  aliquota: number;
  valor: number;
};

export type ResumoImpostos = {
  impostos: ImpostoEstimado[];
  totalImpostos: number;
  valorLiquido: number;
};

export function calcularImpostos(valor: number | undefined, regime: string): ResumoImpostos {
  const base = valor && valor > 0 ? valor : 0;

  const aliquotas: { nome: string; aliquota: number }[] =
    regime === 'Regime Normal'
      ? [
          { nome: 'ICMS', aliquota: 0.18 },
          { nome: 'PIS', aliquota: 0.0065 },
          { nome: 'COFINS', aliquota: 0.03 }
        ]
      : [{ nome: 'DAS (Simples Nacional)', aliquota: 0.06 }];

  const impostos = aliquotas.map((imposto) => ({
    nome: imposto.nome,
    aliquota: imposto.aliquota,
    valor: base * imposto.aliquota
  }));

  const totalImpostos = impostos.reduce((acc, imposto) => acc + imposto.valor, 0);

  return {
    impostos,
    totalImpostos,
    valorLiquido: base - totalImpostos
  };
}
