export type NavigationProceed = () => void;
export type RiskRulesNavigationGuard = (proceed: NavigationProceed) => void;

let guard: RiskRulesNavigationGuard | null = null;

export function setRiskRulesNavigationGuard(fn: RiskRulesNavigationGuard | null): void {
  guard = fn;
}

export function requestRiskRulesNavigation(proceed: NavigationProceed): void {
  if (guard) {
    guard(proceed);
  } else {
    proceed();
  }
}
