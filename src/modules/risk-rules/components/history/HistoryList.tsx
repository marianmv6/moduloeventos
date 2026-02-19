import React from 'react';
import type { HistoryEntry } from '../../types/risk.types';

const actionLabels: Record<HistoryEntry['action'], string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  activate: 'Ativação',
  deactivate: 'Desativação',
};

/** Tipo do que foi modificado para exibição na coluna Tipo */
const entityLabels: Record<HistoryEntry['entityType'], string> = {
  policy: 'Política de avaliação',
  score: 'Pontuação',
  treatment: 'Tratativa',
  contact: 'Contato',
  voice: 'Mensagem de voz',
};

interface HistoryListProps {
  entries: HistoryEntry[];
  loading?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, loading }) => {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="history-list loading">Carregando histórico...</div>;
  }

  if (entries.length === 0) {
    return <div className="history-list empty">Nenhum registro no histórico.</div>;
  }

  return (
    <div className="history-list">
      <table className="list-table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Tipo</th>
            <th>Ação</th>
            <th>Usuário</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDate(entry.timestamp)}</td>
              <td>{entityLabels[entry.entityType]}</td>
              <td>{entry.actionDescription ?? actionLabels[entry.action]}</td>
              <td>{entry.userEmail ?? entry.userName ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryList;
