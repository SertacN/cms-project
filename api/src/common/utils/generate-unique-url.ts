import slugify from 'slugify';

export async function generateUniqueUrl(
  title: string,
  model: any, // Prisma model delegate (örn: prisma.project)
): Promise<string> {
  const baseUrl = slugify(title, { lower: true, strict: true });

  // Veritabanında aynı SefUrl ile başlayan tüm kayıtları bul
  const similarItems = await model.findMany({
    where: { sefUrl: { startsWith: baseUrl } },
    select: { sefUrl: true },
  });

  if (similarItems.length === 0) return baseUrl;

  const regex = new RegExp(`^${baseUrl}(?:-(\\d+))?$`);

  const maxNumber = similarItems.reduce((max, item) => {
    const match = item.sefUrl.match(regex);
    if (match) {
      // "slug" ise 0, "slug-1" ise 1 döner
      const number = match[1] ? parseInt(match[1], 10) : 0;
      return number > max ? number : max;
    }
    return max;
  }, -1);

  return maxNumber > -1 ? `${baseUrl}-${maxNumber + 1}` : baseUrl;
}
