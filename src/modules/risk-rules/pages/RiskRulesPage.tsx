import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { RiskTabId } from '../types/risk.types';
import { mockPolicies, mockScoreRules, mockTreatments, mockTrails, mockContacts, mockVoiceMessages, mockHistory, mockUsers } from '../mocks/risk.mock';
import { TYPE_FILTER_OPTIONS, type TypeFilterValue } from '../constants/eventTypes';
import { RiskTabs } from '../components/tabs/RiskTabs';
import { PolicyList } from '../components/policy/PolicyList';
import { PolicyForm } from '../components/policy/PolicyForm';
import { ScoreList } from '../components/scores/ScoreList';
import { EditScoreModal } from '../components/scores/EditScoreModal';
import { EditAllScoresModal } from '../components/scores/EditAllScoresModal';
import { TreatmentList } from '../components/treatments/TreatmentList';
import { TreatmentForm } from '../components/treatments/TreatmentForm';
import { TrailList } from '../components/treatments/TrailList';
import { TrailForm } from '../components/treatments/TrailForm';
import { EmptyState } from '../components/shared/EmptyState';
import { HistoryList } from '../components/history/HistoryList';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { UnsavedConfirmModal } from '../components/shared/UnsavedConfirmModal';
import { AppliedConfirmModal } from '../components/shared/AppliedConfirmModal';
import { CrModal } from '../components/shared/CrModal';
import type { EditScoreModalRef } from '../components/scores/EditScoreModal';
import { SuccessToast, type ToastVariant } from '../components/shared/SuccessToast';
import type { Policy, Treatment, Trail, Contact, VoiceMessage, ScoreRule, HistoryEntry } from '../types/risk.types';
import { CrDrawer } from '../components/shared/CrDrawer';
import { ContactsPanel } from '../components/treatments/ContactsPanel';
import { VoiceMessagesPanel } from '../components/treatments/VoiceMessagesPanel';

/**
 * Página principal do módulo Regras de Risco - Módulo de Eventos.
 */
