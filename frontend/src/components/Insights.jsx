import { useState, useEffect } from 'react';
import api from '../api';

function Insights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const res = await api.get('/expenses/insights');
      setInsights(res.data);
    };
    fetchInsights();
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
      return `You spent ₹${current.toFixed(2)} on ${category} this week (no spending last week to compare).`;
    }

    const percentChange = ((current - previous) / previous) * 100;
    const direction = percentChange >= 0 ? 'more' : 'less';

    return `You spent ${Math.abs(percentChange).toFixed(0)}% ${direction} on ${category} this week compared to last week.`;
  }).filter(Boolean);

  return (
    <div>
      <h3>Insights</h3>
      {messages.length === 0 ? (
        <p>Not enough data yet to generate insights.</p>
      ) : (
        <ul>
          {messages.map((msg, i) => <li key={i}>{msg}</li>)}
        </ul>
      )}
    </div>
  );
}

export default Insights;