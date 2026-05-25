import React, { useState, useMemo, useEffect } from 'react';
import type { EmailTemplate } from '../../types/risk.types';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { COMPANY_OPTIONS } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  EMAIL_VARS_CABECALHO,
  EMAIL_VARS_CORPO,
  EMAIL_VARS_RODAPE,
  TERMO_DE_CIENCIA_TEXT,
  EMAIL_LAYOUT_HEADER_LABELS,
  EMAIL_LAYOUT_HEADER_ICON,
  EMAIL_LAYOUT_HEADER_ORDER,
  EMAIL_LAYOUT_BODY_SECTIONS,
  AVISO_LEGAL_TEXT,
  DEFAULT_EMAIL_VARIABLE_KEYS,
  DEFAULT_TEMPLATE_ID,
} from '../../constants/emailTemplateConstants';

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const IconEye: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconExpand: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const IconCollapse: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
const IconClock = () => <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconAlert = () => <svg {...iconProps}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconPerson = () => <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
/** Persona com risco na diagonal (cinto) */
const IconPersonSeatbelt = () => <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="5" y1="4" x2="19" y2="20" strokeWidth={2}/></svg>;
const IconSeatbelt = () => <svg {...iconProps}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M4 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M12 12v6"/><path d="M8 12h8"/></svg>;
const IconSpeed = () => <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4-2"/><path d="M12 18v-2"/></svg>;
const IconCalendar = () => <svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconCar = () => <svg {...iconProps}><path d="M14 16H9m5 0v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2"/><path d="M19 17h-1v-6l-2-4H8L6 11v6H5"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/></svg>;
const IconHash = () => <svg {...iconProps}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
const IconList = () => <svg {...iconProps}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconMap = () => <svg {...iconProps}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconChart = () => <svg {...iconProps}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconDoc = () => <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

const FIELD_ICONS: Record<string, React.FC> = {
  clock: IconClock,
  alert: IconAlert,
  person: IconPerson,
  seatbelt: IconPersonSeatbelt,
  speed: IconSpeed,
  calendar: IconCalendar,
  car: IconCar,
  hash: IconHash,
};
const SECTION_ICONS: Record<string, React.FC> = {
  list: IconList,
  map: IconMap,
  chart: IconChart,
  doc: IconDoc,
};

const DESCRIPTION_MAX_LENGTH = 500;

