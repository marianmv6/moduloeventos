import type { ContactWeekday } from '../types/risk.types';

export const CONTACT_WEEKDAYS: { value: ContactWeekday; label: string; shortLabel: string }[] = [
  { value: 'domingo', label: 'Domingo', shortLabel: 'Dom' },
  { value: 'segunda', label: 'Segunda-feira', shortLabel: 'Seg' },
  { value: 'terca', label: 'Terça-feira', shortLabel: 'Ter' },
  { value: 'quarta', label: 'Quarta-feira', shortLabel: 'Qua' },
  { value: 'quinta', label: 'Quinta-feira', shortLabel: 'Qui' },
  { value: 'sexta', label: 'Sexta-feira', shortLabel: 'Sex' },
  { value: 'sabado', label: 'Sábado', shortLabel: 'Sáb' },
];

export const CONTACT_WEEKDAY_LABELS: Record<ContactWeekday, string> = CONTACT_WEEKDAYS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<ContactWeekday, string>,
);

export const CONTACT_WEEKDAY_SHORT_LABELS: Record<ContactWeekday, string> = CONTACT_WEEKDAYS.reduce(
  (acc, item) => {
    acc[item.value] = item.shortLabel;
    return acc;
  },
  {} as Record<ContactWeekday, string>,
);
