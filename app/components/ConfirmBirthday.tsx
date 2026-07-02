'use client';
import { useState } from 'react';
import { C, getAgeFromBirthday } from '../lib/constants';

const TODAY = new Date().toISOString().split('T')[0];

interface Props {
  onComplete: (birthday: string) => void;
}

// One-time prompt for existing users who signed up before we switched from
// raw age to birthday — we don't have their birthday on file yet.
export default function ConfirmBirthday({ onComplete }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleContinue() {
    if (!value) { setError('Please select your birthday.'); return; }
    const age = getAgeFromBirthday(value);
    if (age < 18 || age > 80) { setError('You must be between 18 and 80 years old to use PeerMoney.'); return; }
    setError('');
    onComplete(value);
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
      <div style={{ width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: C.green, marginBottom: 12, textAlign: 'center' }}>
          What&apos;s your birthday?
        </h2>
        <p style={{ fontSize: 13, color: C.moss, marginBottom: 28, textAlign: 'center', lineHeight: 1.5 }}>
          We now calculate your age from your birthday instead of asking you to keep it updated. This is a one-time step.
        </p>

        <input
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleContinue()}
          autoFocus
          max={TODAY}
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
