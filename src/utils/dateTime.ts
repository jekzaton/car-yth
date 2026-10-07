export const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';

  return `${String(hour).padStart(2, '0')}:${minute}`;
});

export function getDatePart(value: string): string {
  return value ? value.split('T')[0] : '';
}

export function getTimePart(value: string): string {
  return value ? value.split('T')[1]?.slice(0, 5) || '' : '';
}

export function mergeDateTime(
  currentValue: string,
  type: 'date' | 'time',
  value: string,
): string {
  const currentDate = getDatePart(currentValue);
  const currentTime = getTimePart(currentValue);

  if (type === 'date') {
    return value && currentTime ? `${value}T${currentTime}` : value;
  }

  return currentDate && value ? `${currentDate}T${value}` : currentDate;
}
