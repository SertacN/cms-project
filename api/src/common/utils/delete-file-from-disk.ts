import path from 'path';
import * as fs from 'fs';
export const deleteFileFromDisk = (relativeFilePath: string): void => {
  try {
    if (!relativeFilePath) return;

    // Veritabanındaki /uploads/projects/dosya.jpg yolunu sistem yoluna çevirir
    const fullPath = path.join(process.cwd(), relativeFilePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    // Silme hatası genellikle kritik değildir ama loglanmalıdır.
  }
};
