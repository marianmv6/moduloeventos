import React, { useState } from 'react';

interface LevelTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export const LevelTooltip: React.FC<LevelTooltipProps> = ({ text, children, className = '' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`level-tooltip-wrap ${className}`.trim()}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="level-tooltip" role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
};

export default LevelTooltip;
