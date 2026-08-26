import { useState, useEffect } from 'react';
import api from '../api';
import Insights from '../components/Insights';
import { getCategoryColor, getCategoryIcon } from '../utils/categoryColors';


function getUserEmailFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ amount: '', description: '', spent_at: '', category_id: '' });
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchExpenses = async () => {
    const res = await api.get('/expenses');
    setExpenses(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/expenses', { ...form, category_id: form.category_id || null });
    setForm({ amount: '', description: '', spent_at: '', category_id: '' });
    fetchExpenses();
    setActiveTab('entries');
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const userEmail = getUserEmailFromToken();
const userInitial = userEmail ? userEmail[0].toUpperCase() : '?';

  const filteredExpenses = expenses.filter(exp =>
    (exp.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (exp.category_name || '').toLowerCase().includes(search.toLowerCase())
  );



  return (
    <div className="app-shell">
      <header className="topbar">
  <h1 className="wordmark">Spendly</h1>
  <div className="topbar-right">
    <div className="user-menu">
      <div className="user-chip" onClick={() => setMenuOpen(!menuOpen)}>
        <span className="user-avatar">{userInitial}</span>
        <span className="user-name">{userEmail ? userEmail.split('@')[0] : 'Account'}</span>
        <span className="chevron">▾</span>
      </div>
      {menuOpen && (
        <div className="user-dropdown">
          <div className="dropdown-email">{userEmail || 'Not signed in'}</div>
          <button className="dropdown-item" onClick={logout}>Log out</button>
        </div>
      )}
    </div>
  </div>
</header>

      <div className="shell-body">
        <nav className="sidebar">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="nav-dot" /> Overview
          </button>
          <button className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            <span className="nav-dot" /> Add Entry
          </button>
          <button className={`nav-item ${activeTab === 'entries' ? 'active' : ''}`} onClick={() => setActiveTab('entries')}>
            <span className="nav-dot" /> Entries
          </button>
         
        </nav>

        <main className="content-area">
          {activeTab === 'overview' && <Insights />}

          {activeTab === 'add' && (
            <>
              <h2 className="page-heading">New entry</h2>
              <p className="page-subheading">Log a purchase and we'll sort it for you.</p>
              <section className="card">
                <form className="entry-form" onSubmit={handleSubmit}>
                  <div className="field-group">
                    <span className="field-label">Amount</span>
                    <input className="field" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <span className="field-label">Date</span>
                    <input className="field" type="date" value={form.spent_at}
                      onChange={(e) => setForm({ ...form, spent_at: e.target.value })} />
                  </div>
                  <div className="field-group full">
                    <span className="field-label">Description</span>
                    <input className="field" value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="field-group full">
                    <span className="field-label">Category</span>
                    <select className="field" value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">Auto-detect</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn-primary" type="submit">Add entry</button>
                </form>
              </section>
            </>
          )}

          {activeTab === 'entries' && (
            <>
              <h2 className="page-heading">Entries <span className="entry-count">({filteredExpenses.length})</span></h2>
              <p className="page-subheading">Everything you've logged, most recent first.</p>

              <div className="search-row">
                <input className="search-input" placeholder="Search entries..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <section className="card">
                <div className="table-header">
                  <span>Description</span>
                  <span>Category</span>
                  <span>Date</span>
                  <span>Amount</span>
                  <span></span>
                </div>
               <ul className="ledger-list">
  {filteredExpenses.length === 0 && <p className="insight-empty">No entries found.</p>}
  {filteredExpenses.map((exp) => {
    const catName = exp.category_name || 'Uncategorized';
    const color = getCategoryColor(catName);
    return (
      <li className="entry-row-grid" key={exp.id}>
        <div className="row-left">
          <span className="icon-avatar" style={{ background: color + '22' }}>
            {getCategoryIcon(catName)}
          </span>
          <span className="row-desc">{exp.description || 'Untitled'}</span>
        </div>
        <span className="category-badge" style={{ background: color + '1A', color, justifySelf: 'start' }}>{catName}</span>
        <span className="row-date">{formatDate(exp.spent_at)}</span>
        <span className="amount" style={{ color }}>₹{Number(exp.amount).toFixed(2)}</span>
        <button className="delete-btn" onClick={() => handleDelete(exp.id)}>×</button>
      </li>
    );
  })}
</ul>
              </section>
            </>
          )}

          
        </main>
      </div>
    </div>
  );
}

export default Dashboard;