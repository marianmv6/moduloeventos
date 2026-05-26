import React, { useMemo, useState } from 'react';
import { CrModal } from '../../risk-rules/components/shared/CrModal';
import type { OperacoesEventRow } from '../types/operacoes.types';
import { buildOperacoesEventDetail } from '../utils/operacoesEventDetail';
import { OrganizationGroupsField } from './OrganizationGroupsField';
import { OperacoesEventosMap } from './OperacoesEventosMap';

type EventDetailTab = 'informacoes' | 'reproducao' | 'midias';

const TABS: { id: EventDetailTab; label: string }[] = [
  { id: 'informacoes', label: 'Informações' },
  { id: 'reproducao', label: 'Reprodução' },
  { id: 'midias', label: 'Mídias' },
];

interface OperacoesEventDetailModalProps {
  event: OperacoesEventRow;
  onClose: () => void;
}

interface DetailFieldProps {
  label: string;
  value: string;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value }) => (
  <div className="operacoes-event-detail-field">
    <label className="cr-modal__label">{label}</label>
    <div className="cr-modal__input cr-modal__readonly" aria-readonly>
      {value || '—'}
    </div>
  </div>
);

function SectionChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`operacoes-event-detail-section__chevron${open ? ' operacoes-event-detail-section__chevron--open' : ''}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="operacoes-event-detail-section">
      <div className="operacoes-event-detail-section__heading">
        <button
          type="button"
          className="operacoes-event-detail-section__header"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <span className="operacoes-event-detail-section__title">{title}</span>
          <SectionChevron open={open} />
        </button>
      </div>
      {open && <div className="operacoes-event-detail-section__body">{children}</div>}
    </section>
  );
};

const TabPlaceholder: React.FC<{ label: string }> = ({ label }) => (
  <div className="operacoes-event-detail-placeholder">
    <p>{label} indisponível para este evento.</p>
  </div>
);

export const OperacoesEventDetailModal: React.FC<OperacoesEventDetailModalProps> = ({
  event,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<EventDetailTab>('informacoes');
  const detail = useMemo(() => buildOperacoesEventDetail(event), [event]);
  const title = `${event.eventType} no veículo ${event.placa}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <CrModal
      open
      title={title}
      onClose={onClose}
      onCancel={onClose}
      fullScreen
      formId="operacoes-event-detail-form"
      primaryLabel="Salvar"
      cancelLabel="Cancelar"
    >
      <form
        id="operacoes-event-detail-form"
        className="operacoes-event-detail-form"
        onSubmit={handleSubmit}
      >
        <div className="operacoes-event-detail-split">
          <div className="operacoes-event-detail-pane operacoes-event-detail-pane--info">
            <div className="operacoes-event-detail-tabs risk-tabs" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`risk-tab${activeTab === tab.id ? ' risk-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'informacoes' && (
              <div className="operacoes-event-detail-content" role="tabpanel">
                <DetailSection title="Dados do evento">
                  <div className="operacoes-event-detail-grid operacoes-event-detail-grid--2">
                    <DetailField label="Tipo de evento" value={event.eventType} />
                  </div>
                  <div className="operacoes-event-detail-grid operacoes-event-detail-grid--4">
                    <DetailField label="Data do evento" value={detail.eventDateLabel} />
                    <DetailField label="Hora do evento" value={detail.eventTimeLabel} />
                    <DetailField
                      label="Data do recebimento"
                      value={detail.receivedDateLabel}
                    />
                    <DetailField
                      label="Hora do recebimento"
                      value={detail.receivedTimeLabel}
                    />
                  </div>
                  <div className="operacoes-event-detail-grid operacoes-event-detail-grid--loc">
                    <DetailField
                      label="Localização aproximada"
                      value={detail.locationLabel}
                    />
                    <DetailField label="Coordenadas" value={detail.coordinatesLabel} />
                    <DetailField label="Velocidade" value={detail.speedLabel} />
                  </div>
                </DetailSection>

                <DetailSection title="Dados do veículo">
                  <div className="operacoes-event-detail-grid operacoes-event-detail-grid--2">
                    <DetailField label="Tipo" value={detail.vehicle.tipo} />
                    <DetailField label="Placa" value={detail.vehicle.placa} />
                    <DetailField label="Prefixo" value={detail.vehicle.prefixo} />
                    <DetailField label="Marca" value={detail.vehicle.marca} />
                    <DetailField label="Modelo" value={detail.vehicle.modelo} />
                    <DetailField label="Ano / Modelo" value={detail.vehicle.anoModelo} />
                    <DetailField label="Combustível" value={detail.vehicle.combustivel} />
                  </div>
                  <OrganizationGroupsField
                    label="Grupo de organização"
                    groups={detail.vehicle.gruposOrganizacao}
                  />
                </DetailSection>

                <DetailSection title="Dados do motorista">
                  {detail.driver ? (
                    <>
                      <div className="operacoes-event-detail-grid operacoes-event-detail-grid--2">
                        <DetailField label="Nome" value={detail.driver.nome} />
                        <DetailField label="Matrícula" value={detail.driver.matricula} />
                        <DetailField label="Função" value={detail.driver.funcao} />
                        <DetailField label="CNH" value={detail.driver.cnh} />
                        <DetailField label="Categoria" value={detail.driver.categoria} />
                      </div>
                      <OrganizationGroupsField
                        label="Grupos de organização"
                        groups={detail.driver.gruposOrganizacao}
                      />
                    </>
                  ) : (
                    <p className="operacoes-event-detail-empty">
                      Sem motorista vinculado a este evento.
                    </p>
                  )}
                </DetailSection>
              </div>
            )}

            {activeTab === 'reproducao' && <TabPlaceholder label="Reprodução" />}
            {activeTab === 'midias' && <TabPlaceholder label="Mídias" />}
          </div>

          <aside className="operacoes-event-detail-pane operacoes-event-detail-pane--map" aria-label="Local do evento">
            <OperacoesEventosMap
              eventLocation={event.mapPosition}
              eventMarkerLabel={`${event.eventType} — ${event.placa}`}
            />
          </aside>
        </div>
      </form>
    </CrModal>
  );
};

export default OperacoesEventDetailModal;
