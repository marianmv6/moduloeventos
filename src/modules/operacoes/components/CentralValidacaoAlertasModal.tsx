import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import type {
  CentralAlertType,
  CentralValidationEvent,
} from '../types/operacoesCentral.types';

const ALERT_TYPE_OPTIONS: { value: CentralAlertType; label: string }[] = [
  { value: 'bocejo', label: 'Bocejo' },
  { value: 'celular', label: 'Celular' },
  { value: 'sonolencia-n1', label: 'Sonolência N1' },
  { value: 'sonolencia-n2', label: 'Sonolência N2' },
  { value: 'ausencia', label: 'Ausência' },
  { value: 'atencao-alimentacao', label: 'Atenção / Alimentação' },
  { value: 'camera-coberta', label: 'Câmera coberta' },
  { value: 'cigarro', label: 'Cigarro' },
  { value: 'camera-deslocada', label: 'Câmera deslocada' },
  { value: 'desatencao', label: 'Desatenção' },
  { value: 'nao-e-alerta', label: 'Não é um alerta' },
];

const ALERT_SECTION_BREAKS: number[] = [4, 8];

const ALERT_LABELS: Record<CentralAlertType, string> = ALERT_TYPE_OPTIONS.reduce(
  (acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  },
  {} as Record<CentralAlertType, string>,
);

const OUTROS_APONTAMENTOS_OPTIONS: { value: string; label: string }[] = [
  { value: 'camera-parcialmente-coberta', label: 'Câmera parcialmente coberta' },
  { value: 'objetos-soltos-cabine', label: 'Objetos soltos na cabine' },
  { value: 'outro-motorista', label: 'Outro motorista' },
  { value: 'sem-cinto', label: 'Sem cinto de segurança' },
  { value: 'lorem-ipsum', label: 'Lorem ipsum dolor' },
];

const DRIVER_OPTIONS: { value: string; label: string }[] = [
  { value: 'pedro-ramos', label: 'Pedro Ramos de Paula' },
  { value: 'ana-cristina', label: 'Ana Cristina dos Santos' },
  { value: 'joao-silva', label: 'João Silva Souza' },
  { value: 'lucas-mendes', label: 'Lucas Mendes Carvalho' },
];

interface CentralValidacaoAlertasModalProps {
  open: boolean;
  events: CentralValidationEvent[];
  driverName: string;
  /** Quando true, o condutor não está identificado e o campo abre para seleção na aba Informações */
  driverUnidentified?: boolean;
  onClose: () => void;
  onReturn: () => void;
  onConfirmClose: () => void;
  onConfirmNext: () => void;
  onConfirmTreat: () => void;
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const IconCloseLarge: React.FC<IconProps> = (props) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
    <path
      d="M1.5 16.5L9 9M9 9L16.5 1.5M9 9L1.5 1.5M9 9L16.5 16.5"
      stroke="#169EFF"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconCheckCircle: React.FC<IconProps> = (props) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden {...props}>
    <circle cx="7" cy="7" r="6" fill="#22C55E" />
    <path
      d="M4.25 7.25L6 9L9.75 5.25"
      stroke="#fff"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconHourglass: React.FC<IconProps> = (props) => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden {...props}>
    <path
      d="M2 1H10M2 13H10M2.5 1V4.2C2.5 4.6 2.65 4.99 2.93 5.27L5.07 7.41C5.46 7.8 5.46 8.43 5.07 8.83L2.93 10.97C2.65 11.25 2.5 11.64 2.5 12.04V13M9.5 1V4.2C9.5 4.6 9.35 4.99 9.07 5.27L6.93 7.41C6.54 7.8 6.54 8.43 6.93 8.83L9.07 10.97C9.35 11.25 9.5 11.64 9.5 12.04V13"
      stroke="#9AA1A6"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPlay: React.FC<IconProps> = (props) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden {...props}>
    <path d="M7 5.5L17 11L7 16.5V5.5Z" fill="#169EFF" />
  </svg>
);

