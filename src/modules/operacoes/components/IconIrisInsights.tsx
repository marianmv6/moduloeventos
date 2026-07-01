import React from 'react';

/** Ícone da aba "Insights da Íris" no Monitor de risco. */
export const IconIrisInsights: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="17"
    height="19"
    viewBox="0 0 17 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <rect width="17" height="19" rx="2" fill="url(#iris-insights-gradient)" />
    <path
      d="M8.5 4.5L9.35 7.1L12 7.9L9.35 8.7L8.5 11.3L7.65 8.7L5 7.9L7.65 7.1L8.5 4.5Z"
      fill="#FFFFFF"
    />
    <path
      d="M12.5 11.5L12.95 12.85L14.3 13.3L12.95 13.75L12.5 15.1L12.05 13.75L10.7 13.3L12.05 12.85L12.5 11.5Z"
      fill="#FFFFFF"
      fillOpacity="0.85"
    />
    <defs>
      <linearGradient id="iris-insights-gradient" x1="0" y1="0" x2="17" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#169EFF" />
        <stop offset="1" stopColor="#0B6FD4" />
      </linearGradient>
    </defs>
  </svg>
);

export default IconIrisInsights;
