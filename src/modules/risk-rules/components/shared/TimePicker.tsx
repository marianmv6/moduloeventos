import React, { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  id: string;
  label: string;
  value: string; // "HH:mm" or ""
  onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

function parseHour(value: string): string {
  if (!value || !/^\d{1,2}(:\d{2})?$/.test(value)) return '';
  const hourPart = value.split(':')[0];
  const hour = parseInt(hourPart, 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return '';
  return hourPart.padStart(2, '0');
}

export const TimePicker: React.FC<TimePickerProps> = ({ id, label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hour = parseHour(value);
  const display = hour || '';

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const selectHour = (h: string) => {
    onChange(`${h}:00`);
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
        <span className={`time-picker__display${!hour ? ' time-picker__display--placeholder' : ''}`}>
          {display || '(Digite ou selecione)'}
        </span>
        <span className="modal-select__arrow" aria-hidden>
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L5 6 L10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
          </svg>
        </span>
      </div>
      {open && (
        <div className="modal-select__dropdown time-picker__dropdown" role="listbox">
          <div className="time-picker__list">
            {HOURS.map((h) => (
              <div
                key={h}
                role="option"
                aria-selected={hour === h}
                className={`modal-select__option ${hour === h ? 'modal-select__option--selected' : ''}`}
                onClick={() => selectHour(h)}
              >
                {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
