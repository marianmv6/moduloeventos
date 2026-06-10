import { CONTACT_WEEKDAYS } from '../constants/contactWeekdays';
import type { Contact, ContactDaySchedule, ContactWeekday } from '../types/risk.types';
import type { TratativaContact } from '../../operacoes/types/tratativaOcorrencia.types';
export type ContactDayScheduleState = Record<
  ContactWeekday,
  { enabled: boolean; timeStart: string; timeEnd: string }
>;

const DEFAULT_DAY_TIMES = { timeStart: '08:00', timeEnd: '17:00' };

export function createEmptyContactDayScheduleState(): ContactDayScheduleState {
  return CONTACT_WEEKDAYS.reduce((acc, { value }) => {
    acc[value] = { enabled: false, timeStart: '', timeEnd: '' };
    return acc;
  }, {} as ContactDayScheduleState);
}

export function contactDayScheduleStateFromContact(contact: Contact): ContactDayScheduleState {
  const state = createEmptyContactDayScheduleState();
  contact.weeklySchedule?.forEach((entry) => {
    state[entry.day] = {
      enabled: true,
      timeStart: entry.timeStart,
      timeEnd: entry.timeEnd,
    };
  });
  return state;
}

export function contactDayScheduleStateToWeeklySchedule(
  state: ContactDayScheduleState,
): ContactDaySchedule[] | undefined {
  const entries = CONTACT_WEEKDAYS.map(({ value }) => value)
    .filter((day) => state[day].enabled)
    .map((day) => ({
      day,
      timeStart: state[day].timeStart.trim(),
      timeEnd: state[day].timeEnd.trim(),
    }))
    .filter((entry) => entry.timeStart && entry.timeEnd);

  return entries.length ? entries : undefined;
}

export function validateContactDayScheduleState(state: ContactDayScheduleState): string | null {
  for (const { value, label } of CONTACT_WEEKDAYS) {
    const day = state[value];
    if (!day.enabled) continue;

    const startFilled = day.timeStart.trim() !== '';
    const endFilled = day.timeEnd.trim() !== '';
    if (startFilled !== endFilled) {
      return `Preencha os dois horários (início e fim) para ${label}.`;
    }
    if (!startFilled) {
      return `Informe os horários de início e fim para ${label}.`;
    }
  }
  return null;
}

export function formatWeeklyScheduleEntries(entries: ContactDaySchedule[]): string {
  return entries
    .map((entry) => {
      const short =
        CONTACT_WEEKDAYS.find((item) => item.value === entry.day)?.shortLabel ?? entry.day;
      return `${short} ${entry.timeStart}–${entry.timeEnd}`;
    })
    .join(', ');
}

export function formatContactWeeklySchedule(contact: Contact): string {
  if (contact.weeklySchedule?.length) {
    return formatWeeklyScheduleEntries(contact.weeklySchedule);
  }

  const legacyParts: string[] = [];
  if (contact.turnos?.length) {
    legacyParts.push(contact.turnos.join(', '));
  }
  if (contact.timeStart || contact.timeEnd) {
    legacyParts.push([contact.timeStart, contact.timeEnd].filter(Boolean).join('–'));
  }
  return legacyParts.length ? legacyParts.join(' ') : '—';
}

export function formatTratativaContactSchedule(contact: {
  weeklySchedule?: ContactDaySchedule[];
  shiftLabel?: string;
  shiftRange?: string;
  timeStart?: string;
  timeEnd?: string;
}): string {
  if (contact.weeklySchedule?.length) {
    return formatWeeklyScheduleEntries(contact.weeklySchedule);
  }

  if (contact.timeStart || contact.timeEnd) {
    return [contact.timeStart, contact.timeEnd].filter(Boolean).join('–');
  }

  if (contact.shiftLabel && contact.shiftRange) {
    if (contact.shiftLabel.includes(contact.shiftRange)) {
      return contact.shiftLabel;
    }
    return `${contact.shiftLabel} ${contact.shiftRange}`.trim();
  }

  return contact.shiftLabel || contact.shiftRange || '—';
}

export function mapContactToTratativaContact(contact: Contact): TratativaContact {
  return {
    id: contact.id,
    name: contact.name ?? contact.id,
    shiftLabel: formatContactWeeklySchedule(contact),
    shiftRange: '',
    weeklySchedule: contact.weeklySchedule,
    timeStart: contact.timeStart,
    timeEnd: contact.timeEnd,
    phone: contact.phone ?? '',
    email: contact.email,
    description: contact.description,
    contactPreference: contact.contactPreferences?.[0],
    contactPreferences: contact.contactPreferences,
    acceptContactOutsideHours: contact.acceptContactOutsideHours,
  };
}

export function getDefaultTimesForEnabledDay(): { timeStart: string; timeEnd: string } {
  return { ...DEFAULT_DAY_TIMES };
}
