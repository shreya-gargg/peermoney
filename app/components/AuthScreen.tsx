'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../lib/constants';

const input: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 16,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  background: C.tan,
  color: C.noir,
  outline: 'none',
};

export default function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'signup' | 'login' | 'forgot'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit() {
    if (!email || !password) { setError('Please fill in both fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (mode === 'signup' && !agreed) { setError('Please acknowledge the disclaimer to continue.'); return; }
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user && !data.session) {
        // Email confirmation is required — no session yet, so don't proceed to onSuccess
        setLoading(false);
        setNeedsConfirmation(true);
        return;
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError('Incorrect email or password.'); setLoading(false); return; }
    }

    setLoading(false);
    onSuccess();
  }

  async function handleResetRequest() {
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setResetSent(true);
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
      <div style={{ width: '100%', maxWidth: 400 }}>
        {needsConfirmation ? (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.green, marginBottom: 6 }}>
              Check your email
            </h2>
            <p style={{ fontSize: 16, color: C.noir, lineHeight: 1.6, marginBottom: 24 }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and log in.
            </p>
            <button onClick={() => { setNeedsConfirmation(false); setMode('login'); setError(''); }} style={{
              width: '100%', padding: '14px', background: C.green, color: C.bone,
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500, cursor: 'pointer',
            }}>
              Back to log in →
            </button>
          </>
        ) : mode === 'forgot' ? (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.green, marginBottom: 6 }}>
              Reset your password
            </h2>
            <p style={{ fontSize: 16, color: C.noir, marginBottom: 32 }}>
              Enter your email and we'll send you a link to reset it.
            </p>

            {resetSent ? (
              <p style={{ fontSize: 14, color: C.moss, lineHeight: 1.6, marginBottom: 20 }}>
                Check your email for a link to reset your password.
              </p>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: C.moss, marginBottom: 6 }}>Email</label>
                <input type="email" value={email} placeholder="you@example.com"
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleResetRequest()}
                  style={input} />
              </div>
            )}

            {error && <p style={{ color: C.errorRed, fontSize: 13, marginBottom: 14 }}>{error}</p>}

            {!resetSent && (
              <button onClick={handleResetRequest} disabled={loading} style={{
                width: '100%', padding: '14px', background: C.green, color: C.bone,
                border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            )}

            <button onClick={() => { setMode('login'); setError(''); setResetSent(false); }} style={{
              display: 'block', margin: '18px auto 0', background: 'none', border: 'none',
              fontSize: 13, color: C.moss, cursor: 'pointer', textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}>
              ← Back to log in
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.green, marginBottom: 6 }}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ fontSize: 16, color: C.noir, marginBottom: 32 }}>
              {mode === 'signup' ? 'Takes less than a minute.' : 'Log in to see your comparison.'}
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {(['signup', 'login'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }}
                  style={{
                    padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
                    fontSize: 14, cursor: 'pointer',
                    background: mode === m ? C.green : 'transparent',
                    color: mode === m ? C.bone : C.noir,
                    fontWeight: mode === m ? 500 : 400,
                  }}>
                  {m === 'signup' ? 'Sign up' : 'Log in'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, color: C.moss, marginBottom: 6 }}>Email</label>
              <input type="email" value={email} placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={input} />
            </div>
            <div style={{ marginBottom: mode === 'login' ? 10 : 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: C.moss, marginBottom: 6 }}>Password</label>
              <input type="password" value={password} placeholder="6+ characters"
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={input} />
            </div>

            {mode === 'login' && (
              <button onClick={() => { setMode('forgot'); setError(''); }} style={{
                display: 'block', background: 'none', border: 'none', padding: 0,
                fontSize: 13, color: C.moss, cursor: 'pointer', textDecoration: 'underline',
                textUnderlineOffset: 3, marginBottom: 20,
              }}>
                Forgot password?
              </button>
            )}

            {mode === 'signup' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: C.green, width: 15, height: 15, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: C.noir, lineHeight: 1.5 }}>
                  I understand PeerMoney is educational and not a substitute for professional financial advice.
                </span>
              </label>
            )}

            {error && <p style={{ color: C.errorRed, fontSize: 13, marginBottom: 14 }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '14px', background: C.green, color: C.bone,
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account →' : 'Log in →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
