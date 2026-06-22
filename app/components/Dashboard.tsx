'use client';
import { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip } from 'chart.js';
import { supabase } from '../lib/supabase';
import {
  C, PORTFOLIO_CATEGORIES, AllocKey, UserData, fmt, amountsToPercentages,
} from '../lib/constants';

ChartJS.register(LinearScale, PointElement, Tooltip);

type Tab = 'dashboard' | 'profile' | 'settings' | 'feedback' | 'learn';

// ── Icons ────────────────────────────────────────────────────────────────────
function IconGrid({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconPerson({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconChat({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function IconBook({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function IconGear({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.tan,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '20px 24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Dashboard tab ─────────────────────────────────────────────────────────────
function DashboardTab({ userData, peers }: { userData: UserData; peers: any[] }) {
  const [priorityExpanded, setPriorityExpanded] = useState(false);

  // Peer averages for scatter
  const avgIncome = peers.length > 0
    ? Math.round(peers.reduce((s, p) => s + p.income, 0) / peers.length)
    : null;
  const avgSaved = peers.length > 0
    ? Math.round(peers.reduce((s, p) => s + p.net_worth, 0) / peers.length)
    : null;

  // Scatter data
  const scatterDatasets = [
    {
      label: 'Peers',
      data: peers.map(p => ({ x: p.income, y: p.net_worth })),
      backgroundColor: C.moss + '88',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'You',
      data: [{ x: userData.income, y: userData.net_worth }],
      backgroundColor: C.green,
      pointRadius: 7,
      pointHoverRadius: 9,
    },
    ...(avgIncome !== null && avgSaved !== null ? [{
      label: 'Average',
      data: [{ x: avgIncome, y: avgSaved }],
      backgroundColor: C.noir,
      pointRadius: 8,
      pointHoverRadius: 10,
      pointStyle: 'crossRot' as const,
      borderColor: C.noir,
      borderWidth: 2.5,
    }] : []),
  ];

  const avgLabelPlugin = avgIncome !== null && avgSaved !== null ? {
    id: 'avgLabel',
    afterDraw(chart: any) {
      const { ctx, scales } = chart;
      const px = scales.x.getPixelForValue(avgIncome);
      const py = scales.y.getPixelForValue(avgSaved);
      const line1 = `Avg income: ${fmt(avgIncome)}`;
      const line2 = `Avg saved: ${fmt(avgSaved)}`;
      const pad = 7;
      const fSize = 11;
      ctx.save();
      ctx.font = `500 ${fSize}px DM Sans, sans-serif`;
      const w = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width) + pad * 2;
      const h = fSize * 2 + pad * 2 + 4;
      let bx = px + 12;
      let by = py - h - 6;
      if (bx + w > chart.width - 4) bx = px - w - 12;
      if (by < 4) by = py + 14;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = C.noir;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, h, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = C.noir;
      ctx.fillText(line1, bx + pad, by + pad + fSize - 1);
      ctx.fillText(line2, bx + pad, by + pad + fSize * 2 + 3);
      ctx.restore();
    },
  } : null;



  // Top savers — top 5% by net_worth, min 1 person, require 3+ peers to show
  const topSavers = peers.length >= 3
    ? [...peers].sort((a, b) => b.net_worth - a.net_worth).slice(0, Math.max(1, Math.ceil(peers.length * 0.05)))
    : [];
  const topAlloc: Record<AllocKey, number> | null = topSavers.length > 0
    ? Object.fromEntries(
        (['stocks', 'bonds', 'cash', 'mutual_funds'] as AllocKey[]).map(k => [
          k,
          Math.round(topSavers.reduce((s, p) => s + (p[k] ?? 0), 0) / topSavers.length),
        ])
      ) as Record<AllocKey, number>
    : null;
  const topSavingsRatio = topSavers.length > 0
    ? (topSavers.reduce((s, p) => s + p.net_worth / Math.max(p.income, 1), 0) / topSavers.length)
    : null;
  const userSavingsRatio = userData.net_worth / Math.max(userData.income, 1);
  const allocShifts = topAlloc
    ? (['stocks', 'bonds', 'cash', 'mutual_funds'] as AllocKey[]).filter(
        k => Math.abs((userData[k as keyof UserData] as number) - topAlloc[k]) > 10
      ).length
    : 0;

  // Peer averages — sum each category across all peers then divide by peer count
  const peerAvg: Record<AllocKey, number> = {} as any;
  for (const { key } of PORTFOLIO_CATEGORIES) {
    peerAvg[key] = peers.length
      ? Math.round(peers.reduce((sum, p) => sum + (p[key] ?? 0), 0) / peers.length)
      : 0;
  }

  // Gap explanations for section 2
  function gapLine(key: AllocKey, userPct: number, peerPct: number): string | null {
    const gap = peerPct - userPct;
    if (Math.abs(gap) <= 10 || peers.length === 0) return null;
    const dollars = fmt(Math.round(Math.abs(gap) / 100 * userData.net_worth * 1.3));
    const label = PORTFOLIO_CATEGORIES.find(c => c.key === key)!.label;
    if (key === 'stocks' && gap > 10)
      return `You hold ${gap}% less in stocks than your peers — over 10 years that could mean ${dollars} less in growth.`;
    if (key === 'stocks' && gap < -10)
      return `You hold ${Math.abs(gap)}% more in stocks than peers — strong growth exposure, just make sure it matches your risk tolerance.`;
    if (key === 'cash' && gap < -10)
      return `You hold ${Math.abs(gap)}% more in cash than peers — that's real purchasing power quietly lost to inflation each year.`;
    if (key === 'mutual_funds' && gap > 10)
      return `Peers hold ${gap}% more in mutual funds — a managed fund could add diversification with less hands-on effort.`;
    if (key === 'bonds' && gap > 10)
      return `Peers hold ${gap}% more in bonds — bonds reduce volatility but also cap long-term growth.`;
    if (gap > 10)
      return `Your peers hold ${gap}% more in ${label} — may be worth considering for diversification.`;
    return `You hold ${Math.abs(gap)}% more in ${label} than your peers.`;
  }

  // Priority — grounded in established financial guidelines, peer data used as context only
  const pa = peerAvg;

  // Guideline: (110 − age)% in growth assets (stocks + mutual funds) — classic age-based rule
  const targetEquityPct = Math.max(50, 110 - userData.age);
  const actualEquityPct = userData.stocks + userData.mutual_funds;
  const equityGap = targetEquityPct - actualEquityPct; // positive = below target

  // Guideline: cash in investment portfolio should stay under 15%
  const excessCash = userData.cash - 15;

  // Guideline: bonds under 40 should be under 20%
  const excessBonds = userData.bonds - 20;

  // Savings rate: net_worth vs income, relevant after age 24
  const userSavingsRatioPriority = userData.net_worth / Math.max(userData.income, 1);
  const monthly = fmt(Math.round(userData.income * 0.05 / 12));

  let priority = {
    head: 'Time is your biggest asset right now.',
    body: `At ${userData.age}, starting early matters more than starting perfectly. Even a small consistent investment each month compounds dramatically over decades — the habit itself is the win.`,
    more: `$100/month invested at 22 grows to roughly $350,000 by 65 at 7% annual returns. The same amount starting at 32 becomes ~$170,000 — half as much, from a 10-year delay alone. No allocation tweak comes close to that difference.`,
  };

  if (excessCash >= 10) {
    // Cash above 15% is the clearest drag — guideline says keep it lean
    const idle = Math.round((userData.cash / 100) * userData.net_worth);
    const drag = fmt(Math.round(idle * 0.03));
    const peerContext = pa.cash ? ` Your peers average ${pa.cash}% — even that may be high, but you're ${userData.cash - pa.cash}% above them.` : '';
    priority = {
      head: 'Too much cash is quietly costing you.',
      body: `Financial guidelines suggest keeping investment portfolio cash under 15%. You're at ${userData.cash}% — ${excessCash}% above that. At ~3% annual inflation, that's roughly ${drag}/year in purchasing power you're losing by not investing it.${peerContext}`,
      more: `Cash feels safe, but it's the only asset guaranteed to lose value over time. An emergency fund (3–6 months of expenses) in a high-yield savings account makes sense — anything beyond that in your investment portfolio is drag. A broad index fund like VTI has returned 7–10% annually over the long run.`,
    };
  } else if (equityGap >= 20 && userData.age < 50) {
    // Significantly below the age-appropriate equity target
    const peerContext = pa.stocks ? ` Your peers average ${pa.stocks}% in stocks alone — the guideline accounts for both stocks and mutual funds combined.` : '';
    priority = {
      head: 'Your portfolio is more conservative than your age calls for.',
      body: `A widely used guideline is to keep (110 − your age)% in growth assets — for you at ${userData.age}, that's ~${targetEquityPct}%. Your stocks + mutual funds total ${actualEquityPct}%, which is ${equityGap}% below that target.${peerContext}`,
      more: `This isn't about taking reckless risk — it's about using time as a compounding advantage. At ${userData.age} you have decades to ride out market dips. A portfolio too heavy in cash or bonds at your age sacrifices the long-term growth that equities provide.`,
    };
  } else if (excessBonds >= 15 && userData.age < 40) {
    // Bonds are appropriate for preservation, not growth at a young age
    const peerContext = pa.bonds ? ` Your peers average ${pa.bonds}% in bonds — the guideline suggests under 20% is appropriate for your age.` : '';
    priority = {
      head: 'Your bond allocation is built for retirement, not growth.',
      body: `Financial guidelines suggest keeping bonds under 20% before age 40. You're at ${userData.bonds}% — appropriate for someone protecting wealth near retirement, but limiting at ${userData.age} when you still have decades of compounding ahead.${peerContext}`,
      more: `Bonds reduce volatility, which sounds appealing — but at your age, volatility is manageable over time and the cost of avoiding it is slower growth. Shifting some bonds toward a diversified equity fund keeps risk reasonable while unlocking much better long-run returns.`,
    };
  } else if (userData.net_worth < userData.income * 0.5 && userData.age > 24) {
    // Low savings rate — the foundation, not the allocation
    priority = {
      head: 'Before optimizing how you invest, save more.',
      body: `With ${fmt(userData.net_worth)} saved on a ${fmt(userData.income)} income, your savings rate is the highest-leverage thing to fix. Increasing it by 5% — about ${monthly}/month — competes with any allocation improvement you could make.`,
      more: `Returns matter, but only on capital you've actually saved. The best-allocated $5,000 grows slower than a mediocre-allocated $15,000. Automating a transfer to savings on payday — before you can spend it — is the single most effective financial habit most people can build.`,
    };
  } else if (actualEquityPct >= targetEquityPct - 10 && excessCash < 5 && excessBonds < 5) {
    // User is actually following sound principles
    priority = {
      head: "Your allocation follows sound principles for your age.",
      body: `At ${userData.age}, guidelines suggest ~${targetEquityPct}% in growth assets — you're at ${actualEquityPct}%. Your cash and bond levels are reasonable. The main lever now is consistency: keep saving regularly and don't react to short-term market swings.`,
      more: `Most wealth is built not by finding the perfect allocation but by staying invested through volatility. A diversified portfolio held consistently for decades outperforms a "perfect" portfolio that gets reallocated every time the market dips.`,
    };
  }

  return (
    <div className="dash-grid">

      {/* Q1 — Portfolio vs. Others */}
      <Card style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.green, marginBottom: 10 }}>What Your Portfolio vs. Others Looks Like</p>
        {PORTFOLIO_CATEGORIES.map(({ key, label }) => {
          const youPct = userData[key as keyof UserData] as number;
          const peerPct = peerAvg[key] ?? 0;
          return (
            <div key={key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.noir, fontWeight: 500, minWidth: 96 }}>{label}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: C.moss, minWidth: 28 }}>You</span>
                    <div style={{ flex: 1, height: 8, background: C.bone, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${youPct}%`, background: C.moss, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.noir, fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{youPct}%</span>
                  </div>
                  {peers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: C.cedar, minWidth: 28 }}>Peers</span>
                      <div style={{ flex: 1, height: 8, background: C.bone, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${peerPct}%`, background: C.cedar, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, color: C.noir, fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{peerPct}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {peers.length > 0 && (() => {
          let biggestGap = 0; let biggestKey: AllocKey = 'stocks';
          for (const { key } of PORTFOLIO_CATEGORIES) {
            const gap = Math.abs((userData[key as keyof UserData] as number) - (peerAvg[key] ?? 0));
            if (gap > biggestGap) { biggestGap = gap; biggestKey = key; }
          }
          const label = PORTFOLIO_CATEGORIES.find(c => c.key === biggestKey)!.label;
          const userPct = userData[biggestKey as keyof UserData] as number;
          const peerPct = peerAvg[biggestKey] ?? 0;
          if (biggestGap <= 5) return null;
          return (
            <p style={{ fontSize: 11, color: C.moss, marginTop: 8, lineHeight: 1.5 }}>
              Biggest gap: <strong>{label}</strong> — you're {userPct > peerPct ? `${biggestGap}% above` : `${biggestGap}% below`} the peer average.
            </p>
          );
        })()}
      </Card>

      {/* Q2 — Where You Stand */}
      <Card style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.green, marginBottom: 8 }}>Where You Stand</p>
        <div style={{ flex: 1, minHeight: 180 }}>
          <Scatter
            plugins={avgLabelPlugin ? [avgLabelPlugin] : []}
            data={{ datasets: scatterDatasets }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: {
                    usePointStyle: true,
                    color: C.noir,
                    font: { size: 11 },
                    padding: 12,
                    filter: item => item.text !== 'Peers',
                  },
                },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      if (ctx.datasetIndex === 1) return `You — ${fmt(userData.net_worth)} saved`;
                      if (ctx.datasetIndex === 2) return `Avg — ${fmt(avgIncome!)} income / ${fmt(avgSaved!)} saved`;
                      return `${fmt(ctx.parsed.y ?? 0)} saved`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: 'rgba(149, 149, 129, 0.2)', lineWidth: 1 },
                  border: { color: C.cedar },
                  ticks: { color: C.cedar, font: { size: 10 }, callback: v => fmt(v as number), maxTicksLimit: 4 },
                  title: { display: true, text: 'Annual Income', color: C.noir, font: { size: 11, weight: 'bold' as const } },
                },
                y: {
                  grid: { color: 'rgba(149, 149, 129, 0.2)', lineWidth: 1 },
                  border: { color: C.cedar },
                  ticks: { color: C.cedar, font: { size: 10 }, callback: v => fmt(v as number), maxTicksLimit: 4 },
                  title: { display: true, text: 'Money Saved', color: C.noir, font: { size: 11, weight: 'bold' as const } },
                },
              },
            }}
          />
        </div>
        {peers.length > 0 && avgIncome !== null && avgSaved !== null && (() => {
          const incomeDiff = userData.income - avgIncome;
          const savedDiff = userData.net_worth - avgSaved;
          return (
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.noir, margin: '0 0 2px' }}>Average income: {fmt(avgIncome)}</p>
                <p style={{ fontSize: 11, color: incomeDiff >= 0 ? C.moss : C.errorRed, margin: 0 }}>
                  You earn {fmt(Math.abs(incomeDiff))} {incomeDiff >= 0 ? 'above' : 'below'} average
                </p>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.noir, margin: '0 0 2px' }}>Average money saved: {fmt(avgSaved)}</p>
                <p style={{ fontSize: 11, color: savedDiff >= 0 ? C.moss : C.errorRed, margin: 0 }}>
                  You have {fmt(Math.abs(savedDiff))} {savedDiff >= 0 ? 'more' : 'less'} saved than average
                </p>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Q3 — Top Savers */}
      <Card style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.green, marginBottom: 10 }}>What Top Savers Your Age Do Differently</p>
        {topAlloc === null ? (
          <p style={{ fontSize: 12, color: C.cedar, lineHeight: 1.6 }}>
            Not enough peers yet to identify top savers. This will populate once more people your age join.
          </p>
        ) : (
          <>
            {PORTFOLIO_CATEGORIES.map(({ key, label }) => {
              const them = topAlloc[key];
              const you = userData[key as keyof UserData] as number;
              const diff = them - you;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.noir, fontWeight: 500, minWidth: 96 }}>{label}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: C.green, minWidth: 28 }}>Peers</span>
                      <div style={{ flex: 1, height: 8, background: C.bone, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${them}%`, background: C.green, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.green, minWidth: 30, textAlign: 'right' }}>{them}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: C.cedar, minWidth: 28 }}>You</span>
                      <div style={{ flex: 1, height: 8, background: C.bone, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${you}%`, background: C.cedar, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.cedar, minWidth: 30, textAlign: 'right' }}>{you}%</span>
                    </div>
                  </div>
                  {Math.abs(diff) > 5 && (
                    <span style={{ fontSize: 10, color: diff > 0 ? C.moss : C.errorRed, minWidth: 44, textAlign: 'right', fontWeight: 600 }}>
                      {diff > 0 ? `+${diff}%` : `${diff}%`}
                    </span>
                  )}
                </div>
              );
            })}
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(() => {
                // Sort all gaps by magnitude — biggest difference gets addressed first
                const gapInsights: { magnitude: number; text: string }[] = [];

                for (const { key, label } of PORTFOLIO_CATEGORIES) {
                  const them = topAlloc[key];
                  const you = userData[key as keyof UserData] as number;
                  const diff = them - you; // positive = top savers have more
                  if (Math.abs(diff) < 6) continue;
                  let text = '';
                  if (key === 'stocks' && diff > 0)
                    text = `Top savers put ${them}% in stocks — ${diff}% more than your ${you}%. At ${userData.age}, stocks are the primary engine of long-term growth.`;
                  else if (key === 'stocks' && diff < 0)
                    text = `You hold more stocks (${you}%) than top savers (${them}%). That's strong growth exposure — make sure your risk tolerance matches.`;
                  else if (key === 'cash' && diff < 0)
                    text = `You keep ${you}% in cash vs their ${them}%. That ${Math.abs(diff)}% extra sitting idle loses value to inflation every year instead of growing.`;
                  else if (key === 'cash' && diff > 0)
                    text = `Top savers hold more cash (${them}%) than you (${you}%) — they may be building an emergency fund before investing more.`;
                  else if (key === 'mutual_funds' && diff > 0)
                    text = `Top savers put ${them}% in mutual funds vs your ${you}%. Diversified funds spread risk across hundreds of assets automatically.`;
                  else if (key === 'bonds' && diff < 0)
                    text = `You hold ${you}% in bonds vs top savers' ${them}%. At your age, that conservatism may be limiting your growth potential.`;
                  else
                    text = diff > 0
                      ? `Top savers hold ${diff}% more in ${label} (${them}% vs your ${you}%) — worth considering for your mix.`
                      : `You hold ${Math.abs(diff)}% more in ${label} than top savers (${you}% vs ${them}%).`;
                  gapInsights.push({ magnitude: Math.abs(diff), text });
                }

                // Add savings ratio insight
                if (topSavingsRatio !== null) {
                  const r = topSavingsRatio.toFixed(1), u = userSavingsRatio.toFixed(1);
                  const ratioDiff = topSavingsRatio - userSavingsRatio;
                  gapInsights.push({
                    magnitude: Math.abs(ratioDiff) * 20, // scale so it competes with allocation gaps
                    text: ratioDiff > 0.15
                      ? `Top savers have saved ${r}× their annual income — you're at ${u}×. The gap is more about saving consistently than how you invest.`
                      : `They've saved ${r}× their income, you're at ${u}×. Your savings pace is close to theirs — allocation is the main lever now.`,
                  });
                }

                gapInsights.sort((a, b) => b.magnitude - a.magnitude);

                if (gapInsights.length === 0)
                  return (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: C.moss, fontSize: 13, lineHeight: 1 }}>→</span>
                      <p style={{ fontSize: 11, color: C.noir, lineHeight: 1.6, margin: 0 }}>Your allocation already closely mirrors what top savers your age are doing.</p>
                    </div>
                  );

                return gapInsights.slice(0, 2).map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: C.moss, fontSize: 13, lineHeight: 1 }}>→</span>
                    <p style={{ fontSize: 11, color: C.noir, lineHeight: 1.6, margin: 0 }}>{g.text}</p>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </Card>

      {/* Q4 — What You Can Do */}
      <Card style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.green, marginBottom: 8 }}>What You Can Do</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.noir, marginBottom: 8 }}>{priority.head}</p>
        <p style={{ fontSize: 13, color: C.noir, lineHeight: 1.7 }}>{priority.body}</p>
        {priorityExpanded && (
          <p style={{ fontSize: 12, color: C.noir, lineHeight: 1.7, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            {priority.more}
          </p>
        )}
        <button onClick={() => setPriorityExpanded(e => !e)} style={{
          marginTop: 12, background: 'none', border: 'none', padding: 0,
          fontSize: 12, color: C.moss, cursor: 'pointer', textDecoration: 'underline',
          textUnderlineOffset: 3, alignSelf: 'flex-start',
        }}>
          {priorityExpanded ? 'Show less ↑' : 'Why this matters →'}
        </button>
      </Card>

    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({
  userData, userId, onUpdate,
}: {
  userData: UserData;
  userId: string;
  onUpdate: (d: UserData) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);

  const fields = [
    { key: 'age', label: 'Age', fmt: (v: number) => `${v} years old` },
    { key: 'income', label: 'Annual income', fmt: fmt },
    { key: 'net_worth', label: 'Money saved', fmt: fmt },
  ];

  async function save(key: string) {
    setSaving(true);
    const num = +editVal;
    const updated = { ...userData, [key]: num };
    await supabase.from('users').update({ [key]: num }).eq('user_id', userId);
    onUpdate(updated);
    setEditing(null);
    setSaving(false);
  }

  const [allocEditing, setAllocEditing] = useState(false);

  function amountsFromCurrent(): Record<AllocKey, number> {
    return {
      stocks: Math.round(userData.net_worth * userData.stocks / 100),
      bonds: Math.round(userData.net_worth * userData.bonds / 100),
      cash: Math.round(userData.net_worth * userData.cash / 100),
      mutual_funds: Math.round(userData.net_worth * userData.mutual_funds / 100),
    };
  }

  const [draftAmounts, setDraftAmounts] = useState<Record<AllocKey, number>>(amountsFromCurrent());
  const amountsTotal = Object.values(draftAmounts).reduce((a, b) => a + b, 0);
  const sliderMax = Math.max(userData.net_worth, 1000);

  async function saveAlloc() {
    if (amountsTotal <= 0) return;
    setSaving(true);
    const pcts = amountsToPercentages(draftAmounts);
    await supabase.from('users').update(pcts).eq('user_id', userId);
    onUpdate({ ...userData, ...pcts });
    setAllocEditing(false);
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', fontSize: 15, border: `1px solid ${C.border}`,
    borderRadius: 8, background: C.bone, color: C.noir, outline: 'none', width: 160,
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: C.green, marginBottom: 24 }}>Your profile</h2>

      <Card style={{ marginBottom: 16 }}>
        {fields.map(({ key, label, fmt: fmtFn }) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.moss, marginBottom: 2 }}>{label}</div>
              {editing === key ? (
                <input
                  type="number"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  autoFocus
                  style={inputStyle}
                />
              ) : (
                <div style={{ fontSize: 16, color: C.noir, fontWeight: 500 }}>
                  {fmtFn(userData[key as keyof UserData] as number)}
                </div>
              )}
            </div>
            {editing === key ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => save(key)} disabled={saving} style={{
                  padding: '6px 14px', background: C.green, color: C.bone,
                  border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                }}>Save</button>
                <button onClick={() => setEditing(null)} style={{
                  padding: '6px 14px', background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.noir,
                }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => { setEditing(key); setEditVal(String(userData[key as keyof UserData])); }}
                style={{
                  padding: '6px 14px', background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.noir,
                }}>Edit</button>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: C.noir }}>Portfolio allocation</span>
          {!allocEditing ? (
            <button onClick={() => { setDraftAmounts(amountsFromCurrent()); setAllocEditing(true); }} style={{
              padding: '6px 14px', background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.noir,
            }}>Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveAlloc} disabled={amountsTotal <= 0 || saving} style={{
                padding: '6px 14px', background: amountsTotal > 0 ? C.green : '#aaa',
                color: C.bone, border: 'none', borderRadius: 8, fontSize: 13, cursor: amountsTotal > 0 ? 'pointer' : 'not-allowed',
              }}>Save</button>
              <button onClick={() => { setAllocEditing(false); }}
                style={{
                  padding: '6px 14px', background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.noir,
                }}>Cancel</button>
            </div>
          )}
        </div>

        {allocEditing && (
          <p style={{ fontSize: 13, color: C.moss, marginBottom: 16, lineHeight: 1.5 }}>
            Enter the dollar amount you have in each category. We'll calculate the percentages for you.
          </p>
        )}

        {PORTFOLIO_CATEGORIES.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: allocEditing ? 20 : 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: C.noir }}>{label}</span>
              {!allocEditing && (
                <span style={{ fontSize: 14, fontWeight: 500, color: C.green }}>
                  {userData[key as keyof UserData]}%
                </span>
              )}
            </div>
            {allocEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input type="range" min={0} max={sliderMax}
                  value={draftAmounts[key]}
                  onChange={e => setDraftAmounts(a => ({ ...a, [key]: +e.target.value }))}
                  style={{ flex: 1 }}
                />
                <div style={{ position: 'relative', width: 110 }}>
                  <span style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14, color: C.cedar,
                  }}>$</span>
                  <input
                    type="number" min={0}
                    value={draftAmounts[key] === 0 ? '' : draftAmounts[key]}
                    placeholder="0"
                    onChange={e => setDraftAmounts(a => ({ ...a, [key]: e.target.value === '' ? 0 : +e.target.value }))}
                    style={{
                      width: '100%', padding: '7px 8px 7px 20px',
                      fontSize: 14, border: `1px solid ${C.border}`, borderRadius: 8,
                      background: C.bone, color: C.noir, outline: 'none',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ height: 6, background: C.bone, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${userData[key as keyof UserData]}%`, background: C.moss, borderRadius: 3 }} />
              </div>
            )}
          </div>
        ))}

        {allocEditing && (
          <p style={{
            fontSize: 13, fontWeight: 500, marginTop: 8,
            color: amountsTotal > 0 ? C.moss : C.errorRed,
          }}>
            Total entered: {fmt(amountsTotal)} {amountsTotal > 0 ? '✓' : '— enter at least one amount to continue'}
          </p>
        )}
      </Card>
    </div>
  );
}

// ── Settings tab ───────────────────────────────────────────────────────────────
function SettingsTab({
  userId, onTabChange, onSignOut,
}: {
  userId: string;
  onTabChange: (t: Tab) => void;
  onSignOut: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLogOut() {
    await supabase.auth.signOut();
    onSignOut();
  }

  async function handleDelete() {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/delete-account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('Delete account failed:', res.status, body);
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    onSignOut();
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: C.green, marginBottom: 24 }}>Settings</h2>

      <Card style={{ marginBottom: 16 }}>
        <button onClick={() => onTabChange('profile')} style={{
          display: 'block', width: '100%', textAlign: 'left', padding: '14px 0',
          background: 'none', border: 'none', fontSize: 16, color: C.noir,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Edit profile →
        </button>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <button onClick={handleLogOut} style={{
          display: 'block', width: '100%', textAlign: 'left', padding: '14px 0',
          background: 'none', border: 'none', fontSize: 16, color: C.noir,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Log out →
        </button>
      </Card>

      <Card>
        <button onClick={() => setShowModal(true)} style={{
          display: 'block', width: '100%', textAlign: 'left', padding: '14px 0',
          background: 'none', border: 'none', fontSize: 16, color: C.errorRed,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
        }}>
          Delete account
        </button>
      </Card>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(53, 64, 36, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem',
        }}>
          <div style={{
            background: C.bone, borderRadius: 16, padding: '28px 28px',
            maxWidth: 360, width: '100%', border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: C.noir, marginBottom: 10 }}>
              Delete your account?
            </h3>
            <p style={{ fontSize: 15, color: C.noir, lineHeight: 1.6, marginBottom: 24 }}>
              This will permanently delete all your data. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px', background: 'transparent',
                border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14,
                cursor: 'pointer', color: C.noir,
              }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '11px', background: C.errorRed, color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
              }}>
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feedback Tab ──────────────────────────────────────────────────────────────
function FeedbackTab({ userId }: { userId: string }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit() {
    if (!text.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('feedback').insert({ user_id: userId, message: text.trim() });
    if (error) { setStatus('error'); return; }
    setText('');
    setStatus('done');
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 560 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.green, marginBottom: 10 }}>Share your feedback</h2>
      <p style={{ fontSize: 15, color: C.noir, lineHeight: 1.7, marginBottom: 28 }}>
        PeerMoney is still in its early stages, and your input shapes what it becomes. We want to know: what's confusing, what's missing, what would actually make this useful for you? Any feedback is greatly appreciated.
      </p>

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); if (status === 'done' || status === 'error') setStatus('idle'); }}
        placeholder="What's working, what's not, or what you'd love to see next..."
        rows={6}
        style={{
          width: '100%',
          padding: '14px 16px',
          fontSize: 15,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          background: C.tan,
          color: C.noir,
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.6,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={submit}
        disabled={!text.trim() || status === 'sending'}
        style={{
          marginTop: 14,
          padding: '12px 28px',
          background: text.trim() && status !== 'sending' ? C.green : '#B0A898',
          color: C.bone,
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 500,
          cursor: text.trim() && status !== 'sending' ? 'pointer' : 'not-allowed',
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Submit feedback'}
      </button>

      {status === 'done' && (
        <p style={{ marginTop: 14, fontSize: 14, color: C.moss }}>Thanks — we got it. Feedback like yours is what makes this better.</p>
      )}
      {status === 'error' && (
        <p style={{ marginTop: 14, fontSize: 14, color: C.errorRed }}>Something went wrong. Please try again.</p>
      )}
    </div>
  );
}

// ── Learn Tab ─────────────────────────────────────────────────────────────────
const LEARN_SECTIONS = [
  {
    title: 'Investing basics',
    resources: [
      { source: 'Investopedia', title: 'What Is an Index Fund?', url: 'https://www.investopedia.com/terms/i/indexfund.asp' },
      { source: 'Investopedia', title: 'What Is Compound Interest?', url: 'https://www.investopedia.com/terms/c/compoundinterest.asp' },
      { source: 'Investopedia', title: 'Stocks vs Bonds — Know the Difference', url: 'https://www.investopedia.com/articles/investing/100814/stocks-vs-bonds-know-difference.asp' },
    ],
  },
  {
    title: 'For beginners specifically',
    resources: [
      { source: 'NerdWallet', title: 'How to Start Investing', url: 'https://www.nerdwallet.com/article/investing/how-to-start-investing' },
      { source: 'Investor.gov (U.S. SEC)', title: 'Investor Education', url: 'https://www.investor.gov' },
    ],
  },
  {
    title: 'Retirement / long-term',
    resources: [
      { source: 'Investopedia', title: 'What Is a Roth IRA?', url: 'https://www.investopedia.com/terms/r/rothira.asp' },
      { source: 'Investopedia', title: '401(k) Basics', url: 'https://www.investopedia.com/terms/1/401kplan.asp' },
    ],
  },
  {
    title: 'Risk and diversification',
    resources: [
      { source: 'Investopedia', title: 'What Is Diversification?', url: 'https://www.investopedia.com/terms/d/diversification.asp' },
    ],
  },
];

function LearnTab() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 640 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.green, marginBottom: 14 }}>Learn More About Investing</h2>
      <p style={{ fontSize: 13, color: C.cedar, lineHeight: 1.6, marginBottom: 32, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        These are educational resources from trusted third parties. PeerMoney does not endorse specific financial products.
      </p>

      {LEARN_SECTIONS.map(section => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.noir, marginBottom: 12 }}>{section.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {section.resources.map(r => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '12px 16px', background: C.tan,
                  border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: 'none',
                }}>
                <span style={{ fontSize: 12, color: C.moss, fontWeight: 600 }}>{r.source}</span>
                <p style={{ fontSize: 14, color: C.noir, marginTop: 2 }}>{r.title}</p>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard' as Tab, label: 'Dashboard', Icon: IconGrid },
  { id: 'profile' as Tab, label: 'Profile', Icon: IconPerson },
  { id: 'learn' as Tab, label: 'Learn', Icon: IconBook },
  { id: 'settings' as Tab, label: 'Settings', Icon: IconGear },
  { id: 'feedback' as Tab, label: 'Feedback', Icon: IconChat },
];

// ── Root Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard({
  userData: initialData,
  userId,
  onSignOut,
}: {
  userData: UserData;
  userId: string;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [userData, setUserData] = useState<UserData>(initialData);
  const [peers, setPeers] = useState<any[]>([]);

  useEffect(() => {
    const fetchPeers = () =>
      supabase
        .rpc('get_peers', { p_age: userData.age })
        .then(({ data }) => setPeers(data || []));

    fetchPeers();

    const channel = supabase
      .channel('peers-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `age=eq.${userData.age}`,
      }, fetchPeers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userData.age, userId]);

  return (
    <>
      <div className="app-shell">
        {/* Desktop sidebar */}
        <nav className="sidebar">
          <div style={{ padding: '0 24px 28px', fontSize: 22, fontWeight: 700, color: C.green }}>
            PeerMoney
          </div>
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`nav-item${tab === id ? ' active' : ''}`}>
              <Icon size={18} color={tab === id ? C.green : C.moss} />
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="main-area">
          {tab === 'dashboard' && <DashboardTab userData={userData} peers={peers} />}
          {tab === 'profile' && (
            <ProfileTab userData={userData} userId={userId} onUpdate={setUserData} />
          )}
          {tab === 'settings' && (
            <SettingsTab userId={userId} onTabChange={setTab} onSignOut={onSignOut} />
          )}
          {tab === 'feedback' && <FeedbackTab userId={userId} />}
          {tab === 'learn' && <LearnTab />}
        </main>

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`nav-item${tab === id ? ' active' : ''}`}>
              <Icon size={20} color={tab === id ? C.green : C.moss} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Disclaimer footer — outside app-shell so fixed positioning works correctly */}
      <div className="disclaimer-footer">
        <p style={{ fontSize: 11, color: C.cedar, margin: 0 }}>
          PeerMoney provides peer comparisons for educational purposes only. Not financial advice.
        </p>
      </div>
    </>
  );
}