export const RiskRulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RiskTabId>('policy');
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('todos');
  const [policies, setPolicies] = useState(mockPolicies);
  const policiesRef = useRef(policies);
  policiesRef.current = policies;
  const [scores, setScores] = useState<ScoreRule[]>(mockScoreRules);
  const initialScoresRef = useRef<ScoreRule[]>(mockScoreRules);

  const filteredScores = useMemo(() => {
    if (typeFilter === 'todos') return scores;
    return scores.filter((s) => s.eventType === typeFilter);
  }, [scores, typeFilter]);
  const [treatments, setTreatments] = useState(mockTreatments);
  const [trails, setTrails] = useState<Trail[]>(mockTrails);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>(mockVoiceMessages);
  const [history, setHistory] = useState<HistoryEntry[]>(mockHistory);

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
  const [contactsDrawerOpen, setContactsDrawerOpen] = useState(false);
  const [voiceMessagesDrawerOpen, setVoiceMessagesDrawerOpen] = useState(false);

  const [editScoreModalOpen, setEditScoreModalOpen] = useState(false);
  const [scoreEditing, setScoreEditing] = useState<ScoreRule | null>(null);
  const [editAllScoresModalOpen, setEditAllScoresModalOpen] = useState(false);

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
  const [editScoreDirty, setEditScoreDirty] = useState(false);
  const editScoreModalRef = useRef<EditScoreModalRef>(null);
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

  const sameEventos = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.every((id, i) => id === sb[i]);
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
      addHistoryEntry({
        entityType: 'policy',
        entityId: policyEditing.id,
        entityName: data.name,
        action: 'update',
        actionDescription: 'Política atualizada.',
      });
      if (data.active) {
        setAppliedConfirm({ open: true, pendingToast: 'Política atualizada com sucesso.' });
      } else {
        showToast('Política atualizada com sucesso.');
      }
    } else {
      const currentPolicies = policiesRef.current;
      const otherActiveWithSameEventos = currentPolicies.some(
        (p) => p.active && sameEventos(p.eventosContemplados, data.eventosContemplados)
      );
      const saveActive = !otherActiveWithSameEventos && !!data.active;
      const newPolicy = {
        ...data,
        active: saveActive,
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
      if (otherActiveWithSameEventos) {
        showToast(
          'Não é possível ativar esta política, pois existem eventos já vinculados a outra política ativa.',
          'warning'
        );
      } else if (saveActive) {
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
      addHistoryEntry({
        entityType: 'treatment',
        entityId: treatmentEditing.id,
        entityName: data.name,
        action: 'update',
        actionDescription: 'Tratamento atualizado.',
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
      addHistoryEntry({
        entityType: 'treatment',
        entityId: trailEditing.id,
        entityName: data.name,
        action: 'update',
        actionDescription: 'Tratativa atualizada.',
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
      setContacts((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      );
      addHistoryEntry({
        entityType: 'contact',
        entityId: data.id,
        entityName: data.name || data.id,
        action: 'update',
        actionDescription: 'Contato atualizado.',
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
      setVoiceMessages((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, ...data } : m))
      );
      addHistoryEntry({
        entityType: 'voice',
        entityId: data.id,
        entityName: data.identification || data.id,
        action: 'update',
        actionDescription: 'Mensagem de voz atualizada.',
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

  const openEditScore = (score: ScoreRule) => {
    setScoreEditing(score);
    setEditScoreModalOpen(true);
  };

  const closeEditScoreModal = () => {
    setEditScoreModalOpen(false);
    setScoreEditing(null);
    setEditScoreDirty(false);
  };

  const requestCloseEditScoreModal = () => {
    if (editScoreDirty) {
      setUnsavedConfirm({
        open: true,
        onSave: () => {
          setUnsavedConfirm((c) => ({ ...c, open: false }));
          setEditScoreDirty(false);
          editScoreModalRef.current?.save();
        },
        onDiscard: () => {
          setUnsavedConfirm((c) => ({ ...c, open: false }));
          closeEditScoreModal();
        },
      });
    } else closeEditScoreModal();
  };

  const handleSaveScore = (scoreId: string, newWeight: number) => {
    const score = scores.find((s) => s.id === scoreId);
    setScores((prev) =>
      prev.map((s) => (s.id === scoreId ? { ...s, weight: newWeight } : s))
    );
    addHistoryEntry({
      entityType: 'score',
      entityId: scoreId,
      entityName: score?.name ?? scoreId,
      action: 'update',
      actionDescription: `Pontuação alterada para ${newWeight}.`,
    });
    closeEditScoreModal();
    setAppliedConfirm({ open: true, pendingToast: 'Pontuação atualizada com sucesso.' });
  };

  const initialScores = initialScoresRef.current;
  const scoresDifferFromDefault = scores.some((s) => {
    const init = initialScores.find((i) => i.id === s.id);
    return !init || init.weight !== s.weight;
  });

  const restoreScoresToDefault = () => {
    setScores((prev) =>
      prev.map((s) => {
        const init = initialScoresRef.current.find((i) => i.id === s.id);
        const defaultW = init?.defaultWeight ?? init?.weight ?? s.weight;
        return { ...s, weight: defaultW };
      })
    );
  };

  const openRetomarPadraoConfirm = () => {
    setAppliedConfirm({
      open: true,
      pendingToast: 'Pontuações restauradas ao padrão.',
      onConfirm: () => {
        restoreScoresToDefault();
        addHistoryEntry({
          entityType: 'score',
          entityId: 'padrao',
          entityName: 'Pontuações',
          action: 'update',
          actionDescription: 'Pontuações restauradas ao padrão.',
        });
      },
    });
  };

  const closeEditAllScoresModal = () => setEditAllScoresModalOpen(false);

  const handleSaveAllScores = (updates: Array<{ id: string; weight: number }>) => {
    setScores((prev) =>
      prev.map((s) => {
        const u = updates.find((u) => u.id === s.id);
        return u ? { ...s, weight: u.weight } : s;
      })
    );
    addHistoryEntry({
      entityType: 'score',
      entityId: 'edicao-lote',
      entityName: 'Pontuações',
      action: 'update',
      actionDescription: `${updates.length} pontuação(ões) atualizada(s).`,
    });
    closeEditAllScoresModal();
    setAppliedConfirm({ open: true, pendingToast: 'Pontuações atualizadas com sucesso.' });
  };

  return (
    <div className="risk-rules-page page-layout content-body">
      <div className="content-toolbar top-bar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Regras de risco</h1>
          {activeTab === 'scores' && (
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
          )}
        </div>
        <div className="content-toolbar-right">
          {activeTab === 'policy' && (
            <button type="button" className="btn btn-primary" onClick={() => openPolicyForm()}>
              Nova política
            </button>
          )}
          {activeTab === 'scores' && (
            <>
              {scoresDifferFromDefault && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={openRetomarPadraoConfirm}
                >
                  Retomar padrão
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditAllScoresModalOpen(true)}
              >
                Editar todos
              </button>
            </>
          )}
          {activeTab === 'treatments' && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setContactsDrawerOpen(true)}
              >
                Gerenciar contatos
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setVoiceMessagesDrawerOpen(true)}
              >
                Gerenciar mensagens de voz
              </button>
              <button type="button" className="btn btn-primary" onClick={() => openTrailForm()}>
                Nova tratativa
              </button>
            </>
          )}
        </div>
      </div>

      <RiskTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="page-content risk-rules-content">
        {activeTab === 'policy' && (
          <>
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
              </CrModal>
            ) : (
              <PolicyList
                policies={policies}
                onEdit={(p) => openPolicyForm(p)}
                onDelete={handlePolicyDelete}
              />
            )}
          </>
        )}

        {activeTab === 'scores' && (
          <>
            <ScoreList scores={filteredScores} onEdit={openEditScore} />
          </>
        )}

        {activeTab === 'treatments' && (
          <>
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
                  contacts={contacts.map((c) => ({ id: c.id, name: c.name }))}
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
                trails={trails}
                onEdit={(t) => openTrailForm(t)}
                onDelete={handleTrailDelete}
              />
            ) : null}
          </>
        )}

        {activeTab === 'history' && <HistoryList entries={history} />}
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

      <EditScoreModal
        ref={editScoreModalRef}
        open={editScoreModalOpen}
        score={scoreEditing}
        onSave={handleSaveScore}
        onClose={requestCloseEditScoreModal}
        onCancel={closeEditScoreModal}
        onDirtyChange={setEditScoreDirty}
      />

      <EditAllScoresModal
        open={editAllScoresModalOpen}
        scores={scores}
        onSave={handleSaveAllScores}
        onCancel={closeEditAllScoresModal}
      />

      <CrDrawer open={contactsDrawerOpen} title="Gerenciar contatos" onClose={() => setContactsDrawerOpen(false)} className="cr-drawer--wide">
        <ContactsPanel
          contacts={contacts}
          onSave={handleContactSave}
          onDelete={handleContactDelete}
        />
      </CrDrawer>

      <CrDrawer open={voiceMessagesDrawerOpen} title="Gerenciar mensagens de voz" onClose={() => setVoiceMessagesDrawerOpen(false)} className="cr-drawer--wide">
        <VoiceMessagesPanel
          voiceMessages={voiceMessages}
          onSave={handleVoiceMessageSave}
          onDelete={handleVoiceMessageDelete}
        />
      </CrDrawer>

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
