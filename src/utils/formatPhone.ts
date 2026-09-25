export function formatPhone(value?: string | null): string {
  if (!value) return '-';

  const phone = value.replace(/\D/g, '');

  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }

  return value;
}

export function formatPhoneNumber(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 10);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
}
