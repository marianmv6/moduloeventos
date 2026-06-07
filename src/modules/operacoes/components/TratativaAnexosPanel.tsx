import React, { useCallback, useRef, useState } from 'react';
import type { TratativaAttachment } from '../types/tratativaOcorrencia.types';
import {
  TRATATIVA_ANEXOS_ACCEPT,
  TRATATIVA_ANEXOS_IMAGE_MAX_BYTES,
  TRATATIVA_ANEXOS_MAX_SLOTS,
  TRATATIVA_ANEXOS_PDF_MAX_BYTES,
  TRATATIVA_ANEXOS_ALLOWED_MIME,
  isTratativaAnexoImage,
  isTratativaAnexoPdf,
} from '../constants/tratativaAnexos.constants';

const IconUpload: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 16V4M12 4L8 8M12 4L16 8"
      stroke="#169EFF"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 16V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16"
      stroke="#169EFF"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconClose: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M3 3L11 11M11 3L3 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const IconPdf: React.FC = () => (
  <svg width="40" height="48" viewBox="0 0 40 48" fill="none" aria-hidden>
    <path
      d="M8 0H26L38 12V44C38 46.2091 36.2091 48 34 48H8C5.79086 48 4 46.2091 4 44V4C4 1.79086 5.79086 0 8 0Z"
      fill="#FEE2E2"
    />
    <path d="M26 0V12H38" fill="#FECACA" />
    <text x="20" y="34" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="700">
      PDF
    </text>
  </svg>
);

const IconExpandAnexo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 21V15H5V17.6L8.1 14.5L9.5 15.9L6.4 19H9V21H3ZM15.9 9.5L14.5 8.1L17.6 5H15V3H21V9H19V6.4L15.9 9.5Z"
      fill="currentColor"
    />
  </svg>
);

const IconCollapseAnexo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
    <path
      d="M7.4 26L6 24.6L12.6 18H8V16H16V24H14V19.4L7.4 26ZM16 16V8H18V12.6L24.6 6L26 7.4L19.4 14H24V16H16Z"
      fill="currentColor"
    />
  </svg>
);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildAttachmentFromFile(file: File): TratativaAttachment | { error: string } {
  const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
  if (!TRATATIVA_ANEXOS_ALLOWED_MIME.has(mimeType)) {
    return { error: 'Formato não suportado. Use JPG, JPEG, PNG ou PDF.' };
  }
  if (isTratativaAnexoImage(mimeType) && file.size > TRATATIVA_ANEXOS_IMAGE_MAX_BYTES) {
    return { error: 'Imagens devem ter menos de 250 KB.' };
  }
  if (isTratativaAnexoPdf(mimeType) && file.size > TRATATIVA_ANEXOS_PDF_MAX_BYTES) {
    return { error: 'PDFs devem ter menos de 2 MB.' };
  }

  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    kind: isTratativaAnexoPdf(mimeType) ? 'pdf' : 'image',
    mimeType,
    sizeBytes: file.size,
    previewUrl: isTratativaAnexoImage(mimeType) ? URL.createObjectURL(file) : undefined,
    uploadedAt: new Date().toISOString(),
  };
}

interface AttachmentCardProps {
  attachment: TratativaAttachment;
  readOnly: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
}

const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  readOnly,
  expanded,
  onToggleExpand,
  onRemove,
}) => (
  <article className={`tratativa-anexos__card${expanded ? ' is-expanded' : ''}`}>
    <button
      type="button"
      className="tratativa-anexos__expand"
      aria-label={expanded ? 'Restaurar anexo' : 'Expandir anexo'}
      title={expanded ? 'Restaurar' : 'Expandir'}
      aria-pressed={expanded}
      onClick={(event) => {
        event.stopPropagation();
        onToggleExpand();
      }}
    >
      {expanded ? <IconCollapseAnexo /> : <IconExpandAnexo />}
    </button>
    {!readOnly && (
      <button
        type="button"
        className="tratativa-anexos__remove"
        onClick={onRemove}
        aria-label={`Remover ${attachment.name}`}
      >
        <IconClose />
      </button>
    )}
    {attachment.kind === 'image' && attachment.previewUrl ? (
      <img
        src={attachment.previewUrl}
        alt={attachment.name}
        className="tratativa-anexos__preview-image"
      />
    ) : (
      <div className="tratativa-anexos__pdf">
        <IconPdf />
        <span className="tratativa-anexos__pdf-name">{attachment.name}</span>
        <span className="tratativa-anexos__pdf-size">{formatFileSize(attachment.sizeBytes)}</span>
      </div>
    )}
  </article>
);