const IconCaretDown: React.FC<IconProps> = (props) => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden {...props}>
    <path
      d="M1 1L5 5L9 1"
      stroke="#475467"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconChevronDown: React.FC<IconProps> = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M6 9l6 6 6-6"
      stroke="#475467"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCreareLogo: React.FC<IconProps> = (props) => (
  <svg
    width="92"
    height="36"
    viewBox="0 0 1539 391"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <path
      d="M1151.1 95.8698C1131.1 76.2709 1106.97 66.4011 1078.7 66.4011C1050.43 66.4011 1026.3 76.2709 1006.3 95.8698C986.303 115.469 976.303 139.203 976.303 166.938C976.303 194.802 986.303 218.536 1006.3 238C1026.3 257.604 1050.43 267.333 1078.7 267.333C1095.77 267.333 1111.24 263.734 1125.37 256.667L1114.03 235.068L1109.1 225.604L1108.83 225.203C1099.64 229.734 1089.5 232.135 1078.57 232.135C1060.17 232.135 1044.57 225.734 1031.5 213.068C1018.57 200.401 1012.03 184.938 1012.03 166.938C1012.03 149.068 1018.57 133.734 1031.5 120.938C1044.43 108.135 1060.17 101.734 1078.57 101.734C1096.97 101.734 1112.57 108.135 1125.64 120.938C1138.57 133.734 1145.1 149.068 1145.1 166.938V264.401H1181.1V166.536C1181.1 138.938 1170.97 115.333 1151.1 95.8698Z"
      fill="#9AA1A6"
    />
    <path d="M1181.1 166.401V267.203H1145.1V202.667C1158.57 192.802 1172.3 180.271 1181.1 166.401Z" fill="#9AA1A6" />
    <path
      d="M399.767 166.667C399.767 107.87 444.699 66.4011 508.032 66.4011C546.97 66.4011 578.032 82.1354 593.501 112L557.501 132.536C545.501 113.87 527.501 105.333 507.637 105.333C473.236 105.333 446.97 128.802 446.97 166.667C446.97 204.802 473.236 228 507.637 228C527.501 228 545.501 219.604 557.501 200.802L593.501 221.333C578.168 250.667 547.1 267.203 508.032 267.203C444.699 267.333 399.767 225.469 399.767 166.667Z"
      fill="#9AA1A6"
    />
    <path
      d="M740.569 66.4011V110.135C736.433 109.333 733.1 109.068 729.767 109.068C694.168 109.068 671.767 129.604 671.767 169.604V264.802H624.97V66.5365H669.501V97.3334C682.97 76.6667 707.235 66.4011 740.569 66.4011Z"
      fill="#9AA1A6"
    />
    <path
      d="M799.366 150.938H912.834C909.1 122.667 886.97 103.203 856.303 103.203C826.032 103.203 803.902 122.271 799.366 150.938ZM956.699 181.333H799.767C805.366 210 829.767 228.401 864.569 228.401C887.1 228.401 904.699 221.469 918.834 207.068L943.902 235.333C925.902 256.271 897.767 267.333 863.366 267.333C796.303 267.333 752.834 225.068 752.834 166.667C752.834 108.271 796.699 66.4011 856.168 66.4011C914.569 66.4011 957.366 106.401 957.366 167.734C957.501 171.469 957.1 176.938 956.699 181.333Z"
      fill="#9AA1A6"
    />
    <path
      d="M1322.03 66.4011V110.135C1317.9 109.333 1314.57 109.068 1311.24 109.068C1275.64 109.068 1253.24 129.604 1253.24 169.604V264.802H1206.43V66.5365H1250.97V97.3334C1264.3 76.6667 1288.7 66.4011 1322.03 66.4011Z"
      fill="#9AA1A6"
    />
    <path
      d="M1380.83 150.938H1494.3C1490.57 122.667 1468.43 103.203 1437.77 103.203C1407.37 103.203 1385.37 122.271 1380.83 150.938ZM1538.17 181.333H1381.24C1386.83 210 1411.24 228.401 1446.03 228.401C1468.57 228.401 1486.17 221.469 1500.3 207.068L1525.37 235.333C1507.37 256.271 1479.24 267.333 1444.83 267.333C1377.77 267.333 1334.3 225.068 1334.3 166.667C1334.3 108.271 1378.17 66.4011 1437.64 66.4011C1496.03 66.4011 1538.83 106.401 1538.83 167.734C1538.97 171.469 1538.57 176.938 1538.17 181.333Z"
      fill="#9AA1A6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M327.366 362.536H290.569L118.168 40.401L136.569 6C140.834 -2 151.501 -2 155.767 6L174.168 40.401L229.767 144.536L246.303 175.604L318.433 310.401L336.834 344.802C341.1 352.667 335.767 362.536 327.366 362.536Z"
      fill="#9AA1A6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M155.501 196.271L148.032 210.271L131.501 241.203L131.366 241.068L113.366 274.802C109.1 282.802 114.433 292.667 122.97 292.667H200.699C204.699 294.938 210.303 298.667 210.303 298.667L234.97 344.667C239.235 352.667 233.902 362.536 225.366 362.536H11.1001C2.56881 362.536 -2.76452 352.536 1.50111 344.667L19.9021 310.271L92.0324 175.469L108.569 144.401C112.699 136.802 123.637 136.802 127.767 144.401L150.97 187.734V187.87L155.366 196.135L155.501 196.271Z"
      fill="#9AA1A6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M275.501 362.536H264.569C260.834 362.536 257.236 360.401 255.366 356.802L159.637 176.401V176L155.366 168L105.1 73.0677C103.236 69.4688 103.236 65.0677 105.1 61.6042L110.569 51.4688L275.501 362.536Z"
      fill="#C0303A"
    />
  </svg>
);

