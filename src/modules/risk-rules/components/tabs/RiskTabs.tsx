import React from 'react';
import type { RiskTabId } from '../../types/risk.types';

interface TabItem {
  id: RiskTabId;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'scores', label: 'Pontuações' },
  { id: 'treatments', label: 'Tratativas' },
  { id: 'policy', label: 'Política de avaliação' },
  { id: 'history', label: 'Histórico' },
];

interface RiskTabsProps {
  activeTab: RiskTabId;
  onTabChange: (tab: RiskTabId) => void;
}

export const RiskTabs: React.FC<RiskTabsProps> = ({ activeTab, onTabChange }) => (
  <div className="risk-tabs">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        className={`risk-tab ${activeTab === tab.id ? 'risk-tab--active' : ''}`}
        onClick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default RiskTabs;
