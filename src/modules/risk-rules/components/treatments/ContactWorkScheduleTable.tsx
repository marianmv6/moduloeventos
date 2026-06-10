import React from 'react';
import { CONTACT_WEEKDAYS } from '../../constants/contactWeekdays';
import type { ContactWeekday } from '../../types/risk.types';
import {
  getDefaultTimesForEnabledDay,
  isScheduleNextDay,
  normalizeScheduleTime,
  type ContactDayScheduleState,
} from '../../utils/contactSchedule';

interface ContactWorkScheduleTableProps {
  value: ContactDayScheduleState;
  onChange: (value: ContactDayScheduleState) => void;
}

function ScheduleNextDayCheckIcon() {
  return (
    <svg
      className="contact-work-schedule__next-day-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const ContactWorkScheduleTable: React.FC<ContactWorkScheduleTableProps> = ({
  value,
  onChange,
}) => {
  const toggleDay = (day: ContactWeekday, enabled: boolean) => {
    onChange({
      ...value,
      [day]: enabled
        ? {
            enabled: true,
            ...getDefaultTimesForEnabledDay(),
          }
        : { enabled: false, timeStart: '', timeEnd: '' },
    });
  };

  const updateDayTime = (day: ContactWeekday, field: 'timeStart' | 'timeEnd', time: string) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        [field]: time,
      },
    });
  };

  const handleTimeBlur = (day: ContactWeekday, field: 'timeStart' | 'timeEnd') => {
    const current = value[day][field];
    if (!current) return;
    const normalized = normalizeScheduleTime(current);
    if (normalized !== current) {
      updateDayTime(day, field, normalized);
    }
  };

  return (
    <div className="contact-work-schedule">
      <span className="contact-work-schedule__title">Escala de trabalho</span>
      <div className="contact-work-schedule__table-wrap">
        <table className="list-table contact-work-schedule__table">
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col">Início</th>
              <th scope="col">Fim</th>
              <th scope="col">+1 dia</th>
            </tr>
          </thead>
          <tbody>
            {CONTACT_WEEKDAYS.map(({ value: day, label }) => {
              const dayState = value[day];
              const showNextDay =
                dayState.enabled &&
                isScheduleNextDay(dayState.timeStart, dayState.timeEnd);

              return (
                <tr key={day}>
                  <th scope="row">
                    <label
                      className={`contact-work-schedule__day-label${
                        !dayState.enabled ? ' contact-work-schedule__day-label--disabled' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="contact-work-schedule__checkbox"
                        checked={dayState.enabled}
                        onChange={(event) => toggleDay(day, event.target.checked)}
                        aria-label={`Selecionar ${label}`}
                      />
                      <span>{label}</span>
                    </label>
                  </th>
                  <td>
                    <input
                      type="time"
                      className="contact-work-schedule__time-input"
                      value={dayState.timeStart}
                      min="00:00"
                      max="23:59"
                      step="60"
                      disabled={!dayState.enabled}
                      onChange={(event) => updateDayTime(day, 'timeStart', event.target.value)}
                      onBlur={() => handleTimeBlur(day, 'timeStart')}
                      aria-label={`Horário de início — ${label}`}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className="contact-work-schedule__time-input"
                      value={dayState.timeEnd}
                      min="00:00"
                      max="23:59"
                      step="60"
                      disabled={!dayState.enabled}
                      onChange={(event) => updateDayTime(day, 'timeEnd', event.target.value)}
                      onBlur={() => handleTimeBlur(day, 'timeEnd')}
                      aria-label={`Horário de fim — ${label}`}
                    />
                  </td>
                  <td className="contact-work-schedule__next-day-cell">
                    {showNextDay ? (
                      <span className="contact-work-schedule__next-day-mark" aria-label="Turno termina no dia seguinte">
                        <ScheduleNextDayCheckIcon />
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
