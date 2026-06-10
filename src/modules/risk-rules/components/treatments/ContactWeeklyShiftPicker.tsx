import React from 'react';
import { CONTACT_WEEKDAYS } from '../../constants/contactWeekdays';
import type { ContactWeekday } from '../../types/risk.types';
import {
  getDefaultTimesForEnabledDay,
  type ContactDayScheduleState,
} from '../../utils/contactSchedule';
import { TimePicker } from '../shared/TimePicker';

interface ContactWeeklyShiftPickerProps {
  value: ContactDayScheduleState;
  onChange: (value: ContactDayScheduleState) => void;
}

export const ContactWeeklyShiftPicker: React.FC<ContactWeeklyShiftPickerProps> = ({
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

  return (
    <div className="contact-weekly-shift">
      <span className="contact-weekly-shift__title">Escala de trabalho</span>
      <div className="contact-weekly-shift__list">
        {CONTACT_WEEKDAYS.map(({ value: day, label }) => {
          const dayState = value[day];
          const expanded = dayState.enabled;

          return (
            <div
              key={day}
              className={`contact-weekly-shift__day${expanded ? ' contact-weekly-shift__day--expanded' : ''}`}
            >
              <div className="contact-weekly-shift__day-header">
                <span className="contact-weekly-shift__day-name">{label}</span>
                <label className="contact-weekly-shift__checkbox-wrap">
                  <input
                    type="checkbox"
                    className="contact-weekly-shift__checkbox"
                    checked={dayState.enabled}
                    onChange={(event) => toggleDay(day, event.target.checked)}
                    aria-label={`Selecionar ${label}`}
                  />
                </label>
              </div>
              {expanded && (
                <div className="contact-weekly-shift__day-body">
                  <TimePicker
                    id={`contact-shift-${day}-start`}
                    label="Horário início"
                    value={dayState.timeStart}
                    onChange={(time) => updateDayTime(day, 'timeStart', time)}
                  />
                  <TimePicker
                    id={`contact-shift-${day}-end`}
                    label="Horário fim"
                    value={dayState.timeEnd}
                    onChange={(time) => updateDayTime(day, 'timeEnd', time)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
