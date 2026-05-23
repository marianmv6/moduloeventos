import React from 'react';

/** Marcadores mock (clusters) para o mapa da visão geral */
const MAP_CLUSTERS = [
  { id: 'c1', label: '23', top: '38%', left: '52%' },
  { id: 'c2', label: '1', top: '55%', left: '48%' },
  { id: 'c3', label: '8', top: '62%', left: '58%' },
  { id: 'c4', label: '12', top: '45%', left: '62%' },
] as const;

export const OperacoesEventosMap: React.FC = () => {
  return (
    <div className="operacoes-eventos-map" role="img" aria-label="Mapa de eventos">
      <div className="operacoes-eventos-map__canvas">
        <svg
          className="operacoes-eventos-map__land"
          viewBox="0 0 400 520"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <rect width="400" height="520" fill="#dce8f0" />
          <path
            d="M80 120 Q120 80 180 100 T280 90 Q340 110 360 160 L350 280 Q320 380 260 420 L140 450 Q60 400 50 300 Z"
            fill="#c5d9e8"
            stroke="#a8c4d8"
            strokeWidth="1"
          />
          <path
            d="M200 200 Q240 180 300 220 L320 350 Q280 400 220 380 L180 320 Q160 260 200 200Z"
            fill="#b8d0e2"
          />
        </svg>
        {MAP_CLUSTERS.map((cluster) => (
          <button
            key={cluster.id}
            type="button"
            className="operacoes-eventos-map__marker"
            style={{ top: cluster.top, left: cluster.left }}
            aria-label={`${cluster.label} eventos nesta região`}
          >
            {cluster.label}
          </button>
        ))}
      </div>
    </div>
  );
};
