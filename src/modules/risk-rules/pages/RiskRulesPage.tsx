import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import type { ContactsPanelHandle } from '../components/treatments/ContactsPanel';
import type { VoiceMessagesPanelHandle } from '../components/treatments/VoiceMessagesPanel';
import type { EmailTemplatesPanelHandle } from '../components/treatments/EmailTemplatesPanel';
import type { PolicyListHandle } from '../components/policy/PolicyList';
import type { TrailListHandle } from '../components/treatments/TrailList';
import { mockPolicies, mockScoreRules, mockTreatments, mockTrails, mockContacts, mockVoiceMessages, mockHistory, mockUsers, mockEmailTemplates } from '../mocks/risk.mock';
import { TYPE_FILTER_OPTIONS, type TypeFilterValue } from '../constants/eventTypes';
import { PolicyList } from '../components/policy/PolicyList';
import { PolicyForm } from '../components/policy/PolicyForm';
import { PolicyDetailTabs } from '../components/policy/PolicyDetailTabs';
import { ScoreList } from '../components/scores/ScoreList';
import { TreatmentList } from '../components/treatments/TreatmentList';
import { TreatmentForm } from '../components/treatments/TreatmentForm';
import { TrailList } from '../components/treatments/TrailList';
import { TrailForm } from '../components/treatments/TrailForm';
import { AdvancedFilterToggle } from '../components/shared/AdvancedFilter';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { UnsavedConfirmModal } from '../components/shared/UnsavedConfirmModal';
import { AppliedConfirmModal } from '../components/shared/AppliedConfirmModal';
import { CrModal } from '../components/shared/CrModal';
import { SuccessToast, type ToastVariant } from '../components/shared/SuccessToast';
import type { Policy, Treatment, Trail, Contact, VoiceMessage, ScoreRule, HistoryEntry, EmailTemplate } from '../types/risk.types';
import { ContactsPanel } from '../components/treatments/ContactsPanel';
import { EmailTemplatesPanel } from '../components/treatments/EmailTemplatesPanel';
import { EmailTemplateForm } from '../components/treatments/EmailTemplateForm';
import { VoiceMessagesPanel } from '../components/treatments/VoiceMessagesPanel';
import { MAX_EMAIL_TEMPLATES_PER_COMPANY, DEFAULT_TEMPLATE_ID } from '../constants/emailTemplateConstants';
import type { AppRoute } from '../../../components/layout/AppSidebar';

const ROUTE_TITLES: Record<AppRoute, string> = {
  'regras-tratativa': 'Políticas de tratativa',
  'tipos-evento': 'Tipos de evento',
  tratativas: 'Regras de tratativa',
  contatos: 'Contatos',
  'email-automatico': 'E-mail automático',
  'mensagem-voz': 'Mensagem voz',
  'central-operacoes': 'Central de tratativas',
  'operacoes-eventos': 'Eventos',
  'operacoes-auditoria': 'Auditoria',
};

const CADASTRO_ROUTES: AppRoute[] = ['contatos', 'email-automatico', 'mensagem-voz'];

interface RiskRulesPageProps {
  appRoute?: AppRoute;
}

/**
 * Página principal do módulo Regras de Tratativa - Módulo de Eventos.
 */
