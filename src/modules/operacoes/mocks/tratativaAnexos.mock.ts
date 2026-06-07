import type { TratativaAttachment } from '../types/tratativaOcorrencia.types';

function svgDataUrl(label: string, fill = '#E5E7EB'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300" viewBox="0 0 240 300"><rect width="240" height="300" fill="${fill}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6B7280" font-family="Arial,sans-serif" font-size="16">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const mockTratativaAnexosAuditoria: TratativaAttachment[] = [
  {
    id: 'att-1',
    name: 'evidencia-frente.jpg',
    kind: 'image',
    mimeType: 'image/jpeg',
    sizeBytes: 182_400,
    previewUrl: svgDataUrl('Evidência 1', '#D1D5DB'),
    uploadedAt: '2026-05-23T11:18:00Z',
  },
  {
    id: 'att-2',
    name: 'painel-veiculo.png',
    kind: 'image',
    mimeType: 'image/png',
    sizeBytes: 204_800,
    previewUrl: svgDataUrl('Evidência 2', '#E5E7EB'),
    uploadedAt: '2026-05-23T11:19:00Z',
  },
];

export const mockTratativaAnexosPdfSample: TratativaAttachment[] = [
  {
    id: 'att-3',
    name: 'relatorio-tratativa.pdf',
    kind: 'pdf',
    mimeType: 'application/pdf',
    sizeBytes: 512_000,
    uploadedAt: '2026-05-22T17:05:00Z',
  },
];
