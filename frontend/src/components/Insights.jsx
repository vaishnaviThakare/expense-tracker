import { useState, useEffect } from 'react';
import api from '../api';
import CategoryChart from './CategoryChart';
import { getCategoryColor, getCategoryIcon } from '../utils/categoryColors';

function Insights() {
  const [insights, setInsights] = useState(null);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    api.get('/expenses/insights').then(res => setInsights(res.data));
    api.get('/expenses').then(res => setExpenses(res.data));
  }, []);

  if (!insights) return null;

  const { thisWeek, lastWeek } = insights;
  const thisWeekMap = Object.fromEntries(thisWeek.map(c => [c.name, parseFloat(c.total)]));
  const lastWeekMap = Object.fromEntries(lastWeek.map(c => [c.name, parseFloat(c.total)]));
  const allCategories = [...new Set([...Object.keys(thisWeekMap), ...Object.keys(lastWeekMap)])];

  const messages = allCategories.map((category) => {
    const current = thisWeekMap[category] || 0;
    const previous = lastWeekMap[category] || 0;
    if (previous === 0) {
      if (current === 0) return null;
      return { category, text: `You spent ₹${current.toFixed(2)} on ${category} this week`, sub: 'No spending last week to compare.' };
    }
    const percentChange = ((current - previous) / previous) * 100;
    const direction = percentChange >= 0 ? 'more' : 'less';
    return { category, text: `${Math.abs(percentChange).toFixed(0)}% ${direction} on ${category}`, sub: `vs ₹${previous.toFixed(2)} last week` };
  }).filter(Boolean);

  const chartData = thisWeek.map(c => ({ name: c.name, total: parseFloat(c.total) }));
  const totalThisWeek = chartData.reduce((s, c) => s + c.total, 0);
  const totalLastWeek = lastWeek.reduce((s, c) => s + parseFloat(c.total), 0);
  const totalDelta = totalLastWeek > 0 ? ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100 : null;

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const thisWeekExpenses = expenses.filter(e => new Date(e.spent_at) >= weekAgo);
  const transactionCount = thisWeekExpenses.length;
  const avgDaily = totalThisWeek / 7;
  const topCategory = chartData.slice().sort((a, b) => b.total - a.total)[0];
  const recent = expenses.slice(0, 5);

  return (
    <>
      <p className="greeting">Hello 👋</p>
      <h2 className="page-heading">Overview</h2>
      <p className="page-subheading">Here's how your spending looks this week.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="icon-avatar" style={{ background: 'var(--brand-soft)' }}>💰</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <p className="stat-value">₹{totalThisWeek.toFixed(2)}</p>
          {totalDelta !== null && (
            <span className={`stat-delta ${totalDelta >= 0 ? 'up' : 'down'}`}>
              {totalDelta >= 0 ? '↑' : '↓'} {Math.abs(totalDelta).toFixed(0)}% vs last week
            </span>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="icon-avatar" style={{ background: '#3A6EA522' }}>📊</span>
            <span className="stat-label">Avg. Daily Spend</span>
          </div>
          <p className="stat-value">₹{avgDaily.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="icon-avatar" style={{ background: '#C99A3B22' }}>🧾</span>
            <span className="stat-label">Transactions</span>
          </div>
          <p className="stat-value">{transactionCount}</p>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="icon-avatar" style={{ background: topCategory ? getCategoryColor(topCategory.name) + '22' : 'var(--surface-2)' }}>
              {topCategory ? getCategoryIcon(topCategory.name) : '—'}
            </span>
            <span className="stat-label">Top Category</span>
          </div>
          <p className="stat-value" style={{ fontSize: 16 }}>{topCategory ? topCategory.name : '—'}</p>
        </div>
      </div>

      <div className="insights-grid">
        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Spending Insights</h2>
            <div className="double-rule" />
          </div>
          {messages.length === 0 ? (
            <p className="insight-empty">Not enough data yet to generate insights.</p>
          ) : (
            messages.map((m, i) => (
              <div className="insight-row" key={i}>
                <span className="icon-avatar" style={{ background: getCategoryColor(m.category) + '22' }}>
                  {getCategoryIcon(m.category)}
                </span>
                <div>
                  <div className="insight-row-text">{m.text}</div>
                  <div className="insight-row-sub">{m.sub}</div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Spending by Category</h2>
            <div className="double-rule" />
          </div>
          {chartData.length > 0 ? (
            <>
              <div className="chart-wrap">
                <CategoryChart data={chartData} />
              </div>
              <div className="legend-list">
                {chartData.map((c, i) => (
                  <div className="legend-item" key={i}>
                    <span className="legend-left">
                      <span className="legend-swatch" style={{ background: getCategoryColor(c.name) }} />
                      {c.name}
                    </span>
                    <span>
                      <span className="legend-pct">{((c.total / totalThisWeek) * 100).toFixed(0)}% </span>
                      ₹{c.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="insight-empty">No spending yet this week.</p>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <div className="double-rule" />
        </div>
        <ul className="ledger-list">
          {recent.map((exp) => {
            const catName = exp.category_name || 'Uncategorized';
            const color = getCategoryColor(catName);
            return (
              <li className="ledger-row" key={exp.id}>
                <div className="row-left">
                  <span className="icon-avatar" style={{ background: color + '22' }}>{getCategoryIcon(catName)}</span>
                  <div className="row-text">
                    <span className="row-desc">{exp.description || 'Untitled'}</span>
                    <span className="row-meta">{catName}</span>
                  </div>
                </div>
                <span className="amount" style={{ color }}>₹{Number(exp.amount).toFixed(2)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

export default Insights;