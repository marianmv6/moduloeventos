import React from 'react';
import { CrModal } from '../../risk-rules/components/shared/CrModal';
import { getBehaviorEvolutionForOccurrence } from '../mocks/tratativaBehaviorEvolution.mock';
import type { MonitorRiscoListagemItem } from '../types/monitorRisco.types';
import { TratativaBehaviorEvolutionPanel } from './TratativaBehaviorEvolutionPanel';

interface MonitorRiscoBehaviorEvolutionModalProps {
  item: MonitorRiscoListagemItem | null;
  onClose: () => void;
}

export const MonitorRiscoBehaviorEvolutionModal: React.FC<
  MonitorRiscoBehaviorEvolutionModalProps
> = ({ item, onClose }) => {
  if (!item) return null;

  const behaviorEvolution = getBehaviorEvolutionForOccurrence(item.id, {
    scheduledReturnMinutes: item.returnConfirmationMinutes,
  });

  return (
    <CrModal
      open
      title="Evolução comportamental"
      onClose={onClose}
      cancelLabel="Fechar"
      fullScreen
    >
      <div className="tratativa-body tratativa-behavior-evolution-tab monitor-risco-behavior-evolution-modal">
        <TratativaBehaviorEvolutionPanel data={behaviorEvolution} />
      </div>
    </CrModal>
  );
};

export default MonitorRiscoBehaviorEvolutionModal;
