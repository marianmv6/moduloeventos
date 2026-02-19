import React, { useState, useRef, useEffect } from 'react';

export interface ModalSelectOption {
  value: string;
  label: string;
  children?: ModalSelectOption[];
  /** Classe CSS aplicada ao pill da opção (ex.: cores por nível de risco) */
  pillClassName?: string;
}

interface ModalSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ModalSelectOption[];
  placeholder?: string;
  label?: string;
  /** Se true, mostra checkboxes e permite múltipla seleção (valor vira lista separada por vírgula). */
  multiple?: boolean;
  /** Exibir opções em formato hierárquico (com recuo e chevron para expandir). */
  hierarchical?: boolean;
  className?: string;
  disabled?: boolean;
}

const flattenOptions = (opts: ModalSelectOption[], level = 0): { option: ModalSelectOption; level: number }[] => {
  const result: { option: ModalSelectOption; level: number }[] = [];
  for (const o of opts) {
    result.push({ option: o, level });
    if (o.children?.length) {
      result.push(...flattenOptions(o.children, level + 1));
    }
  }
  return result;
};

export const ModalSelect: React.FC<ModalSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  label,
  multiple = false,
  hierarchical = false,
  className = '',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const displayLabel = (() => {
    if (multiple && value) {
      const vals = value.split(',').map((v) => v.trim()).filter(Boolean);
      const labels = vals.map((v) => options.flatMap((o) => (o.children ? [o, ...o.children] : [o])).find((o) => o.value === v)?.label ?? v);
      return labels.join(', ') || placeholder;
    }
    const find = (opts: ModalSelectOption[]): string | undefined => {
      for (const o of opts) {
        if (o.value === value) return o.label;
        if (o.children) {
          const found = find(o.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return find(options) ?? placeholder;
  })();

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const toggleExpand = (val: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };

  const selectValue = (opt: ModalSelectOption) => {
    if (multiple) {
      const vals = value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];
      const idx = vals.indexOf(opt.value);
      const next = idx >= 0 ? vals.filter((_, i) => i !== idx) : [...vals, opt.value];
      onChange(next.join(', '));
    } else {
      onChange(opt.value);
      setOpen(false);
    }
  };

  const isSelected = (v: string) =>
    multiple ? value.split(',').map((x) => x.trim()).includes(v) : value === v;

  const renderOption = (opt: ModalSelectOption, level = 0) => {
    const hasChildren = hierarchical && (opt.children?.length ?? 0) > 0;
    const isExp = expanded.has(opt.value);
    const selected = isSelected(opt.value);
    return (
      <div key={opt.value} className="modal-select__option-wrap">
        <div
          className={`modal-select__option ${selected ? 'modal-select__option--selected' : ''}`}
          style={hierarchical ? { paddingLeft: `${12 + level * 16}px` } : undefined}
          onClick={() => hasChildren ? toggleExpand(opt.value) : selectValue(opt)}
        >
          {multiple && (
            <span className="modal-select__checkbox" aria-hidden>
              {selected ? '☑' : '☐'}
            </span>
          )}
          <span className={`modal-select__option-pill ${opt.pillClassName ?? ''}`.trim()}>{opt.label}</span>
          {hasChildren && (
            <span className="modal-select__chevron" aria-hidden>
              {isExp ? '▼' : '▶'}
            </span>
          )}
        </div>
        {hasChildren && isExp && opt.children?.map((c) => renderOption(c, level + 1))}
      </div>
    );
  };

  return (
    <div className={`modal-select ${className}`} ref={containerRef}>
      {label && (
        <label className="modal-select__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="modal-select__input-wrap">
        <input
          id={id}
          type="text"
          className="modal-select__input"
          value={open ? search : displayLabel}
          onChange={(e) => (open ? setSearch(e.target.value) : null)}
          onFocus={() => setOpen(true)}
          onBlur={() => {}}
          readOnly={!open}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        <span className="modal-select__arrow" aria-hidden>
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L5 6 L10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
          </svg>
        </span>
      </div>
      {open && (
        <div className="modal-select__dropdown">
          {filtered.length === 0 ? (
            <div className="modal-select__empty">Nenhuma opção</div>
          ) : (
            filtered.map((o) => renderOption(o))
          )}
        </div>
      )}
    </div>
  );
};

export default ModalSelect;
