import { useState, useEffect } from 'react';
import api from '../api';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: '', description: '', spent_at: '' });

  const fetchExpenses = async () => {
    const res = await api.get('/expenses');
    setExpenses(res.data);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/expenses', form);
    setForm({ amount: '', description: '', spent_at: '' });
    fetchExpenses();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="Amount" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="date" value={form.spent_at}
          onChange={(e) => setForm({ ...form, spent_at: e.target.value })} />
        <button type="submit">Add Expense</button>
      </form>

      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>{exp.description} — ₹{exp.amount} ({exp.spent_at?.slice(0,10)})</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;