interface EmailTemplateFormProps {
  id?: string;
  initialData?: Partial<EmailTemplate> | null;
  onSubmit: (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
  hideActions?: boolean;
}

const ALL_EMAIL_VARIABLE_KEYS = [
  ...EMAIL_VARS_CABECALHO.map((v) => v.key),
  ...EMAIL_VARS_CORPO.map((v) => v.key),
  ...EMAIL_VARS_RODAPE.map((v) => v.key),
];

function buildInitialVariables(isNewTemplate: boolean): Record<string, boolean> {
  const defaultOn = isNewTemplate ? new Set(DEFAULT_EMAIL_VARIABLE_KEYS) : new Set<string>();
  return ALL_EMAIL_VARIABLE_KEYS.reduce((acc, k) => ({ ...acc, [k]: defaultOn.has(k) }), {});
}

function buildAllVariablesTrue(): Record<string, boolean> {
  return ALL_EMAIL_VARIABLE_KEYS.reduce<Record<string, boolean>>((acc, k) => ({ ...acc, [k]: true }), {});
}

function getInitialVariables(initialData: Partial<EmailTemplate> | null | undefined): Record<string, boolean> {
  const base = buildInitialVariables(!initialData?.id);
  const isDefaultTemplate = initialData?.isDefault === true || initialData?.id === DEFAULT_TEMPLATE_ID;
  if (isDefaultTemplate) {
    const fromData = initialData?.variables && typeof initialData.variables === 'object' && Object.keys(initialData.variables).length > 0
      ? initialData.variables
      : null;
    return fromData ? { ...buildAllVariablesTrue(), ...fromData } : buildAllVariablesTrue();
  }
  if (initialData?.variables && typeof initialData.variables === 'object') {
    return { ...base, ...initialData.variables };
  }
  return base;
}

export const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  id,
  initialData,
  onSubmit,
  onCancel,
  hideActions = false,
}) => {
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';
  const defaultCompanyId = currentUser.companyId ?? COMPANY_OPTIONS[0].value;

  const [companyId, setCompanyId] = useState(initialData?.companyId ?? defaultCompanyId);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [variables, setVariables] = useState<Record<string, boolean>>(() => getInitialVariables(initialData));
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [headerImgError, setHeaderImgError] = useState(false);
  const [bodyImgError, setBodyImgError] = useState(false);

  const isDefault = Boolean(initialData?.isDefault);

  useEffect(() => {
    if (initialData) {
      setCompanyId(initialData.companyId ?? defaultCompanyId);
      setTitle(initialData.title ?? '');
      setDescription(initialData.description ?? '');
      setActive(initialData.active ?? true);
      setVariables(getInitialVariables(initialData));
    }
  }, [initialData?.id]);

  const toggleVariable = (key: string) => {
    setVariables((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrimmed = title.trim();
    if (!titleTrimmed) return;
    onSubmit({
      ...(initialData?.id && { id: initialData.id }),
      companyId,
      title: titleTrimmed,
      description: description.trim() || undefined,
      active,
      isDefault: initialData?.isDefault,
      variables: { ...variables },
    });
  };

  const headerVars = useMemo(
    () => EMAIL_VARS_CABECALHO.filter((v) => variables[v.key]),
    [variables]
  );
  const bodyVars = useMemo(
    () => EMAIL_VARS_CORPO.filter((v) => variables[v.key]),
    [variables]
  );
  const showTermoInPreview = variables['termo_ciencia'];
  const showAssinaturaCondutor = variables['local_assinatura_condutor'] || variables['assinatura_digital_condutor'];
  const showAssinaturaGestor = variables['local_assinatura_gestor'];
  const hasVariableContent =
    headerVars.length > 0 ||
    bodyVars.length > 0 ||
    showTermoInPreview ||
    showAssinaturaCondutor ||
    showAssinaturaGestor;

  const previewContent = (
    <>
      {title.trim() && (
        <div className="email-template-form__preview-subject">
          <span className="email-template-form__preview-subject-label">Assunto</span>
          <span className="email-template-form__preview-subject-value">{title.trim()}</span>
        </div>
      )}
      <div className="email-preview-model">
        {/* Cabeçalho: imagem exata do e-mail (sempre visível) */}
        <div className="email-preview-model__header">
          {headerImgError ? (
            <div className="email-preview-model__header-fallback">
              <span className="email-preview-model__brand">creare sistemas</span>
            </div>
          ) : (
            <img
              src="/email-header.png"
              alt="creare sistemas"
              className="email-preview-model__header-img"
              onError={() => setHeaderImgError(true)}
            />
          )}
        </div>
        <div className="email-preview-model__title-bar">
          <span className="email-preview-model__title-value">{title.trim() || 'Nº do Comunicado'}</span>
        </div>

        {/* Corpo: imagem quando não há variáveis; campos criados a partir das variáveis quando habilitadas */}
        <div className="email-preview-model__body">
          {!hasVariableContent ? (
            <div className="email-preview-model__body-blank">
              {!bodyImgError ? (
                <img
                  src="/email-body.png"
                  alt=""
                  className="email-preview-model__body-img"
                  role="presentation"
                  onError={() => setBodyImgError(true)}
                />
              ) : null}
            </div>
          ) : (
            <div className="email-preview-model__body-inner">
              {headerVars.length > 0 && (
                <div className="email-preview-model__details-panel">
                  <div className="email-preview-model__details-col">
                    {EMAIL_LAYOUT_HEADER_ORDER.filter((o) => o.col === 'left' && variables[o.key]).map((o) => {
                      const IconC = FIELD_ICONS[EMAIL_LAYOUT_HEADER_ICON[o.key] ?? 'hash'];
                      return (
                        <div key={o.key} className="email-preview-model__detail-row">
                          <span className="email-preview-model__detail-icon" aria-hidden>
                            {IconC ? <IconC /> : null}
                          </span>
                          <span className="email-preview-model__detail-label">
                            {EMAIL_LAYOUT_HEADER_LABELS[o.key]}:
                          </span>
                          <span className="email-preview-model__detail-value">—</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="email-preview-model__details-col">
                    {EMAIL_LAYOUT_HEADER_ORDER.filter((o) => o.col === 'right' && variables[o.key]).map((o) => {
                      const IconC = FIELD_ICONS[EMAIL_LAYOUT_HEADER_ICON[o.key] ?? 'hash'];
                      return (
                        <div key={o.key} className="email-preview-model__detail-row">
                          <span className="email-preview-model__detail-icon" aria-hidden>
                            {IconC ? <IconC /> : null}
                          </span>
                          <span className="email-preview-model__detail-label">
                            {EMAIL_LAYOUT_HEADER_LABELS[o.key]}:
                          </span>
                          <span className="email-preview-model__detail-value">—</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {bodyVars.length > 0 && (
                <div className="email-preview-model__body-sections">
                  {bodyVars.map((v) => {
                    const section = EMAIL_LAYOUT_BODY_SECTIONS[v.key];
                    if (!section) return null;
                    const SectionIcon = SECTION_ICONS[section.icon];
                    return (
                      <div key={v.key} className="email-preview-model__body-block">
                        <div className="email-preview-model__body-block-header">
                          {SectionIcon && (
                            <span className="email-preview-model__body-block-icon" aria-hidden>
                              <SectionIcon />
                            </span>
                          )}
                          <div className="email-preview-model__body-block-title">{section.title}</div>
                        </div>
                        <p className="email-preview-model__body-block-desc">{section.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {(showTermoInPreview || showAssinaturaCondutor || showAssinaturaGestor) && (
                <div className="email-preview-model__footer-panel">
                  {showTermoInPreview && (
                    <div className="email-preview-model__termo">
                      <div className="email-preview-model__body-block-header">
                        <span className="email-preview-model__body-block-icon" aria-hidden>
                          <IconDoc />
                        </span>
                        <div className="email-preview-model__termo-title">TERMO DE CIÊNCIA DO CONDUTOR</div>
                      </div>
                      <p className="email-preview-model__termo-text">{TERMO_DE_CIENCIA_TEXT}</p>
                    </div>
                  )}
                  {(showAssinaturaCondutor || showAssinaturaGestor) && (
                    <div className="email-preview-model__signatures">
                      <div className="email-preview-model__signature-line-row">
                        {showAssinaturaCondutor && (
                          <div className="email-preview-model__signature-cell">
                            <span className="email-preview-model__signature-label">Data: __/__/______</span>
                            <span className="email-preview-model__signature-underline" aria-hidden />
                            <span className="email-preview-model__signature-caption">Assinatura do condutor</span>
                          </div>
                        )}
                        {showAssinaturaGestor && (
                          <div className="email-preview-model__signature-cell">
                            <span className="email-preview-model__signature-label">&nbsp;</span>
                            <span className="email-preview-model__signature-underline" aria-hidden />
                            <span className="email-preview-model__signature-caption">Assinatura e carimbo do gestor imediato</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé cinza: sempre visível */}
        <div className="email-preview-model__aviso-legal">{AVISO_LEGAL_TEXT}</div>
      </div>
    </>
  );

  const previewPanel = (
    <div className={`email-template-form__preview ${previewExpanded ? 'email-template-form__preview--expanded' : ''}`}>
      <header className="email-template-form__preview-header">
        <div className="email-template-form__preview-header-left">
          <span className="email-template-form__preview-icon" aria-hidden>
            <IconEye />
          </span>
          <span className="email-template-form__preview-title">Prévia do e-mail</span>
        </div>
        {previewExpanded ? (
          <button
            type="button"
            className="cr-btn cr-btn--outline email-template-form__preview-toggle-btn"
            onClick={() => setPreviewExpanded(false)}
            title="Voltar para edição"
          >
            <IconCollapse />
            <span>Voltar para edição</span>
          </button>
        ) : (
          <button
            type="button"
            className="cr-btn cr-btn--outline email-template-form__preview-toggle-btn"
            onClick={() => setPreviewExpanded(true)}
            title="Expandir prévia"
          >
            <IconExpand />
            <span>Expandir</span>
          </button>
        )}
      </header>
      <div className="email-template-form__preview-content">
        {previewContent}
      </div>
      <footer className="email-template-form__preview-footer">
        Esta é apenas uma simulação do e-mail final.
      </footer>
    </div>
  );

  if (previewExpanded) {
    return (
      <form id={id} onSubmit={handleSubmit} className="email-template-form email-template-form--preview-only">
        <div className="email-template-form__body email-template-form__body--preview-expanded">
          {previewPanel}
        </div>
      </form>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="email-template-form">
      <div className="email-template-form__body">
        <div className="email-template-form__left">
          <div className="email-template-form__fields">
            <div className="form-group">
              <label htmlFor="email-template-company">Empresa</label>
              <ModalSelect
                id="email-template-company"
                options={currentUser.availableCompanies}
                value={companyId}
                onChange={(v) => setCompanyId(v)}
                placeholder="Selecione a empresa"
                disabled={isClient}
                className="modal-select--no-pill"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-template-title">Título</label>
              <input
                id="email-template-title"
                type="text"
                className="input-text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do e-mail na caixa de entrada"
                maxLength={120}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-template-desc">Descrição</label>
              <textarea
                id="email-template-desc"
                className="textarea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição interna (apenas para você)"
                rows={2}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <div className={`form-group ${isDefault ? 'email-template-form__status-disabled' : ''}`}>
              <label htmlFor="email-template-status">Status</label>
              <ModalSelect
                id="email-template-status"
                options={STATUS_OPTIONS}
                value={active ? 'ativo' : 'inativo'}
                onChange={(v) => !isDefault && setActive(v === 'ativo')}
                disabled={isDefault}
                placeholder="Status"
              />
            </div>
          </div>

          <div className="email-template-form__variables">
            <h3 className="email-template-form__vars-title">Informações disponíveis</h3>
            <p className="email-template-form__vars-hint">Ative as informações que devem aparecer no e-mail.</p>

            <div className="email-template-form__vars-group">
              <h4 className="email-template-form__vars-group-title">Tópicos principais</h4>
              {EMAIL_VARS_CABECALHO.map((v) => {
                const on = variables[v.key] ?? false;
                return (
                  <div key={v.key} className="email-template-form__var-row">
                    <span className="email-template-form__var-label">{v.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      className={`email-template-form__var-switch ${on ? 'email-template-form__var-switch--on' : ''}`}
                      onClick={() => toggleVariable(v.key)}
                      title={on ? 'Desativar' : 'Ativar'}
                    >
                      <span className="email-template-form__var-switch-knob" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="email-template-form__vars-group">
              <h4 className="email-template-form__vars-group-title">Detalhamento do comunicado</h4>
              {EMAIL_VARS_CORPO.map((v) => {
                const on = variables[v.key] ?? false;
                return (
                  <div key={v.key} className="email-template-form__var-row">
                    <span className="email-template-form__var-label">{v.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      className={`email-template-form__var-switch ${on ? 'email-template-form__var-switch--on' : ''}`}
                      onClick={() => toggleVariable(v.key)}
                      title={on ? 'Desativar' : 'Ativar'}
                    >
                      <span className="email-template-form__var-switch-knob" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="email-template-form__vars-group">
              <h4 className="email-template-form__vars-group-title">Aviso legal e confirmação de ciência</h4>
              {EMAIL_VARS_RODAPE.map((v) => {
                const on = variables[v.key] ?? false;
                return (
                  <div key={v.key} className="email-template-form__var-row">
                    <span className="email-template-form__var-label">{v.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      className={`email-template-form__var-switch ${on ? 'email-template-form__var-switch--on' : ''}`}
                      onClick={() => toggleVariable(v.key)}
                      title={on ? 'Desativar' : 'Ativar'}
                    >
                      <span className="email-template-form__var-switch-knob" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="email-template-form__right">
          {previewPanel}
        </div>
      </div>
      {!hideActions && (
        <div className="email-template-form__actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
            Salvar
          </button>
        </div>
      )}
    </form>
  );
};

export default EmailTemplateForm;
