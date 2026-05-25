import React, { useState } from 'react';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { IconView } from '../../risk-rules/components/shared/Icons';
import { TratativaOcorrenciaModal } from '../components/TratativaOcorrenciaModal';
import { mockAuditoriaRows } from '../mocks/operacoesAuditoria.mock';
import type { AuditoriaRow } from '../types/operacoesAuditoria.types';

export const OperacoesAuditoriaPage: React.FC = () => {
  const [selected, setSelected] = useState<AuditoriaRow | null>(null);

  return (
    <div className="operacoes-eventos-page page-layout content-body">
      <div className="content-toolbar top-bar operacoes-eventos-toolbar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Auditoria</h1>
        </div>
      </div>

      <section className="operacoes-eventos-list operacoes-auditoria-list">
        <div className="operacoes-eventos-table-wrap">
          <table className="list-table operacoes-eventos-table">
            <thead>
              <tr>
                <th className="operacoes-col-data">Empresa</th>
                <th className="operacoes-col-data">Data / hora da tratativa</th>
                <th className="operacoes-col-data">Tratado por</th>
                <th className="operacoes-col-data">Placa / prefixo</th>
                <th className="operacoes-col-data">Motorista</th>
                <th className="list-cell-actions operacoes-col-acoes-header" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {mockAuditoriaRows.map((row) => (
                <tr key={row.id}>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.companyName} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.treatedAt} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.treatedBy} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.vehicleId} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.driverName} />
                  </td>
                  <td className="list-cell-actions">
                    <div className="list-actions">
                      <button
                        type="button"
                        className="btn btn-icon-action operacoes-view-btn"
                        aria-label="Visualizar"
                        title="Visualizar"
                        onClick={() => setSelected(row)}
                      >
                        <IconView />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <TratativaOcorrenciaModal
          open
          mode="auditoria"
          data={selected.occurrenceSnapshot}
          history={selected.history}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default OperacoesAuditoriaPage;