interface DropzoneSlotProps {
  slotIndex: number;
  dragOver: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onBrowse: () => void;
}

const DropzoneSlot: React.FC<DropzoneSlotProps> = ({
  slotIndex,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowse,
}) => (
  <div
    className={`tratativa-anexos__dropzone${dragOver ? ' tratativa-anexos__dropzone--active' : ''}`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    aria-label={`Espaço ${slotIndex + 1} para anexo`}
  >
    <IconUpload />
    <p className="tratativa-anexos__dropzone-text">
      <button type="button" className="tratativa-anexos__dropzone-link" onClick={onBrowse}>
        Carregar
      </button>{' '}
      ou arrastar e soltar
    </p>
    <p className="tratativa-anexos__dropzone-formats">
      JPG, JPEG, PNG menor que 250 KB ou PDF menor que 2 MB
    </p>
    <p className="tratativa-anexos__dropzone-hint">
      Anexe evidências da tratativa, como fotos do veículo ou documentos complementares.
    </p>
  </div>
);

interface TratativaAnexosPanelProps {
  attachments: TratativaAttachment[];
  onChange: (attachments: TratativaAttachment[]) => void;
  readOnly?: boolean;
  onValidationError?: (message: string) => void;
}

export const TratativaAnexosPanel: React.FC<TratativaAnexosPanelProps> = ({
  attachments,
  onChange,
  readOnly = false,
  onValidationError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetSlotRef = useRef<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const slots = Array.from({ length: TRATATIVA_ANEXOS_MAX_SLOTS }, (_, index) => attachments[index] ?? null);

  const addFiles = useCallback(
    (files: FileList | File[], slotIndex?: number) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const startSlot = slotIndex ?? attachments.length;
      let next = [...attachments];

      for (const file of list) {
        if (next.length >= TRATATIVA_ANEXOS_MAX_SLOTS) {
          onValidationError?.('Limite de 3 anexos atingido.');
          break;
        }

        const result = buildAttachmentFromFile(file);
        if ('error' in result) {
          onValidationError?.(result.error);
          continue;
        }

        const insertAt = Math.min(startSlot + (next.length - attachments.length), next.length);
        next.splice(insertAt, 0, result);
      }

      onChange(next.slice(0, TRATATIVA_ANEXOS_MAX_SLOTS));
    },
    [attachments, onChange, onValidationError],
  );

  const handleRemove = (index: number) => {
    const removed = attachments[index];
    if (removed?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    onChange(attachments.filter((_, itemIndex) => itemIndex !== index));
  };

  const openFilePicker = (slotIndex: number) => {
    targetSlotRef.current = slotIndex;
    fileInputRef.current?.click();
  };

  if (readOnly && attachments.length === 0) {
    return (
      <section className="tratativa-anexos tratativa-anexos--readonly-empty" aria-label="Anexos da tratativa">
        <h3 className="tratativa-pane__title">Anexos incluídos na tratativa</h3>
        <p className="tratativa-anexos__no-attachments">Não possui anexos</p>
      </section>
    );
  }

  return (
    <section className="tratativa-anexos" aria-label="Anexos da tratativa">
      <h3 className="tratativa-pane__title">Anexos incluídos na tratativa</h3>

      <div className={`tratativa-anexos__grid${expandedId ? ' has-expanded' : ''}`}>
        {slots.map((attachment, slotIndex) => {
          if (attachment) {
            return (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                readOnly={readOnly}
                expanded={expandedId === attachment.id}
                onToggleExpand={() =>
                  setExpandedId((current) => (current === attachment.id ? null : attachment.id))
                }
                onRemove={() => handleRemove(slotIndex)}
              />
            );
          }

          if (readOnly) {
            return (
              <div
                key={`empty-${slotIndex}`}
                className="tratativa-anexos__empty-slot"
                aria-hidden
              />
            );
          }

          return (
            <DropzoneSlot
              key={`dropzone-${slotIndex}`}
              slotIndex={slotIndex}
              dragOver={dragOverSlot === slotIndex}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverSlot(slotIndex);
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverSlot(null);
                if (event.dataTransfer.files.length > 0) {
                  addFiles(event.dataTransfer.files, slotIndex);
                }
              }}
              onBrowse={() => openFilePicker(slotIndex)}
            />
          );
        })}
      </div>

      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept={TRATATIVA_ANEXOS_ACCEPT}
          multiple
          className="tratativa-anexos__file-input"
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files, targetSlotRef.current ?? attachments.length);
            }
            event.target.value = '';
            targetSlotRef.current = null;
          }}
        />
      )}
    </section>
  );
};

export default TratativaAnexosPanel;
