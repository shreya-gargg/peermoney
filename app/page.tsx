'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { UserData, AllocState, C } from './lib/constants';
import Welcome from './components/Welcome';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import Portfolio from './components/Portfolio';
import Dashboard from './components/Dashboard';

type Screen = 'loading' | 'welcome' | 'auth' | 'onboarding' | 'portfolio' | 'dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [onboardingBase, setOnboardingBase] = useState<{ age: number; income: number; net_worth: number } | null>(null);

  async function loadUserData(u: User) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', u.id)
      .single();

    if (data?.onboarding_complete) {
      setUserData(data);
      setScreen('dashboard');
    } else {
      setScreen('onboarding');
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        setScreen('welcome');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
        setScreen('welcome');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthSuccess() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setUser(session.user);
    await loadUserData(session.user);
  }

  async function handlePortfolioComplete(alloc: AllocState) {
    if (!user || !onboardingBase) return;

    const row = {
      user_id: user.id,
      ...onboardingBase,
      ...alloc,
      onboarding_complete: true,
    };

    const { data } = await supabase
      .from('users')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();

    if (data) {
      setUserData(data);
      setScreen('dashboard');
    }
  }

  // Loading spinner
  if (screen === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', background: C.bone,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 14, color: C.moss }}>Loading...</div>
      </div>
    );
  }

  if (screen === 'welcome') return <Welcome onStart={() => setScreen('auth')} />;
  if (screen === 'auth') return <AuthScreen onSuccess={handleAuthSuccess} />;
  if (screen === 'onboarding') {
    return (
      <Onboarding onComplete={base => {
        setOnboardingBase(base);
        setScreen('portfolio');
      }} />
    );
  }
  if (screen === 'portfolio') {
    return <Portfolio netWorth={onboardingBase?.net_worth ?? 0} onComplete={handlePortfolioComplete} />;
  }
  if (screen === 'dashboard' && userData && user) {
    return (
      <Dashboard
        userData={userData}
        userId={user.id}
        onSignOut={() => setScreen('welcome')}
      />
    );
  }

  return null;
}
