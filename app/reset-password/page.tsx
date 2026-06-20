'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../lib/constants';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase reads the recovery token from the URL hash and creates a session automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
    });
  }, []);

  async function handleSubmit() {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  }

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
        <h2 style={{ fontSize: 28, fontWeight: 600, color: C.green, marginBottom: 6 }}>
          Set a new password
        </h2>

        {!ready && !done && (
          <p style={{ fontSize: 14, color: C.cedar, marginTop: 16 }}>
            Verifying your reset link...
          </p>
        )}

        {ready && !done && (
          <>
            <p style={{ fontSize: 16, color: C.noir, marginBottom: 32 }}>
              Choose a new password for your account.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, color: C.moss, marginBottom: 6 }}>New password</label>
              <input type="password" value={password} placeholder="6+ characters"
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={input} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: C.moss, marginBottom: 6 }}>Confirm password</label>
              <input type="password" value={confirm} placeholder="Re-enter password"
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={input} />
            </div>

            {error && <p style={{ color: C.errorRed, fontSize: 13, marginBottom: 14 }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '14px', background: C.green, color: C.bone,
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Saving...' : 'Save new password →'}
            </button>
          </>
        )}

        {done && (
          <>
            <p style={{ fontSize: 15, color: C.moss, lineHeight: 1.6, marginBottom: 24 }}>
              Your password has been updated. You can now log in with your new password.
            </p>
            <a href="/" style={{
              display: 'block', width: '100%', padding: '14px', textAlign: 'center',
              background: C.green, color: C.bone, borderRadius: 12,
              fontSize: 16, fontWeight: 500, textDecoration: 'none', boxSizing: 'border-box',
            }}>
              Go to PeerMoney →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
