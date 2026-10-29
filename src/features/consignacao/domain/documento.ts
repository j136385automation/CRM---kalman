/** Only formal check digits: validity here never proves registration or ownership. */
export function normalizarDocumento(value: string): string {
  return value.replace(/[.\-/\s]/g, '').toUpperCase();
}

function cnpjDigit(base: string): number {
  let weight = 2;
  let total = 0;
  for (let index = base.length - 1; index >= 0; index--) {
    total += (base.charCodeAt(index) - 48) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const rest = total % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isValidDocumento(value: string): boolean {
  const document = normalizarDocumento(value);
  if (/^\d{11}$/.test(document)) {
    if (/^(\d)\1+$/.test(document)) return false;
    const digit = (size: number): number => {
      const sum = Array.from(document.slice(0, size)).reduce(
        (total, item, index) => total + Number(item) * (size + 1 - index),
        0
      );
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };
    return digit(9) === Number(document[9]) && digit(10) === Number(document[10]);
  }
  if (!/^[A-Z0-9]{12}\d{2}$/.test(document) || /^(\d)\1+$/.test(document)) return false;
  // Receita Federal: alphanumeric CNPJ uses the ASCII value minus 48.
  const first = cnpjDigit(document.slice(0, 12));
  const second = cnpjDigit(document.slice(0, 12) + String(first));
  return document.endsWith(`${first}${second}`);
}

export function isCnpj(value: string): boolean {
  return /^[A-Z0-9]{12}\d{2}$/.test(normalizarDocumento(value));
}
