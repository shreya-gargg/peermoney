export const C = {
  bone: '#DADED8',   // Aloe — page background
  tan: '#FFFFFF',    // white — card surfaces
  green: '#2C3424',  // Moss — headlines, primary buttons
  moss: '#768064',   // Olive — accents, labels, sliders
  noir: '#4C583E',   // Cypress — body text
  cedar: '#959581',  // Cedar — sidebar/nav, muted elements
  border: 'rgba(149, 149, 129, 0.3)',
  errorRed: '#8B2020',
};

export const PORTFOLIO_CATEGORIES = [
  { key: 'cash',         label: 'Cash / savings', desc: 'Money sitting in accounts — safe but loses value over time to inflation' },
  { key: 'bonds',        label: 'Bonds',          desc: 'Loans to governments or companies — steadier but slower growth' },
  { key: 'mutual_funds', label: 'Mutual funds',   desc: 'Professionally managed, diversified funds — a middle ground between growth and stability' },
  { key: 'stocks',       label: 'Stocks',         desc: 'Ownership in companies — higher risk, higher potential growth' },
] as const;

export type AllocKey = 'stocks' | 'bonds' | 'cash' | 'mutual_funds';
export type AllocState = Record<AllocKey, number>;

export interface UserData {
  user_id?: string;
  age: number;
  income: number;
  net_worth: number;
  stocks: number;
  bonds: number;
  cash: number;
  mutual_funds: number;
  onboarding_complete: boolean;
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K';
  return '$' + Math.round(n);
}
