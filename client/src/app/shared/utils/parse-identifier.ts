export const parseIdentifier = (identifier: string) => {
  const isNumeric = /^\d+$/.test(identifier);
  const parsedIdentifier = isNumeric ? parseInt(identifier, 10) : identifier;
  return parsedIdentifier;
};
