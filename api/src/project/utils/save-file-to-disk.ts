import path from 'path';
import * as fs from 'fs';
import { InternalServerErrorException } from '@nestjs/common';
export const saveFileToDisk = (
  buffer: Buffer,
  fileName: string,
  destination: string,
): void => {
  try {
    const uploadPath = path.join(process.cwd(), destination);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadPath, fileName), buffer);
  } catch (error) {
    console.error('Dosya yazma hatası:', error);
    throw new InternalServerErrorException('Dosya sunucuya kaydedilemedi.');
  }
};
