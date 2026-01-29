export function msFromJwtExpires(expiresIn: string): number {
  const value = parseInt(expiresIn);
  if (expiresIn.endsWith('d')) return value * 24 * 60 * 60 * 1000;
  if (expiresIn.endsWith('h')) return value * 60 * 60 * 1000;
  if (expiresIn.endsWith('m')) return value * 60 * 1000;
  if (expiresIn.endsWith('s')) return value * 1000;
  return value * 1000;
}
