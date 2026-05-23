import React, { useState } from 'react';
import { IconSearch } from '../../risk-rules/components/shared/Icons';

interface CentralControleToolbarSearchProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const CentralControleToolbarSearch: React.FC<CentralControleToolbarSearchProps> = ({
  value,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');
  const query = value ?? internalQuery;

  const handleChange = (next: string) => {
    if (onChange) onChange(next);
    else setInternalQuery(next);
  };

  return (
    <div
      className={`central-controle-search-expand${expanded ? ' is-expanded' : ''}`}
      onMouseLeave={() => setExpanded(false)}
    >
      <input
        type="search"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        placeholder="Busque por placa, prefixo ou motorista"
        className="central-controle-search-expand__input"
        autoComplete="off"
        aria-label="Busque por placa, prefixo ou motorista"
      />
      <span
        className="central-controle-search-expand__icon"
        onMouseEnter={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') setExpanded(true);
        }}
        aria-label="Buscar"
      >
        <IconSearch />
      </span>
    </div>
  );
};

export default CentralControleToolbarSearch;
