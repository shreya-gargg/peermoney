'use client';
import { useState } from 'react';
import { C, PORTFOLIO_CATEGORIES, AllocKey, AllocState, fmt, amountsToPercentages } from '../lib/constants';

const DEFAULT_AMOUNTS: Record<AllocKey, number> = { stocks: 0, bonds: 0, cash: 0, mutual_funds: 0 };

export default function Portfolio({ netWorth, onComplete }: { netWorth: number; onComplete: (alloc: AllocState) => void }) {
  const [amounts, setAmounts] = useState<Record<AllocKey, number>>(DEFAULT_AMOUNTS);

  const total = Object.values(amounts).reduce((a, b) => a + b, 0);
  const isGood = total > 0;
  const sliderMax = Math.max(netWorth, 1000);

  function update(k: AllocKey, v: number) {
    setAmounts(a => ({ ...a, [k]: Math.max(0, v) }));
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bone,
      padding: '2.5rem 2rem',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: C.green, marginBottom: 8 }}>
        How is your money invested?
      </h2>
      <p style={{ fontSize: 16, color: C.noir, marginBottom: 8, lineHeight: 1.7 }}>
        Enter the dollar amount you have in each category — using the slider or the box. We'll calculate the percentages for you.
      </p>
      {netWorth > 0 && (
        <p style={{ fontSize: 13, color: C.moss, marginBottom: 36 }}>
          You said you've saved {fmt(netWorth)} total — that's a helpful reference as you fill these in.
        </p>
      )}

      {PORTFOLIO_CATEGORIES.map(({ key, label, desc }) => (
        <div key={key} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: C.noir }}>{label}</span>
          </div>
          <p style={{ fontSize: 13, color: C.moss, marginBottom: 10, lineHeight: 1.5 }}>{desc}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input
              type="range" min={0} max={sliderMax} value={amounts[key]}
              onChange={e => update(key, +e.target.value)}
              style={{ flex: 1 }}
            />
            <div style={{ position: 'relative', width: 120 }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, color: C.cedar,
              }}>$</span>
              <input
                type="number" min={0} value={amounts[key] === 0 ? '' : amounts[key]}
                placeholder="0"
                onChange={e => update(key, e.target.value === '' ? 0 : +e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px 8px 22px',
                  fontSize: 15, border: `1px solid ${C.border}`, borderRadius: 8,
                  background: C.tan, color: C.noir, outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{
        padding: '10px 16px',
        borderRadius: 8,
        background: isGood ? 'rgba(136, 144, 99, 0.15)' : 'rgba(139, 32, 32, 0.1)',
        color: isGood ? C.moss : C.errorRed,
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 28,
        marginTop: 4,
      }}>
        Total entered: {fmt(total)}&nbsp;
        {isGood ? '✓ Looks good!' : '— enter at least one amount to continue'}
      </div>

      <button onClick={() => onComplete(amountsToPercentages(amounts))} disabled={!isGood} style={{
        width: '100%', padding: '14px',
        background: isGood ? C.green : '#B0A898',
        color: C.bone, border: 'none', borderRadius: 12,
        fontSize: 16, fontWeight: 500,
        cursor: isGood ? 'pointer' : 'not-allowed',
      }}>
        See my results →
      </button>
    </div>
  );
}
