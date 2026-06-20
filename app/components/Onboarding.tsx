'use client';
import { useState } from 'react';
import { C } from '../lib/constants';

const QUESTIONS = [
  {
    key: 'age',
    q: 'How old are you?',
    placeholder: 'e.g. 28',
    helper: '',
    validate: (v: number) => v >= 18 && v <= 80 ? null : 'Enter an age between 18 and 80.',
  },
  {
    key: 'income',
    q: "What's your annual income?",
    placeholder: 'e.g. 75000',
    helper: 'Include salary, freelance, or any regular income',
    validate: (v: number) => v >= 1000 ? null : 'Enter your annual income.',
  },
  {
    key: 'net_worth',
    q: "How much money have you saved?",
    placeholder: 'e.g. 45000',
    helper: 'Total savings and investments minus any debts (loans, credit cards)',
    validate: () => null,
  },
];

interface Props {
  onComplete: (data: { age: number; income: number; net_worth: number }) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ age: '', income: '', net_worth: '' });
  const [error, setError] = useState('');

  const q = QUESTIONS[step];

  function handleContinue() {
    const raw = values[q.key as keyof typeof values];
    if (!raw || isNaN(+raw)) { setError('Please enter a valid number.'); return; }
    const err = q.validate(+raw);
    if (err) { setError(err); return; }
    setError('');

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete({ age: +values.age, income: +values.income, net_worth: +values.net_worth });
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bone,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 56 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i === step ? C.moss : C.tan,
            border: `1.5px solid ${C.moss}`,
            transition: 'background 0.2s',
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: C.green, marginBottom: 28, textAlign: 'center' }}>
          {q.q}
        </h2>

        <input
          key={q.key}
          type="number"
          placeholder={q.placeholder}
          value={values[q.key as keyof typeof values]}
          onChange={e => setValues(v => ({ ...v, [q.key]: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleContinue()}
          autoFocus
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: 22,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            background: C.tan,
            color: C.noir,
            outline: 'none',
            textAlign: 'center',
          }}
        />

        {q.helper && (
          <p style={{ fontSize: 13, color: C.moss, marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
            {q.helper}
          </p>
        )}

        {error && (
          <p style={{ color: C.errorRed, fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>
        )}

        <button onClick={handleContinue} style={{
          display: 'block', width: '100%', marginTop: 24,
          padding: '14px', background: C.green, color: C.bone,
          border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500,
          cursor: 'pointer',
        }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
