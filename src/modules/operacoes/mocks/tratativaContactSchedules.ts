import type { ContactDaySchedule } from '../../risk-rules/types/risk.types';

const WEEKDAY_SCHEDULE_SEG_QUI: ContactDaySchedule[] = [
  { day: 'segunda', timeStart: '08:00', timeEnd: '17:00' },
  { day: 'terca', timeStart: '08:00', timeEnd: '17:00' },
  { day: 'quarta', timeStart: '08:00', timeEnd: '17:00' },
  { day: 'quinta', timeStart: '08:00', timeEnd: '17:00' },
  { day: 'sexta', timeStart: '08:00', timeEnd: '17:00' },
];

const WEEKDAY_SCHEDULE_TER_NOITE: ContactDaySchedule[] = [
  { day: 'terca', timeStart: '12:00', timeEnd: '22:00' },
  { day: 'quarta', timeStart: '12:00', timeEnd: '22:00' },
  { day: 'quinta', timeStart: '12:00', timeEnd: '22:00' },
  { day: 'sexta', timeStart: '12:00', timeEnd: '22:00' },
  { day: 'sabado', timeStart: '12:00', timeEnd: '22:00' },
];

const WEEKDAY_SCHEDULE_SEG_SEX_MANHA: ContactDaySchedule[] = [
  { day: 'segunda', timeStart: '06:00', timeEnd: '14:00' },
  { day: 'terca', timeStart: '06:00', timeEnd: '14:00' },
  { day: 'quarta', timeStart: '06:00', timeEnd: '14:00' },
  { day: 'quinta', timeStart: '06:00', timeEnd: '14:00' },
  { day: 'sexta', timeStart: '06:00', timeEnd: '14:00' },
];

const WEEKDAY_SCHEDULE_NOITE: ContactDaySchedule[] = [
  { day: 'domingo', timeStart: '22:00', timeEnd: '06:00' },
  { day: 'segunda', timeStart: '22:00', timeEnd: '06:00' },
  { day: 'terca', timeStart: '22:00', timeEnd: '06:00' },
  { day: 'quarta', timeStart: '22:00', timeEnd: '06:00' },
  { day: 'quinta', timeStart: '22:00', timeEnd: '06:00' },
  { day: 'sexta', timeStart: '22:00', timeEnd: '06:00' },
  { day: 'sabado', timeStart: '22:00', timeEnd: '06:00' },
];

export const MOCK_TRATATIVA_CONTACT_SCHEDULES = {
  segQui: WEEKDAY_SCHEDULE_SEG_QUI,
  terNoite: WEEKDAY_SCHEDULE_TER_NOITE,
  segSexManha: WEEKDAY_SCHEDULE_SEG_SEX_MANHA,
  noite: WEEKDAY_SCHEDULE_NOITE,
} as const;
