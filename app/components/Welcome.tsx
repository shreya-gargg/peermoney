'use client';
import { C } from '../lib/constants';

export default function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bone,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: C.green, marginBottom: 16, lineHeight: 1.1 }}>
        PeerMoney
      </h1>
      <p style={{ fontSize: 18, color: C.noir, marginBottom: 48, maxWidth: 400, lineHeight: 1.6 }}>
        Find out where you actually stand — and what you can do about it.
      </p>
      <button
        onClick={onStart}
        style={{
          background: C.green,
          color: C.bone,
          border: 'none',
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 500,
          padding: '14px 48px',
          cursor: 'pointer',
        }}
      >
        Get started
      </button>
      <p style={{ fontSize: 12, color: C.moss, marginTop: 16, maxWidth: 360, lineHeight: 1.5 }}>
        PeerMoney is for educational purposes only and does not constitute professional financial advice.
      </p>
    </div>
  );
}
