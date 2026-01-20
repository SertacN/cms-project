import { FileType } from '@prisma/client';

export const getFileTypeFromMime = (mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) {
    return FileType.IMAGE;
  }

  if (mimeType.startsWith('video/')) {
    return FileType.VIDEO;
  }

  return FileType.DOCUMENT;
};
