export function parseNumber(value, defaultValue) {
  if (typeof value === 'undefined') {
    return defaultValue;
  }

  const cleanedValue = String(value).trim();

  const parsedValue = parseInt(cleanedValue, 10);

  if (Number.isNaN(parsedValue)) {
    return defaultValue;
  }
  return parsedValue;
}
