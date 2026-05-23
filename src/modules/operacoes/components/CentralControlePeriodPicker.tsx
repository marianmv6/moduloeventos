import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TimePicker } from '../../risk-rules/components/shared/TimePicker';

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export interface CentralControlePeriodValue {
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

interface CentralControlePeriodPickerProps {
  id: string;
  label: string;
  value: CentralControlePeriodValue;
  onChange: (value: CentralControlePeriodValue) => void;
}

function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return 'dd/mm/aa';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const dayTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const min = Math.min(startTime, endTime);
  const max = Math.max(startTime, endTime);
  return dayTime >= min && dayTime <= max;
}

function getNormalizedRange(
  start: Date | null,
  end: Date | null,
): { from: Date | null; to: Date | null } {
  if (!start || !end) {
    return { from: start, to: end };
  }
  return start <= end ? { from: start, to: end } : { from: end, to: start };
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 1.5V3M11 1.5V3M2.5 6.5H13.5M4 2.5H12C12.8284 2.5 13.5 3.17157 13.5 4V13C13.5 13.8284 12.8284 14.5 12 14.5H4C3.17157 14.5 2.5 13.8284 2.5 13V4C2.5 3.17157 3.17157 2.5 4 2.5Z"
        stroke="#667085"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const CentralControlePeriodPicker: React.FC<CentralControlePeriodPickerProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseIsoDate(value.periodoInicio) ?? new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [pendingEnd, setPendingEnd] = useState(false);

  const startDate = parseIsoDate(value.periodoInicio);
  const endDate = parseIsoDate(value.periodoFim);

  const displayValue = useMemo(() => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) {
      return `${formatDisplayDate(value.periodoInicio)} - dd/mm/aa`;
    }
    return `${formatDisplayDate(value.periodoInicio)} - ${formatDisplayDate(value.periodoFim)}`;
  }, [startDate, endDate, value.periodoInicio, value.periodoFim]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  }, [viewDate]);

  const rangeEndPreview = pendingEnd && startDate && hoverDate ? hoverDate : endDate;

  const handleDayClick = (day: Date) => {
    if (!startDate || (startDate && endDate) || !pendingEnd) {
      onChange({
        ...value,
        periodoInicio: toIsoDate(day),
        periodoFim: '',
      });
      setPendingEnd(true);
      return;
    }

    if (isSameDay(day, startDate)) return;

    const [startIso, endIso] =
      day < startDate
        ? [toIsoDate(day), toIsoDate(startDate)]
        : [value.periodoInicio, toIsoDate(day)];

    onChange({
      ...value,
      periodoInicio: startIso,
      periodoFim: endIso,
    });
    setPendingEnd(false);
    setHoverDate(null);
  };

  const getDayClass = (day: Date): string => {
    const classes = ['central-controle-period-picker__day'];
    const { from: rangeFrom, to: rangeTo } = getNormalizedRange(startDate, rangeEndPreview);

    if (rangeFrom && isSameDay(day, rangeFrom)) {
      classes.push('central-controle-period-picker__day--start');
    }

    if (rangeTo && isSameDay(day, rangeTo)) {
      classes.push('central-controle-period-picker__day--end');
      if (pendingEnd && hoverDate && isSameDay(day, hoverDate)) {
        classes.push('central-controle-period-picker__day--hover-end');
      }
    }

    if (rangeFrom && rangeTo && isBetween(day, rangeFrom, rangeTo)) {
      const isEndpoint =
        isSameDay(day, rangeFrom) || isSameDay(day, rangeTo);
      if (!isEndpoint || isSameDay(rangeFrom, rangeTo)) {
        if (!isEndpoint) {
          classes.push('central-controle-period-picker__day--in-range');
        }
      }
    }

    return classes.join(' ');
  };

  const shiftMonth = (delta: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  return (
    <div
      className={`central-controle-period-picker modal-select${open ? ' central-controle-period-picker--open' : ''}`}
      ref={containerRef}
    >
      <label className="modal-select__label" htmlFor={id}>
        {label}
      </label>
      <div
        className="modal-select__input-wrap central-controle-period-picker__trigger"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
        role="button"
        tabIndex={0}
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={`central-controle-period-picker__display${displayValue ? '' : ' central-controle-period-picker__display--placeholder'}`}
        >
          {displayValue || 'dd/mm/aa - dd/mm/aa'}
        </span>
        <span className="central-controle-period-picker__calendar-icon" aria-hidden>
          <IconCalendar />
        </span>
      </div>

      {open && (
        <div className="central-controle-period-picker__popover" role="dialog" aria-label="Selecionar período">
          <div className="central-controle-period-picker__header">
            <button type="button" className="central-controle-period-picker__month-btn">
              {MONTHS_PT[viewDate.getMonth()]} {viewDate.getFullYear()}
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden>
                <path d="M0 0L4 5L8 0" fill="#344054" />
              </svg>
            </button>
            <div className="central-controle-period-picker__nav">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">
                ‹
              </button>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Próximo mês">
                ›
              </button>
            </div>
          </div>

          <div className="central-controle-period-picker__weekdays">
            {WEEKDAYS_PT.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="central-controle-period-picker__grid">
            {calendarDays.map((day, index) =>
              day ? (
                <button
                  key={toIsoDate(day)}
                  type="button"
                  className={getDayClass(day)}
                  onMouseEnter={() => setHoverDate(day)}
                  onMouseLeave={() => setHoverDate(null)}
                  onClick={() => handleDayClick(day)}
                >
                  {day.getDate()}
                </button>
              ) : (
                <span key={`empty-${index}`} className="central-controle-period-picker__day-empty" />
              ),
            )}
          </div>

          <div className="central-controle-period-picker__times">
            <TimePicker
              id={`${id}-hora-inicio`}
              label="Horário início"
              value={value.periodoHoraInicio}
              onChange={(periodoHoraInicio) => onChange({ ...value, periodoHoraInicio })}
            />
            <TimePicker
              id={`${id}-hora-fim`}
              label="Horário fim"
              value={value.periodoHoraFim}
              onChange={(periodoHoraFim) => onChange({ ...value, periodoHoraFim })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralControlePeriodPicker;
