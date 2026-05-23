import React, { useState } from 'react';
import { RiskRulesPage } from './modules/risk-rules';
import { OperacoesEventosPage, OperacoesCentralPage } from './modules/operacoes';
import { AppSidebar } from './components/layout/AppSidebar';
import './App.css';

function App() {
  const [menuLevel, setMenuLevel] = useState('configuracoes');
  const [activeRoute, setActiveRoute] = useState('regras-tratativa');

  const handleRouteChange = (route) => {
    setActiveRoute(route);
    if (route === 'contatos' || route === 'email-automatico' || route === 'mensagem-voz') {
      setMenuLevel('cadastros');
    } else if (
      route === 'regras-tratativa' ||
      route === 'tipos-evento' ||
      route === 'tratativas'
    ) {
      setMenuLevel('configuracoes');
    } else if (route === 'central-operacoes' || route === 'operacoes-eventos') {
      setMenuLevel('operacoes');
    }
  };

  const renderContent = () => {
    if (activeRoute === 'operacoes-eventos') {
      return <OperacoesEventosPage />;
    }
    if (activeRoute === 'central-operacoes') {
      return <OperacoesCentralPage />;
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
