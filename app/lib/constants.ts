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
  birthday: string | null;
  age: number;
  income: number;
  net_worth: number;
  stocks: number;
  bonds: number;
  cash: number;
  mutual_funds: number;
  onboarding_complete: boolean;
}

// Derive current age from a stored birthday (YYYY-MM-DD)
export function getAgeFromBirthday(birthday: string): number {
  const today = new Date();
  const dob = new Date(birthday);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Convert dollar amounts into whole-number percentages that always sum to 100
export function amountsToPercentages(amounts: Record<AllocKey, number>): AllocState {
  const keys = PORTFOLIO_CATEGORIES.map(c => c.key) as AllocKey[];
  const total = keys.reduce((s, k) => s + amounts[k], 0);
  if (total <= 0) return { stocks: 0, bonds: 0, cash: 0, mutual_funds: 0 };

  const rounded = keys.map(k => Math.round((amounts[k] / total) * 100));
  const diff = 100 - rounded.reduce((a, b) => a + b, 0);
  if (diff !== 0) {
    let largestIdx = 0;
    keys.forEach((k, i) => { if (amounts[k] > amounts[keys[largestIdx]]) largestIdx = i; });
    rounded[largestIdx] += diff;
  }
  return Object.fromEntries(keys.map((k, i) => [k, rounded[i]])) as AllocState;
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K';
  return '$' + Math.round(n);
}
