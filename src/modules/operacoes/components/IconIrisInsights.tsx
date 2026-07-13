import React, { useId } from 'react';
import irisInsightsImage from '../assets/iris-insights-icon.png';

/** Ícone da aba "Insights da Íris" no Monitor de risco. */
export const IconIrisInsights: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const uid = useId().replace(/:/g, '');
  const patternId = `iris-insights-pattern-${uid}`;
  const imageId = `iris-insights-image-${uid}`;

  return (
    <svg
      width="17"
      height="19"
      viewBox="0 0 17 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="17" height="19" rx="2" fill={`url(#${patternId})`} />
      <defs>
        <pattern id={patternId} patternContentUnits="objectBoundingBox" width="1" height="1">
          <use href={`#${imageId}`} transform="matrix(0.00158307 0 0 0.00141643 -0.0129145 0)" />
        </pattern>
        <image
          id={imageId}
          width="648"
          height="706"
          preserveAspectRatio="none"
          href={irisInsightsImage}
        />
      </defs>
    </svg>
  );
};

export default IconIrisInsights;
