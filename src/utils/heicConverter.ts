import heic2any from 'heic2any';

/**
 * Checks if a file is HEIC or HEIF format (common in iPhone photos).
 */
export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return (
    fileType.includes('heic') ||
    fileType.includes('heif') ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif')
  );
}

/**
 * Converts a File (including HEIC) to a standard JPEG or PNG Data URL.
 */
export async function processUploadedFile(file: File): Promise<string> {
  let blobToRead: Blob = file;

  if (isHeicFile(file)) {
    try {
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92,
      });
      blobToRead = Array.isArray(converted) ? converted[0] : converted;
    } catch (err) {
      console.error('HEIC conversion failed, falling back to raw file:', err);
      blobToRead = file;
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as Data URL'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blobToRead);
  });
}

/**
 * Helper to load an HTMLImageElement from a URL string.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
