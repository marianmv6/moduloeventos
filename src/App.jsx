import React, { Suspense, useState } from 'react';
import { RiskRulesPage } from './modules/risk-rules';
import { requestRiskRulesNavigation } from './modules/risk-rules/utils/riskRulesNavigationGuard';
import {
  OperacoesEventosPage,
  OperacoesCentralPage,
  OperacoesAuditoriaPage,
} from './modules/operacoes';
import { AppSidebar } from './components/layout/AppSidebar';
import { isModuloEventosDeploy } from './config/deployTarget';
import './App.css';

const MonitorRiscoPage =
  import.meta.env.VITE_DEPLOY_TARGET === 'moduloeventos'
    ? React.lazy(() =>
        import('./modules/operacoes/pages/MonitorRiscoPage').then((module) => ({
          default: module.MonitorRiscoPage,
        })),
      )
    : null;

function App() {
  const [menuLevel, setMenuLevel] = useState('operacoes');
  const [activeRoute, setActiveRoute] = useState(
    isModuloEventosDeploy ? 'monitor-risco' : 'operacoes-eventos',
  );

  const handleRouteChange = (route) => {
    requestRiskRulesNavigation(() => {
      setActiveRoute(route);
      const operacoesRoutes = [
        'operacoes-eventos',
        'central-operacoes',
        ...(isModuloEventosDeploy ? ['monitor-risco'] : []),
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
    if (isModuloEventosDeploy && activeRoute === 'monitor-risco' && MonitorRiscoPage) {
      return (
        <Suspense fallback={null}>
          <MonitorRiscoPage />
        </Suspense>
      );
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
