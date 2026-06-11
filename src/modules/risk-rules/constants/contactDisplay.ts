import type { Contact, ContactPreference } from '../types/risk.types';

export const CONTACT_PREFERENCE_OPTIONS: { value: ContactPreference; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
];

const PREFERENCE_LABELS: Record<ContactPreference, string> = {
  whatsapp: 'WhatsApp',
  ligacao: 'Ligação',
  email: 'E-mail',
};

export function contactPreferenceDisplay(c: Contact): string {
  if (!c.contactPreferences?.length) return '—';
  return c.contactPreferences.map((p) => PREFERENCE_LABELS[p] ?? p).join(', ');
}

export function contactOutsideHoursDisplay(c: Contact): string {
  if (c.acceptContactOutsideHours === undefined) return '—';
  return c.acceptContactOutsideHours ? 'Sim' : 'Não';
}

export function isWhatsAppGroupContact(c: Contact): boolean {
  return c.isWhatsAppGroup === true;
}

export const CONTACT_TYPE_LABELS = {
  individual: 'Contato individual',
  whatsapp_group: 'Grupo de WhatsApp',
} as const;

export function contactTypeDisplay(c: Contact): string {
  return c.isWhatsAppGroup ? CONTACT_TYPE_LABELS.whatsapp_group : CONTACT_TYPE_LABELS.individual;
}

/** @deprecated Use contactTypeDisplay */
export function contactGroupDisplay(c: Contact): string {
  return contactTypeDisplay(c);
}