interface AlertTypeSelectProps {
  id: string;
  value: CentralAlertType;
  onChange: (value: CentralAlertType) => void;
  showAiBadge?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const AlertTypeSelect: React.FC<AlertTypeSelectProps> = ({
  id,
  value,
  onChange,
  showAiBadge,
  placeholder,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const display = value ? ALERT_LABELS[value] : (placeholder ?? 'Selecionar');

  return (
    <div
      ref={containerRef}
      className={`central-validacao-select central-validacao-select--dropup${open ? ' central-validacao-select--open' : ''}`}
      id={id}
    >
      <button
        type="button"
        className="central-validacao-select__trigger"
        onClick={() => !disabled && setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span
          className={`central-validacao-select__value${value ? '' : ' central-validacao-select__value--placeholder'}`}
        >
          {display}
        </span>
        {showAiBadge && value && (
          <span className="central-validacao-ia-badge" aria-label="Sugerido pela IA">
            IA
          </span>
        )}
        <span className="central-validacao-select__chevron" aria-hidden>
          <IconCaretDown />
        </span>
      </button>
      {open && (
        <div className="central-validacao-select__dropdown" role="listbox">
          {ALERT_TYPE_OPTIONS.map((opt, index) => {
            const isLastOfSection = ALERT_SECTION_BREAKS.includes(index + 1);
            const selected = opt.value === value;
            return (
              <React.Fragment key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`central-validacao-select__option${selected ? ' central-validacao-select__option--selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {showAiBadge && selected && (
                    <span className="central-validacao-ia-badge" aria-hidden>
                      IA
                    </span>
                  )}
                </button>
                {isLastOfSection && (
                  <div className="central-validacao-select__divider" aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface OutrosApontamentosSelectProps {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

const OutrosApontamentosSelect: React.FC<OutrosApontamentosSelectProps> = ({
  id,
  values,
  onChange,
  placeholder,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const displayLabel = useMemo(() => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      const opt = OUTROS_APONTAMENTOS_OPTIONS.find((o) => o.value === values[0]);
      return opt?.label ?? placeholder;
    }
    return `${values.length} apontamentos`;
  }, [values, placeholder]);

  return (
    <div
      ref={containerRef}
      className={`central-validacao-select central-validacao-select--dropup${open ? ' central-validacao-select--open' : ''}`}
      id={id}
    >
      <button
        type="button"
        className="central-validacao-select__trigger"
        onClick={() => !disabled && setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span
          className={`central-validacao-select__value${values.length > 0 ? '' : ' central-validacao-select__value--placeholder'}`}
        >
          {displayLabel}
        </span>
        <span className="central-validacao-select__chevron" aria-hidden>
          <IconCaretDown />
        </span>
      </button>
      {open && (
        <div
          className="central-validacao-select__dropdown central-validacao-select__dropdown--checkbox"
          role="listbox"
        >
          {OUTROS_APONTAMENTOS_OPTIONS.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`central-validacao-checkbox-option${checked ? ' central-validacao-checkbox-option--checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleValue(opt.value)}
                />
                <span className="central-validacao-checkbox-option__box" aria-hidden>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L4 7L9 1"
                        stroke="#fff"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="central-validacao-checkbox-option__label">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const VideoTile: React.FC<{ label: string; placeholder: string }> = ({ label, placeholder }) => (
  <div className="central-validacao-video-tile" aria-label={label}>
    <span className="central-validacao-video-tile__label">{label}</span>
    <div className="central-validacao-video-tile__placeholder" aria-hidden>
      {placeholder}
    </div>
  </div>
);

const MapPanel: React.FC = () => (
  <div className="central-validacao-map" aria-label="Localização do veículo">
    <div className="central-validacao-map__bg" aria-hidden />
    <div className="central-validacao-map__pin" aria-hidden>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="11" fill="#169EFF" />
        <path d="M17 11L21 17L17 23L13 17L17 11Z" fill="#fff" />
      </svg>
    </div>
  </div>
);

interface InfoFieldProps {
  label: string;
  value?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
  <div className="central-validacao-info__field">
    <label className="central-validacao-info__label">{label}</label>
    <div className="central-validacao-info__value">{value ?? '—'}</div>
  </div>
);

interface DriverSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const DriverSelect: React.FC<DriverSelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const display = value
    ? DRIVER_OPTIONS.find((d) => d.value === value)?.label ?? value
    : 'Selecionar condutor';

  return (
    <div
      ref={containerRef}
      className={`central-validacao-info__field central-validacao-info__field--select${open ? ' is-open' : ''}`}
    >
      <label className="central-validacao-info__label">Condutor</label>
      <button
        type="button"
        className="central-validacao-info__select-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={value ? '' : 'central-validacao-info__select-placeholder'}
        >
          {display}
        </span>
        <span className="central-validacao-info__select-chevron" aria-hidden>
          <IconCaretDown />
        </span>
      </button>
      {open && (
        <div className="central-validacao-info__select-dropdown" role="listbox">
          {DRIVER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={`central-validacao-info__select-option${value === opt.value ? ' central-validacao-info__select-option--selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="central-validacao-info__section">
      <button
        type="button"
        className="central-validacao-info__section-header"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="central-validacao-info__section-title">{title}</span>
        <span
          className={`central-validacao-info__section-chevron${open ? ' central-validacao-info__section-chevron--open' : ''}`}
          aria-hidden
        >
          <IconChevronDown />
        </span>
      </button>
      {open && <div className="central-validacao-info__section-body">{children}</div>}
    </section>
  );
};

interface InfoTabProps {
  driverName: string;
  driverUnidentified?: boolean;
  selectedDriver: string;
  onChangeDriver: (value: string) => void;
}

const InfoTab: React.FC<InfoTabProps> = ({
  driverName,
  driverUnidentified,
  selectedDriver,
  onChangeDriver,
}) => (
  <div className="central-validacao-info">
    <CollapsibleSection title="Dados gerais" defaultOpen>
      <div className="central-validacao-info__grid central-validacao-info__grid--2col">
        <InfoField label="Empresa" value="Bracell" />
        <InfoField label="Filial" value="Expresso Nepomuceno" />
      </div>
      <div className="central-validacao-info__grid central-validacao-info__grid--4col">
        <InfoField label="Placa / Prefixo" value="ANB1K52" />
        {driverUnidentified ? (
          <DriverSelect value={selectedDriver} onChange={onChangeDriver} />
        ) : (
          <InfoField label="Condutor" value={driverName} />
        )}
        <InfoField label="ID da autoria" value="38868155" />
        <InfoField label="Autor de tratativa" value="Marco Romero da Costa" />
      </div>
      <div className="central-validacao-info__grid central-validacao-info__grid--4col">
        <InfoField label="Data do alerta" value="14/05/25" />
        <InfoField label="Hora" value="12:32" />
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Contatos">
      <div className="central-validacao-info__contacts">
        <p className="central-validacao-info__empty">
          Contatos cadastrados para a empresa Bracell.
        </p>
      </div>
    </CollapsibleSection>
  </div>
);

export const CentralValidacaoAlertasModal: React.FC<CentralValidacaoAlertasModalProps> = ({
  open,
  events,
  driverName,
  driverUnidentified = false,
  onClose,
  onReturn,
  onConfirmClose,
  onConfirmNext,
  onConfirmTreat,
}) => {
  const [activeTab, setActiveTab] = useState<'detalhes' | 'informacoes'>('detalhes');
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    events.forEach((event) => {
      if (event.validated) ids.add(event.id);
    });
    return ids;
  });
  const [alertTypes, setAlertTypes] = useState<Record<string, CentralAlertType>>(() => {
    const map: Record<string, CentralAlertType> = {};
    events.forEach((event) => {
      map[event.id] = event.suggestedAlert;
    });
    return map;
  });
  const [otherAnnotations, setOtherAnnotations] = useState<Record<string, string[]>>({});
  const [selectedDriver, setSelectedDriver] = useState<string>('');

  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActiveTab('detalhes');
  }, [open]);

  const totalEvents = events.length;
  const activeEvent = events[activeIndex];
  const counterLabel = activeEvent ? `Alerta ${activeIndex + 1}/${totalEvents}` : '';
  const headerTitle = activeEvent ? `${counterLabel} — ${driverName}` : driverName;

  const isLastEvent = activeIndex === totalEvents - 1;
  const isCurrentConfirmed = activeEvent ? confirmedIds.has(activeEvent.id) : false;

  /** Devolver só aparece se o analista ainda não confirmou nada nesta sessão */
  const isFirstSession = useMemo(
    () => events.every((event, idx) => idx === activeIndex || !confirmedIds.has(event.id)),
    [events, confirmedIds, activeIndex],
  );

  const setActiveAlertType = (value: CentralAlertType) => {
    if (!activeEvent) return;
    setAlertTypes((prev) => ({ ...prev, [activeEvent.id]: value }));
  };

  const setActiveOtherAnnotations = (values: string[]) => {
    if (!activeEvent) return;
    setOtherAnnotations((prev) => ({ ...prev, [activeEvent.id]: values }));
  };

  const handleConfirm = () => {
    if (!activeEvent) return;
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      next.add(activeEvent.id);
      return next;
    });
  };

  const handleSendAndNext = () => {
    if (!isCurrentConfirmed) return;
    setActiveIndex((current) => Math.min(current + 1, totalEvents - 1));
    onConfirmNext();
  };

  const handleSendAndClose = () => {
    if (!isCurrentConfirmed) return;
    onConfirmClose();
  };

  const handleSendAndTreat = () => {
    if (!isCurrentConfirmed) return;
    onConfirmTreat();
  };

  if (!open || !activeEvent) return null;

  return (
    <div
      className="central-validacao-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="central-validacao-title"
    >
      <aside className="central-validacao-sidebar" aria-label="Eventos pendentes de validação">
        <ul className="central-validacao-events-list">
          {events.map((event, index) => {
            const isActive = index === activeIndex;
            const isConfirmed = confirmedIds.has(event.id);
            return (
              <li
                key={event.id}
                className={`central-validacao-event${isActive ? ' central-validacao-event--active' : ''}${isConfirmed ? ' central-validacao-event--validated' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="central-validacao-event__btn">
                  <div className="central-validacao-event__main">
                    <span className="central-validacao-event__time">{event.time}</span>
                    <span className="central-validacao-event__plate">{event.plate}</span>
                    {(isActive || isConfirmed) && (
                      <span
                        className={`central-validacao-event__alert${!isActive && isConfirmed ? ' central-validacao-event__alert--muted' : ''}`}
                      >
                        {ALERT_LABELS[alertTypes[event.id] ?? event.suggestedAlert]}
                      </span>
                    )}
                  </div>
                  <span className="central-validacao-event__status" aria-hidden>
                    {isConfirmed ? <IconCheckCircle /> : <IconHourglass />}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="central-validacao-sidebar__logo" aria-hidden>
          <IconCreareLogo />
        </div>
      </aside>

      <section className="central-validacao-content">
        <header className="central-validacao-header">
          <h2 id="central-validacao-title" className="central-validacao-header__title">
            {headerTitle}
          </h2>
          <button
            type="button"
            className="central-validacao-header__close"
            onClick={onClose}
            aria-label="Fechar validação"
          >
            <IconCloseLarge />
          </button>
        </header>

        <nav className="central-validacao-tabs" aria-label="Abas de detalhe">
          <button
            type="button"
            className={`central-validacao-tab${activeTab === 'detalhes' ? ' central-validacao-tab--active' : ''}`}
            onClick={() => setActiveTab('detalhes')}
          >
            Detalhes
          </button>
          <button
            type="button"
            className={`central-validacao-tab${activeTab === 'informacoes' ? ' central-validacao-tab--active' : ''}`}
            onClick={() => setActiveTab('informacoes')}
          >
            Informações
          </button>
        </nav>

        {activeTab === 'detalhes' ? (
          <>
            <div className="central-validacao-body">
              <div className="central-validacao-videos" role="group" aria-label="Câmeras">
                <VideoTile label="Condutor" placeholder="Visão do condutor" />
                <VideoTile label="Frontal" placeholder="Visão frontal" />
                <VideoTile label="Cabine" placeholder="Visão cabine" />
                <VideoTile label="Lateral esquerda" placeholder="Visão lateral" />
              </div>

              <MapPanel />
            </div>

            <div className="central-validacao-controls">
              <button type="button" className="central-validacao-play" aria-label="Reproduzir">
                <IconPlay />
              </button>

              <AlertTypeSelect
                id={`alert-type-${activeEvent.id}`}
                value={alertTypes[activeEvent.id] ?? activeEvent.suggestedAlert}
                onChange={setActiveAlertType}
                showAiBadge={activeEvent.fromAi}
                disabled={isCurrentConfirmed}
              />

              <OutrosApontamentosSelect
                id={`other-annotation-${activeEvent.id}`}
                values={otherAnnotations[activeEvent.id] ?? []}
                onChange={setActiveOtherAnnotations}
                placeholder="Outros apontamentos"
                disabled={isCurrentConfirmed}
              />

              <button
                type="button"
                className="central-validacao-confirm"
                onClick={handleConfirm}
                disabled={isCurrentConfirmed}
              >
                Confirmar
              </button>
            </div>

            <div className="central-validacao-timeline" aria-hidden>
              <div className="central-validacao-timeline__bar">
                <div className="central-validacao-timeline__marker" />
              </div>
              <div className="central-validacao-timeline__labels">
                <span>00:00</span>
                <span>00:02</span>
                <span>00:04</span>
                <span>00:06</span>
                <span>00:08</span>
                <span>00:10</span>
              </div>
            </div>
          </>
        ) : (
          <InfoTab
            driverName={driverName}
            driverUnidentified={driverUnidentified}
            selectedDriver={selectedDriver}
            onChangeDriver={setSelectedDriver}
          />
        )}

        <footer className="central-validacao-footer">
          {isFirstSession && (
            <button
              type="button"
              className="central-validacao-btn central-validacao-btn--ghost"
              onClick={onReturn}
            >
              Devolver
            </button>
          )}
          {isCurrentConfirmed ? (
            <button
              type="button"
              className="central-validacao-btn central-validacao-btn--secondary"
              onClick={handleSendAndClose}
            >
              Enviar e fechar
            </button>
          ) : (
            <LevelTooltip text="Confirme antes de continuar" topLayer nowrap>
              <button
                type="button"
                className="central-validacao-btn central-validacao-btn--secondary"
                disabled
                aria-disabled="true"
              >
                Enviar e fechar
              </button>
            </LevelTooltip>
          )}
          {isLastEvent ? (
            isCurrentConfirmed ? (
              <button
                type="button"
                className="central-validacao-btn central-validacao-btn--primary"
                onClick={handleSendAndTreat}
              >
                Enviar e tratar
              </button>
            ) : (
              <LevelTooltip text="Confirme antes de continuar" topLayer nowrap>
                <button
                  type="button"
                  className="central-validacao-btn central-validacao-btn--primary"
                  disabled
                  aria-disabled="true"
                >
                  Enviar e tratar
                </button>
              </LevelTooltip>
            )
          ) : isCurrentConfirmed ? (
            <button
              type="button"
              className="central-validacao-btn central-validacao-btn--primary"
              onClick={handleSendAndNext}
            >
              Enviar e ver o próximo
            </button>
          ) : (
            <LevelTooltip text="Confirme antes de continuar" topLayer nowrap>
              <button
                type="button"
                className="central-validacao-btn central-validacao-btn--primary"
                disabled
                aria-disabled="true"
              >
                Enviar e ver o próximo
              </button>
            </LevelTooltip>
          )}
        </footer>
      </section>
    </div>
  );
};

export default CentralValidacaoAlertasModal;
