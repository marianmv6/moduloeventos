import React from 'react';
import type { ModalSelectOption } from '../shared/ModalSelect';
import { ModalSelect } from '../shared/ModalSelect';
import { InfoTooltip } from '../shared/InfoTooltip';
import {
  POLICY_CONTINUITY_INFO,
  POLICY_CONTINUITY_INTERVAL_DEFAULT,
  POLICY_CONTINUITY_INTERVAL_MAX,
  POLICY_CONTINUITY_INTERVAL_MIN,
  POLICY_CONTINUITY_OPTIONS,
  clampPolicyContinuityIntervalMinutes,
  parsePolicyContinuityIntervalInput,
} from '../../constants/policyContinuity.constants';
import { POLICY_RISK_LEVELS } from '../../constants/policyRiskLevel.constants';
import type { PolicyTriggerNivelRisco } from '../../types/risk.types';
import type { PolicyRiskGatilhoState, PolicyRiskGatilhosState } from '../../utils/policyRiskLevelState';

interface PolicyRiskLevelCardsProps {
  value: PolicyRiskGatilhosState;
  trailOptions: ModalSelectOption[];
  onChange: (value: PolicyRiskGatilhosState) => void;
}

function parsePointsInput(raw: string, max = 999): number {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return 0;
  const normalized = digits.replace(/^0+/, '') || '0';
  return Math.min(max, Number(normalized));
}

export const PolicyRiskLevelCards: React.FC<PolicyRiskLevelCardsProps> = ({
  value,
  trailOptions,
  onChange,
}) => {
  const updateLevel = (level: PolicyTriggerNivelRisco, patch: Partial<PolicyRiskGatilhoState>) => {
    onChange({
      ...value,
      [level]: { ...value[level], ...patch },
    });
  };

  const toggleLevel = (level: PolicyTriggerNivelRisco, enabled: boolean) => {
    if (enabled) {
      updateLevel(level, {
        enabled: true,
        trilhaId: value[level].trilhaId,
        ...(level === 'critical' && {
          tratamentoContinuidade: value[level].tratamentoContinuidade ?? 'first_critical_only',
        }),
      });
      return;
    }

    onChange({
      ...value,
      [level]: {
        enabled: false,
        aPartirDePontos: 0,
        trilhaId: '',
        tratamentoContinuidade: undefined,
        intervaloMinutos: undefined,
      },
    });
  };

  return (
    <div className="policy-risk-cards">
      {POLICY_RISK_LEVELS.map(({ level, label, cardClassName }) => {
        const item = value[level];
        const disabled = !item.enabled;

        return (
          <div
            key={level}
            className={`policy-risk-card ${cardClassName}${disabled ? ' policy-risk-card--disabled' : ''}`}
          >
            <div className="policy-risk-card__header">
              <span className="policy-risk-card__title">{label}</span>
              <label className="policy-risk-card__checkbox-wrap">
                <input
                  type="checkbox"
                  className="policy-risk-card__checkbox"
                  checked={item.enabled}
                  onChange={(event) => toggleLevel(level, event.target.checked)}
                  aria-label={`Ativar ${label}`}
                />
              </label>
            </div>

            <div className="policy-risk-card__body">
              <div className="policy-risk-card__field">
                <label className="policy-risk-card__field-label" htmlFor={`policy-risk-points-${level}`}>
                  A partir de
                </label>
                <div className="policy-risk-card__points-wrap">
                  <input
                    id={`policy-risk-points-${level}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    className="policy-risk-card__points-input"
                    value={disabled ? '' : item.aPartirDePontos === 0 ? '0' : String(item.aPartirDePontos)}
                    placeholder={disabled ? 'Preencher' : undefined}
                    disabled={disabled}
                    onChange={(event) =>
                      updateLevel(level, { aPartirDePontos: parsePointsInput(event.target.value, 999) })
                    }
                    aria-valuemin={0}
                    aria-valuemax={999}
                  />
                  <span className="policy-risk-card__points-suffix">pontos</span>
                </div>
              </div>

              <div className="policy-risk-card__field">
                <ModalSelect
                  id={`policy-risk-trail-${level}`}
                  label="Solicitar tratativa"
                  value={item.trilhaId}
                  onChange={(trailId) => updateLevel(level, { trilhaId: trailId })}
                  options={trailOptions}
                  placeholder={disabled ? 'Selecionar' : 'Selecione a trilha'}
                  disabled={disabled}
                  mutedPlaceholder={disabled}
                />
              </div>

              {level === 'critical' && item.enabled && (
                <div className="policy-form-continuity-row policy-risk-card__continuity">
                  <div className="policy-form-continuity-label-row">
                    <span className="modal-select__label">Tratamento de continuidade</span>
                    <InfoTooltip text={POLICY_CONTINUITY_INFO} />
                  </div>
                  <div className="policy-form-continuity-fields">
                    <ModalSelect
                      id={`policy-risk-continuity-${level}`}
                      value={item.tratamentoContinuidade ?? 'first_critical_only'}
                      onChange={(continuity) =>
                        updateLevel(level, {
                          tratamentoContinuidade: continuity as PolicyRiskGatilhoState['tratamentoContinuidade'],
                          intervaloMinutos:
                            continuity === 'interval'
                              ? item.intervaloMinutos ?? POLICY_CONTINUITY_INTERVAL_DEFAULT
                              : undefined,
                        })
                      }
                      options={POLICY_CONTINUITY_OPTIONS}
                      placeholder="Selecione"
                      className="policy-form-continuity-select"
                    />
                    {item.tratamentoContinuidade === 'interval' && (
                      <div className="policy-form-continuity-interval">
                        <input
                          id={`policy-risk-continuity-minutes-${level}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={2}
                          className="policy-form-continuity-interval__input"
                          value={String(item.intervaloMinutos ?? POLICY_CONTINUITY_INTERVAL_DEFAULT)}
                          onChange={(event) =>
                            updateLevel(level, {
                              intervaloMinutos: parsePolicyContinuityIntervalInput(event.target.value),
                            })
                          }
                          onBlur={(event) =>
                            updateLevel(level, {
                              intervaloMinutos: clampPolicyContinuityIntervalMinutes(
                                parsePolicyContinuityIntervalInput(event.target.value),
                              ),
                            })
                          }
                          aria-label="Minutos do intervalo"
                          aria-valuemin={POLICY_CONTINUITY_INTERVAL_MIN}
                          aria-valuemax={POLICY_CONTINUITY_INTERVAL_MAX}
                        />
                        <span className="policy-form-continuity-interval__suffix">minutos</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PolicyRiskLevelCards;
