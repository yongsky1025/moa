export const toNumberParam = (
  value: string | undefined,
  name: string,
): number => {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
};

