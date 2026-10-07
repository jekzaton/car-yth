export function formatPriceInput(value: string): string {
  if (!value) return '';

  const [integerPart, decimalPart] = value.split('.');

  const formattedInteger = integerPart
    ? Number(integerPart).toLocaleString('en-US')
    : '';

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  }

  return formattedInteger;
}