export const RiskRulesPage: React.FC<RiskRulesPageProps> = ({ appRoute = 'regras-tratativa' }) => {
  const isCadastroPage = CADASTRO_ROUTES.includes(appRoute);
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('todos');
  const [policies, setPolicies] = useState(mockPolicies);
  const policiesRef = useRef(policies);
  policiesRef.current = policies;
  const [scores, setScores] = useState<ScoreRule[]>(mockScoreRules);

  const filteredScores = useMemo(() => {
    if (typeFilter === 'todos') return scores;
    return scores.filter((s) => s.eventType === typeFilter);
  }, [scores, typeFilter]);

  /** Aviso fixo: eventos que não estão em nenhuma política */
  const policyCoverageWarning = useMemo(() => {
    const eventIdsCovered = new Set(policies.flatMap((p) => Object.keys(p.configEventos ?? {})));
    const missingCount = scores.filter((s) => !eventIdsCovered.has(s.id)).length;
    if (missingCount === 0) return null;
    return `Faltam ${missingCount} evento(s) a serem contemplados nas políticas.`;
  }, [policies, scores]);
  const [treatments, setTreatments] = useState(mockTreatments);
  const [trails, setTrails] = useState<Trail[]>(mockTrails);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>(mockVoiceMessages);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [emailTemplateFormOpen, setEmailTemplateFormOpen] = useState(false);
  const [emailTemplateEditing, setEmailTemplateEditing] = useState<EmailTemplate | null>(null);
  const contactsPanelRef = useRef<ContactsPanelHandle>(null);
  const voiceMessagesPanelRef = useRef<VoiceMessagesPanelHandle>(null);
  const emailTemplatesPanelRef = useRef<EmailTemplatesPanelHandle>(null);
  const policyListRef = useRef<PolicyListHandle>(null);
  const trailListRef = useRef<TrailListHandle>(null);

  /**
   * Estado replicado da toolbar para cada listagem com filtro avançado.
   * Necessário para destacar o botão e exibir o badge de contagem,
   * já que o painel propriamente dito vive dentro do componente filho.
   */
  const [contactsFilter, setContactsFilter] = useState({ open: false, appliedCount: 0 });
  const [voiceFilter, setVoiceFilter] = useState({ open: false, appliedCount: 0 });
  const [emailFilter, setEmailFilter] = useState({ open: false, appliedCount: 0 });
  const [policyFilter, setPolicyFilter] = useState({ open: false, appliedCount: 0 });
  const [trailFilter, setTrailFilter] = useState({ open: false, appliedCount: 0 });

  const handleContactsFilterChange = useCallback(
    (s: { open: boolean; appliedCount: number }) => setContactsFilter(s),
    [],
  );
  const handleVoiceFilterChange = useCallback(
    (s: { open: boolean; appliedCount: number }) => setVoiceFilter(s),
    [],
  );
  const handleEmailFilterChange = useCallback(
    (s: { open: boolean; appliedCount: number }) => setEmailFilter(s),
    [],
  );
  const handlePolicyFilterChange = useCallback(
    (s: { open: boolean; appliedCount: number }) => setPolicyFilter(s),
    [],
  );
  const handleTrailFilterChange = useCallback(
    (s: { open: boolean; appliedCount: number }) => setTrailFilter(s),
    [],
  );

  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    setHistory((prev) => [
      {
        ...entry,
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userEmail: entry.userEmail ?? 'admin@empresa.com',
      },
      ...prev,
    ]);
  };

  /** Gera texto "Campo: de 'valor original' para 'novo valor'" para cada diferença (ação update) */
  const buildUpdateDescription = <T extends Record<string, unknown>>(
    oldObj: T,
    newObj: T,
    fields: { key: keyof T; label: string; format?: (v: unknown) => string }[]
  ): string => {
    const fmt = (v: unknown, f?: (x: unknown) => string) => (f ? f(v) : String(v ?? '—'));
    const parts: string[] = [];
    for (const { key, label, format } of fields) {
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      if (oldVal === newVal) continue;
      const oldStr = fmt(oldVal, format);
      const newStr = fmt(newVal, format);
      parts.push(`${label}: de "${oldStr}" para "${newStr}"`);
    }
    return parts.length ? parts.join('; ') : '';
  };

  const formatActive = (v: unknown) => (v ? 'Ativo' : 'Inativo');
  const formatTipoAcomp = (v: unknown) => (v === 'veiculo' ? 'Por veículo' : 'Por motorista');
  const formatRiskLevel = (v: unknown) => {
    const key = String(v);
    const m: Record<string, string> = { low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico', grave: 'Crítico' };
    return m[key] ?? String(v ?? '—');
  };
  const formatTrackingType = (v: unknown) => (v === 'veiculo' ? 'Por veículo' : 'Por motorista');
  const formatMode = (v: unknown) => (v === 'levels' ? 'Por nível' : 'Por pontuação');
  const [policyFormOpen, setPolicyFormOpen] = useState(false);
  const [policyEditing, setPolicyEditing] = useState<Policy | null>(null);
  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false);
  const [treatmentEditing, setTreatmentEditing] = useState<Treatment | null>(null);
  const [trailFormOpen, setTrailFormOpen] = useState(false);
  const [trailEditing, setTrailEditing] = useState<Trail | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });
  const [unsavedConfirm, setUnsavedConfirm] = useState<{ open: boolean; onSave: () => void; onDiscard: () => void }>({
    open: false,
    onSave: () => {},
    onDiscard: () => {},
  });
  const [appliedConfirm, setAppliedConfirm] = useState<{
    open: boolean;
    pendingToast: string | null;
    onConfirm?: () => void;
  }>({ open: false, pendingToast: null });
  const [policyFormDirty, setPolicyFormDirty] = useState(false);
  const [trailFormDirty, setTrailFormDirty] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; variant: ToastVariant }>({
    visible: false,
    message: '',
    variant: 'success',
  });
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (typeFilterRef.current && !typeFilterRef.current.contains(e.target as Node)) {
        setTypeFilterOpen(false);
      }
    };
    if (typeFilterOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [typeFilterOpen]);

  const showToast = (message: string, variant: ToastVariant = 'success') =>
    setToast({ visible: true, message, variant });
  const closeToast = () => setToast((t) => ({ ...t, visible: false }));

  const openPolicyForm = (policy?: Policy) => {
    setPolicyEditing(policy ?? null);
    setPolicyFormOpen(true);
  };
  const closePolicyForm = () => {
    setPolicyFormOpen(false);
    setPolicyEditing(null);
    setPolicyFormDirty(false);
    closeToast();
  };

  const requestClosePolicyForm = () => {
    if (policyFormDirty) {
      setUnsavedConfirm({
        open: true,
        onSave: () => {
          setUnsavedConfirm((c) => ({ ...c, open: false }));
          document.getElementById('policy-form')?.requestSubmit();
        },
        onDiscard: () => {
          setUnsavedConfirm((c) => ({ ...c, open: false }));
          closePolicyForm();
        },
      });
    } else closePolicyForm();
  };

  const openTreatmentForm = (treatment?: Treatment) => {
    setTreatmentEditing(treatment ?? null);
    setTreatmentFormOpen(true);
  };
  const closeTreatmentForm = () => {
    setTreatmentFormOpen(false);
    setTreatmentEditing(null);
    closeToast();
  };

  const openTrailForm = (trail?: Trail) => {
    setTrailEditing(trail ?? null);
    setTrailFormOpen(true);
  };
  const closeTrailForm = () => {
    setTrailFormOpen(false);
    setTrailEditing(null);
    setTrailFormDirty(false);
    closeToast();
  };

  const requestCloseTrailForm = () => {
    if (trailFormDirty) {
      setUnsavedConfirm({
        open: true,
        onSave: () => {
          setUnsavedConfirm((c) => ({ ...c, open: false }));
          document.getElementById('trail-form')?.requestSubmit();
        },
        onDiscard: () => {
          setUnsavedConfirm((c) => ({ ...c, open: false }));
          closeTrailForm();
        },
      });
    } else closeTrailForm();
  };

  const handlePolicySubmit = (data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (policyEditing) {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === policyEditing.id
            ? { ...p, ...data, updatedAt: new Date().toISOString() }
            : p
        )
      );
      const policyChanges = buildUpdateDescription(
        policyEditing,
        { ...policyEditing, ...data },
        [
          { key: 'name', label: 'Nome' },
          { key: 'description', label: 'Descrição' },
          { key: 'tipoAcompanhamento', label: 'Tipo de acompanhamento', format: formatTipoAcomp },
          { key: 'active', label: 'Status', format: formatActive },
        ]
      );
      addHistoryEntry({
        entityType: 'policy',
        entityId: policyEditing.id,
        entityName: data.name,
        action: 'update',
        actionDescription: policyChanges ? `Política atualizada. ${policyChanges}` : 'Política atualizada.',
      });
      if (data.active) {
        setAppliedConfirm({ open: true, pendingToast: 'Política atualizada com sucesso.' });
      } else {
        showToast('Política atualizada com sucesso.');
      }
    } else {
      const newPolicy = {
        ...data,
        id: `pol-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPolicies((prev) => [...prev, newPolicy]);
      addHistoryEntry({
        entityType: 'policy',
        entityId: newPolicy.id,
        entityName: data.name,
        action: 'create',
        actionDescription: 'Política criada.',
      });
      if (data.active) {
        setAppliedConfirm({ open: true, pendingToast: 'Política criada com sucesso.' });
      } else {
        showToast('Política criada com sucesso.');
      }
    }
    closePolicyForm();
  };

  const handleTreatmentSubmit = (data: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (treatmentEditing) {
      setTreatments((prev) =>
        prev.map((t) =>
          t.id === treatmentEditing.id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      );
      const treatmentChanges = buildUpdateDescription(
        treatmentEditing,
        { ...treatmentEditing, ...data },
        [
          { key: 'name', label: 'Nome' },
          { key: 'description', label: 'Descrição' },
          { key: 'riskLevel', label: 'Gravidade', format: formatRiskLevel },
          { key: 'active', label: 'Status', format: formatActive },
        ]
      );
      addHistoryEntry({
        entityType: 'treatment',
        entityId: treatmentEditing.id,
        entityName: data.name,
        action: 'update',
        actionDescription: treatmentChanges ? `Tratamento atualizado. ${treatmentChanges}` : 'Tratamento atualizado.',
      });
      showToast('Tratamento atualizado com sucesso.');
    } else {
      const newId = `trt-${Date.now()}`;
      setTreatments((prev) => [
        ...prev,
        {
          ...data,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      addHistoryEntry({
        entityType: 'treatment',
        entityId: newId,
        entityName: data.name,
        action: 'create',
        actionDescription: 'Tratamento criado.',
      });
      showToast('Tratamento criado com sucesso.');
    }
    closeTreatmentForm();
  };

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };
  const closeConfirm = () => setConfirmModal((c) => ({ ...c, open: false }));

  const handlePolicyDelete = (policy: Policy) => {
    confirmDelete('Excluir política', `Deseja excluir a política "${policy.name}"?`, () => {
      setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
      addHistoryEntry({
        entityType: 'policy',
        entityId: policy.id,
        entityName: policy.name,
        action: 'delete',
        actionDescription: 'Política excluída.',
      });
      closeConfirm();
      showToast('Política excluída.');
    });
  };

  const handleTreatmentDelete = (treatment: Treatment) => {
    confirmDelete('Excluir tratamento', `Deseja excluir o tratamento "${treatment.name}"?`, () => {
      setTreatments((prev) => prev.filter((t) => t.id !== treatment.id));
      addHistoryEntry({
        entityType: 'treatment',
        entityId: treatment.id,
        entityName: treatment.name,
        action: 'delete',
        actionDescription: 'Tratamento excluído.',
      });
      closeConfirm();
      showToast('Tratamento excluído.');
    });
  };

  const handleTrailSubmit = (data: Omit<Trail, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (trailEditing) {
      setTrails((prev) =>
        prev.map((t) =>
          t.id === trailEditing.id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      );
      const trailChanges = buildUpdateDescription(
        trailEditing,
        { ...trailEditing, ...data },
        [
          { key: 'name', label: 'Nome' },
          { key: 'trackingType', label: 'Tipo de acompanhamento', format: formatTrackingType },
          { key: 'mode', label: 'Modo', format: formatMode },
          { key: 'active', label: 'Status', format: formatActive },
        ]
      );
      addHistoryEntry({
        entityType: 'treatment',
        entityId: trailEditing.id,
        entityName: data.name,
        action: 'update',
        actionDescription: trailChanges ? `Tratativa atualizada. ${trailChanges}` : 'Tratativa atualizada.',
      });
      showToast('Trilha atualizada com sucesso.');
    } else {
      const newId = `trail-${Date.now()}`;
      setTrails((prev) => [
        ...prev,
        {
          ...data,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      addHistoryEntry({
        entityType: 'treatment',
        entityId: newId,
        entityName: data.name,
        action: 'create',
        actionDescription: 'Tratativa criada.',
      });
      showToast('Trilha criada com sucesso.');
    }
    closeTrailForm();
  };

  const handleTrailDelete = (trail: Trail) => {
    confirmDelete('Excluir tratativa', `Deseja excluir a tratativa "${trail.name}"?`, () => {
      setTrails((prev) => prev.filter((t) => t.id !== trail.id));
      addHistoryEntry({
        entityType: 'treatment',
        entityId: trail.id,
        entityName: trail.name,
        action: 'delete',
        actionDescription: 'Tratativa excluída.',
      });
      closeConfirm();
      showToast('Trilha excluída.');
    });
  };

  const handleContactSave = (data: Omit<Contact, 'id'> & { id?: string }) => {
    if (data.id) {
      const prevContact = contacts.find((c) => c.id === data.id);
      setContacts((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      );
      const contactChanges =
        prevContact &&
        buildUpdateDescription(
          prevContact as Record<string, unknown>,
          { ...prevContact, ...data } as Record<string, unknown>,
          [
            { key: 'name', label: 'Nome' },
            { key: 'phone', label: 'Telefone' },
            { key: 'email', label: 'Email' },
            { key: 'description', label: 'Descrição' },
          ]
        );
      addHistoryEntry({
        entityType: 'contact',
        entityId: data.id,
        entityName: data.name || data.id,
        action: 'update',
        actionDescription: contactChanges ? `Contato atualizado. ${contactChanges}` : 'Contato atualizado.',
      });
      showToast('Contato atualizado.');
    } else {
      const newId = `cont-${Date.now()}`;
      setContacts((prev) => [
        ...prev,
        {
          ...data,
          id: newId,
        } as Contact,
      ]);
      addHistoryEntry({
        entityType: 'contact',
        entityId: newId,
        entityName: data.name || newId,
        action: 'create',
        actionDescription: 'Contato adicionado.',
      });
      showToast('Contato adicionado.');
    }
  };

  const handleContactDelete = (contact: Contact) => {
    confirmDelete('Excluir contato', `Deseja excluir "${contact.name || contact.id}"?`, () => {
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      addHistoryEntry({
        entityType: 'contact',
        entityId: contact.id,
        entityName: contact.name || contact.id,
        action: 'delete',
        actionDescription: 'Contato excluído.',
      });
      closeConfirm();
      showToast('Contato excluído.');
    });
  };

  const handleVoiceMessageSave = (data: Omit<VoiceMessage, 'id'> & { id?: string }) => {
    if (data.id) {
      const prevMsg = voiceMessages.find((m) => m.id === data.id);
      setVoiceMessages((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, ...data } : m))
      );
      const voiceChanges =
        prevMsg &&
        buildUpdateDescription(
          prevMsg as Record<string, unknown>,
          { ...prevMsg, ...data } as Record<string, unknown>,
          [
            { key: 'identification', label: 'Identificação' },
            { key: 'message', label: 'Mensagem' },
            { key: 'language', label: 'Idioma' },
            { key: 'device', label: 'Dispositivo' },
            { key: 'active', label: 'Status', format: formatActive },
          ]
        );
      addHistoryEntry({
        entityType: 'voice',
        entityId: data.id,
        entityName: data.identification || data.id,
        action: 'update',
        actionDescription: voiceChanges ? `Mensagem de voz atualizada. ${voiceChanges}` : 'Mensagem de voz atualizada.',
      });
      showToast('Mensagem de voz atualizada.');
    } else {
      const newId = `vox-${Date.now()}`;
      setVoiceMessages((prev) => [
        ...prev,
        {
          ...data,
          id: newId,
        } as VoiceMessage,
      ]);
      addHistoryEntry({
        entityType: 'voice',
        entityId: newId,
        entityName: data.identification || newId,
        action: 'create',
        actionDescription: 'Mensagem de voz adicionada.',
      });
      showToast('Mensagem de voz adicionada.');
    }
  };

  const handleVoiceMessageDelete = (msg: VoiceMessage) => {
    confirmDelete('Excluir mensagem', `Deseja excluir "${msg.identification}"?`, () => {
      setVoiceMessages((prev) => prev.filter((m) => m.id !== msg.id));
      addHistoryEntry({
        entityType: 'voice',
        entityId: msg.id,
        entityName: msg.identification,
        action: 'delete',
        actionDescription: 'Mensagem de voz excluída.',
      });
      closeConfirm();
      showToast('Mensagem excluída.');
    });
  };

  const openEmailTemplateForm = (template: EmailTemplate | null) => {
    setEmailTemplateEditing(template);
    setEmailTemplateFormOpen(true);
  };

  const closeEmailTemplateForm = () => {
    setEmailTemplateFormOpen(false);
    setEmailTemplateEditing(null);
  };

  const handleEmailTemplateSave = (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isCreate = !data.id;
    if (isCreate && emailTemplates.length >= MAX_EMAIL_TEMPLATES_PER_COMPANY) {
      showToast(`Limite de ${MAX_EMAIL_TEMPLATES_PER_COMPANY} templates de e-mail por empresa. Não é possível criar novo.`, 'warning');
      return;
    }
    const now = new Date().toISOString();
    if (data.id) {
      setEmailTemplates((prev) =>
        prev.map((t) =>
          t.id === data.id
            ? {
                ...t,
                title: data.title,
                description: data.description,
                active: data.active,
                variables: data.variables ?? t.variables,
                updatedAt: now,
              }
            : t
        )
      );
      addHistoryEntry({
        entityType: 'email_template',
        entityId: data.id,
        entityName: data.title,
        action: 'update',
        actionDescription: 'Template de e-mail atualizado.',
      });
      showToast('Template de e-mail atualizado.');
    } else {
      const newId = `tpl-${Date.now()}`;
      setEmailTemplates((prev) => [
        ...prev,
        {
          id: newId,
          title: data.title,
          description: data.description,
          active: data.active ?? true,
          variables: data.variables ?? {},
          createdAt: now,
          updatedAt: now,
        },
      ]);
      addHistoryEntry({
        entityType: 'email_template',
        entityId: newId,
        entityName: data.title,
        action: 'create',
        actionDescription: 'Template de e-mail criado.',
      });
      showToast('Template de e-mail criado.');
    }
    closeEmailTemplateForm();
  };

  const handleEmailTemplateDelete = (template: EmailTemplate) => {
    if (template.id === DEFAULT_TEMPLATE_ID || template.isDefault) return;
    confirmDelete('Excluir template', `Deseja excluir o template "${template.title}"?`, () => {
      setEmailTemplates((prev) => prev.filter((t) => t.id !== template.id));
      addHistoryEntry({
        entityType: 'email_template',
        entityId: template.id,
        entityName: template.title,
        action: 'delete',
        actionDescription: 'Template de e-mail excluído.',
      });
      closeConfirm();
      showToast('Template de e-mail excluído.');
    });
  };

  if (isCadastroPage) {
    return (
      <div className="risk-rules-page page-layout content-body cadastro-page">
        <div className="content-toolbar top-bar">
          <div className="content-toolbar-left">
            <h1 className="body-page-title">{ROUTE_TITLES[appRoute]}</h1>
          </div>
          <div className="content-toolbar-right">
            {appRoute === 'contatos' && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => contactsPanelRef.current?.openNew()}
                >
                  Novo contato
                </button>
                <AdvancedFilterToggle
                  open={contactsFilter.open}
                  appliedCount={contactsFilter.appliedCount}
                  onToggle={() => contactsPanelRef.current?.toggleFilter()}
                />
              </>
            )}
            {appRoute === 'email-automatico' && (
              <>
                <button type="button" className="btn btn-primary" onClick={() => openEmailTemplateForm(null)}>
                  Novo E-mail
                </button>
                <AdvancedFilterToggle
                  open={emailFilter.open}
                  appliedCount={emailFilter.appliedCount}
                  onToggle={() => emailTemplatesPanelRef.current?.toggleFilter()}
                />
              </>
            )}
            {appRoute === 'mensagem-voz' && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => voiceMessagesPanelRef.current?.openNew()}
                >
                  Nova mensagem de voz
                </button>
                <AdvancedFilterToggle
                  open={voiceFilter.open}
                  appliedCount={voiceFilter.appliedCount}
                  onToggle={() => voiceMessagesPanelRef.current?.toggleFilter()}
                />
              </>
            )}
          </div>
        </div>
        <div className="page-content risk-rules-content cadastro-page-content">
          {appRoute === 'contatos' && (
            <ContactsPanel
              ref={contactsPanelRef}
              hideToolbar
              contacts={contacts}
              onSave={handleContactSave}
              onDelete={handleContactDelete}
              onValidationError={(msg) => showToast(msg, 'warning')}
              onFilterStateChange={handleContactsFilterChange}
            />
          )}
          {appRoute === 'email-automatico' && (
            <EmailTemplatesPanel
              ref={emailTemplatesPanelRef}
              hideToolbar
              templates={emailTemplates}
              onNew={() => openEmailTemplateForm(null)}
              onEdit={openEmailTemplateForm}
              onDelete={handleEmailTemplateDelete}
              onFilterStateChange={handleEmailFilterChange}
            />
          )}
          {appRoute === 'mensagem-voz' && (
            <VoiceMessagesPanel
              ref={voiceMessagesPanelRef}
              hideToolbar
              voiceMessages={voiceMessages}
              onSave={handleVoiceMessageSave}
              onDelete={handleVoiceMessageDelete}
              onFilterStateChange={handleVoiceFilterChange}
            />
          )}
        </div>
        {emailTemplateFormOpen && (
          <CrModal
            open
            title={emailTemplateEditing ? 'Editar template de e-mail' : 'Novo template de e-mail'}
            onClose={closeEmailTemplateForm}
            onCancel={closeEmailTemplateForm}
            formId="email-template-form"
            primaryLabel="Salvar"
            cancelLabel="Cancelar"
            fullScreen
          >
            <EmailTemplateForm
              id="email-template-form"
              initialData={emailTemplateEditing ?? undefined}
              onSubmit={handleEmailTemplateSave}
              onCancel={closeEmailTemplateForm}
              hideActions
            />
          </CrModal>
        )}
        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={() => {
            confirmModal.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
        />
        <SuccessToast
          message={toast.message}
          visible={toast.visible}
          onClose={closeToast}
          variant={toast.variant}
        />
      </div>
    );
  }

  if (appRoute === 'tipos-evento') {
    return (
      <div className="risk-rules-page page-layout content-body">
        <div className="content-toolbar top-bar">
          <div className="content-toolbar-left">
            <h1 className="body-page-title">{ROUTE_TITLES['tipos-evento']}</h1>
            <div className="type-filter-wrap" ref={typeFilterRef}>
              <button
                type="button"
                className="type-filter-trigger"
                onClick={() => setTypeFilterOpen((v) => !v)}
                aria-expanded={typeFilterOpen}
                aria-haspopup="listbox"
                aria-label="Filtrar por tipo"
              >
                <span className="type-filter-label">
                  {TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label ?? 'Todos'}
                </span>
                <span className="type-filter-chevron" aria-hidden>
                  <svg width="8" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L5 6 L10 0" stroke="#2F2F2F" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
                  </svg>
                </span>
              </button>
              {typeFilterOpen && (
                <div className="type-filter-dropdown" role="listbox">
                  {TYPE_FILTER_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={typeFilter === opt.value}
                      className="type-filter-option"
                      onClick={() => {
                        setTypeFilter(opt.value as TypeFilterValue);
                        setTypeFilterOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="page-content risk-rules-content">
          <ScoreList scores={filteredScores} />
        </div>
        <SuccessToast
          message={toast.message}
          visible={toast.visible}
          onClose={closeToast}
          variant={toast.variant}
        />
      </div>
    );
  }

  if (appRoute === 'tratativas') {
    return (
      <div className="risk-rules-page page-layout content-body">
        <div className="content-toolbar top-bar">
          <div className="content-toolbar-left">
            <h1 className="body-page-title">{ROUTE_TITLES.tratativas}</h1>
          </div>
          <div className="content-toolbar-right">
            <button type="button" className="btn btn-primary" onClick={() => openTrailForm()}>
              Nova tratativa
            </button>
            {!trailFormOpen && trails.length > 0 && (
              <AdvancedFilterToggle
                open={trailFilter.open}
                appliedCount={trailFilter.appliedCount}
                onToggle={() => trailListRef.current?.toggleFilter()}
              />
            )}
          </div>
        </div>
        <div className="page-content risk-rules-content">
          {trailFormOpen && (
            <CrModal
              open
              title={trailEditing ? 'Editar tratativa' : 'Nova tratativa'}
              onClose={requestCloseTrailForm}
              onCancel={closeTrailForm}
              formId="trail-form"
              primaryLabel="Salvar"
              cancelLabel="Cancelar"
              fullScreen
            >
              <TrailForm
                id="trail-form"
                initialData={trailEditing ?? undefined}
                onSubmit={handleTrailSubmit}
                onCancel={closeTrailForm}
                hideActions
                contacts={contacts}
                emailTemplates={emailTemplates.filter((t) => t.active).map((t) => ({ id: t.id, title: t.title }))}
                voiceMessages={voiceMessages.filter((v) => v.active).map((v) => ({ id: v.id, identification: v.identification }))}
                onValidationError={(msg) => showToast(msg, 'warning')}
                onDirtyChange={setTrailFormDirty}
              />
            </CrModal>
          )}
          {trails.length === 0 && !trailFormOpen ? (
            <EmptyState
              title="Nenhuma tratativa cadastrada"
              description="Cadastre tratativas para definir sequências de ações por pontuação ou nível."
              actionLabel="Nova tratativa"
              onAction={() => openTrailForm()}
            />
          ) : !trailFormOpen ? (
            <TrailList
              ref={trailListRef}
              trails={trails}
              onEdit={(t) => openTrailForm(t)}
              onDelete={handleTrailDelete}
              onFilterStateChange={handleTrailFilterChange}
            />
          ) : null}
        </div>
        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={() => {
            confirmModal.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
        />
        <UnsavedConfirmModal
          open={unsavedConfirm.open}
          onSave={unsavedConfirm.onSave}
          onDiscard={unsavedConfirm.onDiscard}
        />
        <AppliedConfirmModal
          open={appliedConfirm.open}
          onClose={() => {
            appliedConfirm.onConfirm?.();
            const msg = appliedConfirm.pendingToast;
            setAppliedConfirm({ open: false, pendingToast: null });
            if (msg) showToast(msg);
          }}
        />
        <SuccessToast
          message={toast.message}
          visible={toast.visible}
          onClose={closeToast}
          variant={toast.variant}
        />
      </div>
    );
  }

  return (
    <div className="risk-rules-page page-layout content-body">
      <div className="content-toolbar top-bar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">{ROUTE_TITLES['regras-tratativa']}</h1>
        </div>
        <div className="content-toolbar-right">
          <button type="button" className="btn btn-primary" onClick={() => openPolicyForm()}>
            Nova política
          </button>
          {!policyFormOpen && (
            <AdvancedFilterToggle
              open={policyFilter.open}
              appliedCount={policyFilter.appliedCount}
              onToggle={() => policyListRef.current?.toggleFilter()}
            />
          )}
        </div>
      </div>

      <div className="page-content risk-rules-content">
        {policyCoverageWarning && (
          <div className="policy-coverage-warning" role="alert">
            {policyCoverageWarning}
          </div>
        )}
        {policyFormOpen ? (
          <CrModal
            open
            title={policyEditing ? 'Editar política' : 'Nova política'}
            onClose={requestClosePolicyForm}
            onCancel={closePolicyForm}
            formId="policy-form"
            primaryLabel="Salvar"
            cancelLabel="Cancelar"
            fullScreen
          >
            <PolicyDetailTabs
              policy={policyEditing}
              history={history}
              renderForm={() => (
                <PolicyForm
                  id="policy-form"
                  initialData={policyEditing ?? undefined}
                  scores={mockScoreRules}
                  trails={trails}
                  users={mockUsers}
                  onSubmit={handlePolicySubmit}
                  onCancel={closePolicyForm}
                  hideActions
                  onDirtyChange={setPolicyFormDirty}
                />
              )}
            />
          </CrModal>
        ) : (
          <PolicyList
            ref={policyListRef}
            policies={policies}
            scores={scores}
            onEdit={(p) => openPolicyForm(p)}
            onDelete={handlePolicyDelete}
            onFilterStateChange={handlePolicyFilterChange}
          />
        )}
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={() => {
          confirmModal.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />

      <UnsavedConfirmModal
        open={unsavedConfirm.open}
        onSave={unsavedConfirm.onSave}
        onDiscard={unsavedConfirm.onDiscard}
      />

      <AppliedConfirmModal
        open={appliedConfirm.open}
        onClose={() => {
          appliedConfirm.onConfirm?.();
          const msg = appliedConfirm.pendingToast;
          setAppliedConfirm({ open: false, pendingToast: null });
          if (msg) showToast(msg);
        }}
      />

      <SuccessToast
        message={toast.message}
        visible={toast.visible}
        onClose={closeToast}
        variant={toast.variant}
      />
    </div>
  );
};

export default RiskRulesPage;
