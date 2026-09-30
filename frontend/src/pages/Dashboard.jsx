import { useState, useEffect } from 'react';
import api from '../api';
import Insights from '../components/Insights';
import { getCategoryColor, getCategoryIcon } from '../utils/categoryColors';
import { useRef } from 'react';
import logo from '../assets/spendly-logo.svg';


function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toISO = (d) => d.toISOString().slice(0, 10);
  return { start: toISO(start), end: toISO(end) };
}

function formatRangeLabel(from, to) {
  const fromDate = new Date(from + 'T00:00:00');
  const toDate = new Date(to + 'T00:00:00');
  const fromStr = fromDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const toStr = toDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fromStr} – ${toStr}`;
}

function Dashboard() {
  const user = getUserFromToken();
  const userEmail = user?.email || null;
  const userName = user?.name || null;
  const userInitial = userName ? userName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : '?');

  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ amount: '', description: '', spent_at: '', category_id: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const menuRef = useRef(null);
  const [openActionId, setOpenActionId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const actionRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const defaultRange = getCurrentMonthRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.start);
  const [dateTo, setDateTo] = useState(defaultRange.end);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const dateRangeRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');
  
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

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(e.target))
        setOpenActionId(null);
    if (dateRangeRef.current && !dateRangeRef.current.contains(e.target)) setDateRangeOpen(false);
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, dateFrom, dateTo]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/expenses/${editingExpense.id}`, {
      amount: editingExpense.amount,
      description: editingExpense.description,
      spent_at: editingExpense.spent_at,
      category_id: editingExpense.category_id || null,
    });
    setEditingExpense(null);
    fetchExpenses();
  };

  const handleNameUpdate = async (e) => {
  e.preventDefault();
  const res = await api.put('/auth/profile', { name: nameInput });
  // Since name lives in the JWT, not just the DB, update won't reflect until next login.
  // Simplest: just show a success note and prompt re-login for it to fully refresh everywhere.
  alert('Name updated. Please log out and log back in to see it everywhere.');
  setEditingName(false);
};

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      (exp.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (exp.category_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filterCategory || (exp.category_name || 'Uncategorized') === filterCategory;
    const matchesDate = (!dateFrom || exp.spent_at >= dateFrom) && (!dateTo || exp.spent_at <= dateTo);
    return matchesSearch && matchesFilter && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const availableCategories = [...new Set(expenses.map(e => e.category_name || 'Uncategorized'))];


  return (
    <div className="app-shell">
      <header className="topbar">
        {/* <h1 className="wordmark">Spendly</h1> */}
        <img src={logo} alt="Spendly" className="brand-logo-dashboard" />
        <div className="topbar-right">
          <div className="user-menu" ref={menuRef}>
            <div className="user-chip" onClick={() => setMenuOpen((prev) => !prev)}>
              <span className="user-avatar">{userInitial}</span>
             <span className="user-name">{userName || (userEmail ? userEmail.split('@')[0] : 'Account')}</span>
              <span className="chevron">▾</span>
            </div>
            {menuOpen && (
             <div className="user-dropdown">
  <div className="dropdown-email">{userEmail || 'Not signed in'}</div>
  {!editingName ? (
    <button className="action-item" onClick={() => setEditingName(true)}>✏️ Edit name</button>
  ) : (
    <form onSubmit={handleNameUpdate} style={{ padding: '8px 10px', display: 'flex', gap: 6 }}>
      <input className="field" value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={{ fontSize: 13 }} />
      <button type="submit" className="btn-primary" style={{ margin: 0, padding: '6px 10px', fontSize: 12 }}>Save</button>
    </form>
  )}
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
              <h2 className="page-heading">Add a New Expense</h2>
              <p className="page-subheading">Track your expenses and manage your budget.</p>
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
              <div className="entries-toolbar">
  <div className="search-box">
    <span className="search-icon">🔍</span>
    <input className="search-input" placeholder="Search entries..."
      value={search} onChange={(e) => setSearch(e.target.value)} />
  </div>

  <div className="date-range-wrap" ref={dateRangeRef}>
    <button className="date-pill-btn" onClick={() => setDateRangeOpen(!dateRangeOpen)}>
      📅 {formatRangeLabel(dateFrom, dateTo)}
    </button>
    {dateRangeOpen && (
      <div className="date-range-dropdown">
        <div className="date-range-dropdown-row">
          <div className="field-group">
            <span className="field-label">From</span>
            <input className="field" type="date" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="field-group">
            <span className="field-label">To</span>
            <input className="field" type="date" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <button
          className="btn-secondary"
          onClick={() => { const r = getCurrentMonthRange(); setDateFrom(r.start); setDateTo(r.end); }}
        >
          Reset to this month
        </button>
      </div>
    )}
  </div>

  <div className="filter-wrap" ref={filterRef}>
    <button
      className={`filter-btn ${filterCategory ? 'active-filter' : ''}`}
      onClick={() => setFilterOpen(!filterOpen)}
    >
      🧭 {filterCategory || 'Filter'}
    </button>
    {filterOpen && (
      <div className="filter-dropdown">
        <button className={`filter-option ${!filterCategory ? 'selected' : ''}`}
          onClick={() => { setFilterCategory(''); setFilterOpen(false); }}>
          All categories
        </button>
        {availableCategories.map((cat) => (
          <button key={cat} className={`filter-option ${filterCategory === cat ? 'selected' : ''}`}
            onClick={() => { setFilterCategory(cat); setFilterOpen(false); }}>
            {getCategoryIcon(cat)} {cat}
          </button>
        ))}
      </div>
    )}
  </div>
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
                  {filteredExpenses.length === 0 && (
  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-muted)' }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
    <p style={{ fontSize: 15, marginBottom: 4, color: 'var(--ink)' }}>No expenses yet</p>
    <p style={{ fontSize: 13 }}>Add your first entry to start tracking.</p>
  </div>
)}
                  {paginatedExpenses.map((exp) => {
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
                        <div className="row-actions" ref={openActionId === exp.id ? actionRef : null}>
                          <button className="dots-btn" onClick={() => setOpenActionId(openActionId === exp.id ? null : exp.id)}>⋮</button>
                          {openActionId === exp.id && (
                            <div className="action-dropdown">
                              <button
                                className="action-item"
                                onClick={() => {
                                  setEditingExpense({
                                    id: exp.id,
                                    amount: exp.amount,
                                    description: exp.description || '',
                                    spent_at: exp.spent_at?.slice(0, 10) || '',
                                    category_id: exp.category_id || '',
                                  });
                                  setOpenActionId(null);
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="action-item danger"
                                onClick={() => { handleDelete(exp.id); setOpenActionId(null); }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="pagination-row">
                  <span className="pagination-info">
                    Showing {paginatedExpenses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                    –{Math.min(currentPage * PAGE_SIZE, filteredExpenses.length)} of {filteredExpenses.length} entries
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    <span className="page-btn current">{currentPage}</span>
                    <button
                      className="page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}


        </main>
      </div>
      {editingExpense && (
        <div className="modal-overlay" onClick={() => setEditingExpense(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="section-title">Edit entry</h2>
            <form className="entry-form" onSubmit={handleUpdate} style={{ marginTop: 16 }}>
              <div className="field-group">
                <span className="field-label">Amount</span>
                <input className="field" value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })} />
              </div>
              <div className="field-group">
                <span className="field-label">Date</span>
                <input className="field" type="date" value={editingExpense.spent_at}
                  onChange={(e) => setEditingExpense({ ...editingExpense, spent_at: e.target.value })} />
              </div>
              <div className="field-group full">
                <span className="field-label">Description</span>
                <input className="field" value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })} />
              </div>
              <div className="field-group full">
                <span className="field-label">Category</span>
                <select className="field" value={editingExpense.category_id}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category_id: e.target.value })}>
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-group full modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingExpense(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;