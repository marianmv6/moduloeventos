import React from 'react';

/** Cadastros: quadrado arredondado, lista à esquerda e check à direita (cor herdada do menu) */
export const IconCadastros: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
    <path d="M7 8h5M7 12h5M7 16h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path
      d="M14.5 9.5l2 2.5 4-4.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/** Contatos: grupo de usuários */
export const IconUsersGroup: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <circle cx="9" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" fill="none" />
    <path
      d="M3.5 19.5c0-3.03 2.46-5.5 5.5-5.5s5.5 2.47 5.5 5.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="17" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" fill="none" />
    <path
      d="M14.5 19.5c0-2.2 1.57-4 3.5-4.35"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const IconConfiguracoes: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/** Eventos (menu Configurações) */
export const IconEventos: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/** Tratativas (menu Configurações) */
export const IconTratativas: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
);

export const IconRegrasTratativa: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const IconVideomonitoramento: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const IconTelemetria: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/** E-mail automático: envelope */
export const IconEmail: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 7L2 7" />
  </svg>
);

/** Operações (menu raiz) */
export const IconOperacoes: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/** Central de controle */
export const IconCentralOperacoes: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="19"
    height="20"
    viewBox="0 0 19 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <path
      d="M8.07292 11.7188H9.63542V4.94792H8.07292V11.7188ZM11.1979 10.1562H12.7604V5.98958H11.1979V10.1562ZM4.94792 9.63542H6.51042V5.98958H4.94792V9.63542ZM3.125 19.7917V15.593C2.13542 14.6902 1.36719 13.6556 0.820313 12.4891C0.273438 11.3224 0 10.1083 0 8.84687C0 6.38941 0.860851 4.30061 2.58255 2.58047C4.30408 0.860157 6.39462 0 8.85417 0C10.8774 0 12.6866 0.604687 14.2818 1.81406C15.8771 3.02326 16.9131 4.5921 17.3898 6.52057L18.6068 11.3273C18.6849 11.6244 18.6298 11.8941 18.4414 12.1365C18.2532 12.3788 18.0022 12.5 17.6883 12.5H15.625V15.8253C15.625 16.3431 15.4406 16.7865 15.0719 17.1552C14.7031 17.524 14.2598 17.7083 13.7419 17.7083H11.4583V19.7917H9.89583V16.1458H13.7419C13.8355 16.1458 13.9123 16.1158 13.9724 16.0557C14.0325 15.9957 14.0625 15.9188 14.0625 15.8253V10.9375H16.875L15.8854 6.90104C15.4861 5.31458 14.6321 4.02821 13.3234 3.04193C12.0146 2.05564 10.5248 1.5625 8.85417 1.5625C6.84028 1.5625 5.12153 2.26658 3.69792 3.67474C2.27431 5.0829 1.5625 6.79531 1.5625 8.81198C1.5625 9.85208 1.77517 10.8401 2.20052 11.776C2.62587 12.712 3.22917 13.5439 4.01042 14.2719L4.6875 14.8958V19.7917H3.125Z"
      fill="currentColor"
    />
  </svg>
);

/** Eventos (menu Operações) */
export const IconOperacoesEventos: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
    <circle cx="19" cy="17" r="3" />
  </svg>
);

/** Auditoria: clipboard com check de validação. */
export const IconAuditoria: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
    <path d="M5 6h14v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6z" />
    <path d="M9 13l2 2 4-4" />
  </svg>
);

/** Mensagem voz: microfone */
export const IconMensagemVoz: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);
