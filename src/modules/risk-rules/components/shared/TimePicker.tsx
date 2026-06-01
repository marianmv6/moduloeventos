import React, { useEffect, useRef, useState } from 'react';

interface TimePickerProps {
  id: string;
  label: string;
  value: string; // "HH:mm" or ""
  onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

function parseTime(value: string): { hour: string; minute: string } {
  if (!value || !/^\d{1,2}(:\d{2})?$/.test(value)) {
    return { hour: '', minute: '' };
  }
  const [hourPart, minutePart = '00'] = value.split(':');
  const hour = parseInt(hourPart, 10);
  const minute = parseInt(minutePart, 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    return { hour: '', minute: '' };
  }
  if (Number.isNaN(minute) || minute < 0 || minute > 59) {
    return { hour: hourPart.padStart(2, '0'), minute: '00' };
  }
  return {
    hour: hourPart.padStart(2, '0'),
    minute: minutePart.padStart(2, '0'),
  };
}

export const TimePicker: React.FC<TimePickerProps> = ({ id, label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const { hour, minute } = parseTime(value);
  const display = hour ? `${hour}:${minute || '00'}` : '';

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const scrollSelected = (list: HTMLDivElement | null, selected: string) => {
      if (!list || !selected) return;
      const option = list.querySelector<HTMLElement>(`[data-value="${selected}"]`);
      option?.scrollIntoView({ block: 'center' });
    };
    scrollSelected(hourListRef.current, hour);
    scrollSelected(minuteListRef.current, minute || '00');
  }, [open, hour, minute]);

  const selectHour = (h: string) => {
    onChange(`${h}:${minute || '00'}`);
  };

  const selectMinute = (m: string) => {
    onChange(`${hour || '00'}:${m}`);
    setOpen(false);
  };

  return (
    <div className="time-picker modal-select" ref={containerRef}>
      <label className="modal-select__label" htmlFor={id}>
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        id={id}
        className="modal-select__input-wrap time-picker__trigger"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`time-picker__display${!display ? ' time-picker__display--placeholder' : ''}`}>
          {display || '(Digite ou selecione)'}
        </span>
        <span className="modal-select__arrow" aria-hidden>
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 0 L5 6 L10 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          </svg>
        </span>
      </div>
      {open && (
        <div className="modal-select__dropdown time-picker__dropdown" role="listbox">
          <div className="time-picker__columns">
            <div className="time-picker__column">
              <span className="time-picker__column-label">Hora</span>
              <div className="time-picker__list" ref={hourListRef}>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    role="option"
                    data-value={h}
                    aria-selected={hour === h}
                    className={`modal-select__option ${hour === h ? 'modal-select__option--selected' : ''}`}
                    onClick={() => selectHour(h)}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
            <div className="time-picker__column">
              <span className="time-picker__column-label">Min</span>
              <div className="time-picker__list" ref={minuteListRef}>
                {MINUTES.map((m) => (
                  <div
                    key={m}
                    role="option"
                    data-value={m}
                    aria-selected={(minute || '00') === m}
                    className={`modal-select__option ${(minute || '00') === m ? 'modal-select__option--selected' : ''}`}
                    onClick={() => selectMinute(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
