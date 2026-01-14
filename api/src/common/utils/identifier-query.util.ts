/**
 * ID (number) veya SefURL (string) bilgisine göre dinamik bir WHERE objesi döner.
 * Tüm Prisma modelleriyle uyumludur.
 * * @param identifier Gelen parametre (123 veya "haber-basligi")
 * @param extraFilters Tabloya özel ek filtreler (örn: { isDeleted: false, type: 'NEWS' })
 */
export const getByIdentifier = (identifier: number | string, extraFilters: Record<string, any> = {}) => {
  const isNumeric = typeof identifier === 'number';

  return {
    ...extraFilters,
    // Eğer sayıysa ID'ye, string ise sefUrl'e eşle
    ...(isNumeric ? { id: identifier } : { sefUrl: identifier }),
  };
};
