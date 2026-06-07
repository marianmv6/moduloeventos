export const TRATATIVA_ANEXOS_MAX_SLOTS = 3;

export const TRATATIVA_ANEXOS_ACCEPT = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';

export const TRATATIVA_ANEXOS_IMAGE_MAX_BYTES = 250 * 1024;
export const TRATATIVA_ANEXOS_PDF_MAX_BYTES = 2 * 1024 * 1024;

export const TRATATIVA_ANEXOS_ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

export function isTratativaAnexoImage(mimeType: string): boolean {
  return mimeType === 'image/jpeg' || mimeType === 'image/png';
}

export function isTratativaAnexoPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
