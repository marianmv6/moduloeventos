import React, { useState } from 'react';
import { RiskRulesPage } from './modules/risk-rules';
import { requestRiskRulesNavigation } from './modules/risk-rules/utils/riskRulesNavigationGuard';
import {
  OperacoesEventosPage,
  OperacoesCentralPage,
  OperacoesAuditoriaPage,
  MonitorRiscoPage,
} from './modules/operacoes';
import { AppSidebar } from './components/layout/AppSidebar';
import './App.css';

function App() {
  const [menuLevel, setMenuLevel] = useState('operacoes');
  const [activeRoute, setActiveRoute] = useState('operacoes-eventos');

  const handleRouteChange = (route) => {
    requestRiskRulesNavigation(() => {
      setActiveRoute(route);
      const operacoesRoutes = [
        'operacoes-eventos',
        'central-operacoes',
        'monitor-risco',
        'operacoes-auditoria',
      ];
      if (operacoesRoutes.includes(route)) {
        setMenuLevel('operacoes');
      }
    });
  };

  const renderContent = () => {
    if (activeRoute === 'operacoes-eventos') {
      return <OperacoesEventosPage />;
    }
    if (activeRoute === 'central-operacoes') {
      return <OperacoesCentralPage />;
    }
    if (activeRoute === 'operacoes-auditoria') {
      return <OperacoesAuditoriaPage />;
    }
    if (activeRoute === 'monitor-risco') {
      return <MonitorRiscoPage />;
    }
    return <RiskRulesPage appRoute={activeRoute} />;
  };

  return (
    <div className="app">
      <AppSidebar
        menuLevel={menuLevel}
        activeRoute={activeRoute}
        onMenuLevelChange={setMenuLevel}
        onRouteChange={handleRouteChange}
      />
      <main className="app-main">
        <header className="app-header top-bar">
          <h1 className="app-header-title">Creare Sistemas</h1>
        </header>
        <div className="app-content">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
