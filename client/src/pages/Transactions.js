import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiSearch, HiDownload, HiTrash, HiPencil, HiFilter } from 'react-icons/hi';
import { transactionsAPI } from '../api';
import { formatCurrency, formatDate, categoryColors, exportToCSV } from '../utils/format';
import AddTransactionModal from '../components/ui/AddTransactionModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Utilities', 'Travel', 'Subscriptions', 'Salary', 'Freelance', 'Investment'];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', search: '' });
  const [page, setPage]   = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.type) params.type = filters.type;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await transactionsAPI.getAll(params);
      setTransactions(data.transactions);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionsAPI.delete(id);
      toast.success('Deleted');
      fetchTransactions();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExport = async () => {
    try {
      const { data } = await transactionsAPI.getAll({ limit: 1000 });
      exportToCSV(data.transactions);
      toast.success('Exported to CSV');
    } catch { toast.error('Export failed'); }
  };

  const filtered = transactions.filter((t) =>
    !filters.search ||
    t.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.category.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div className="flex items-start justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-white/25 text-sm mt-1">{total} records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-sm">
            <HiDownload size={14} /> Export
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <HiPlus size={14} /> Add
          </button>
        </div>
      </motion.div>

      {/* Search + filter bar */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field pl-9 text-sm py-2.5"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost flex items-center gap-2 text-sm py-2.5"
            style={showFilters ? { background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.2)', color: '#a78bfa' } : {}}
          >
            <HiFilter size={14} /> Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
                    className="input-field text-sm py-2" style={{ background: '#0f0e1a', color: '#e2e8f0' }}>
                    <option value="" style={{ background: '#0f0e1a' }}>All Types</option>
                    <option value="income" style={{ background: '#0f0e1a' }}>Income</option>
                    <option value="expense" style={{ background: '#0f0e1a' }}>Expense</option>
                  </select>
                  <input type="date" value={filters.startDate}
                    onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
                    className="input-field text-sm py-2" />
                  <input type="date" value={filters.endDate}
                    onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
                    className="input-field text-sm py-2" />
                </div>
                {/* Category pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.slice(0, 10).map((cat) => (
                    <button key={cat}
                      onClick={() => { setFilters({ ...filters, category: cat }); setPage(1); }}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                      style={
                        filters.category === cat || (cat === 'All' && !filters.category)
                          ? { background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }
                          : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Transaction list */}
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 shimmer rounded w-2/5" />
                  <div className="h-2 shimmer rounded w-1/4" />
                </div>
                <div className="h-4 shimmer rounded w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3 opacity-30">◈</div>
            <p className="text-white/20 text-sm">No transactions found</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div
                key={t._id}
                className="flex items-center gap-4 px-5 py-3.5 group transition-all duration-150"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.025 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: `${categoryColors[t.category] || '#6366f1'}15`,
                    color: categoryColors[t.category] || '#6366f1',
                    border: `1px solid ${categoryColors[t.category] || '#6366f1'}25`,
                  }}>
                  {t.category.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-medium truncate">{t.description || t.category}</p>
                  <p className="text-white/25 text-xs mt-0.5">{t.category} · {formatDate(t.date)}</p>
                </div>

                {/* Amount */}
                <div className="text-right mr-2">
                  <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                  </p>
                  <p className="text-white/20 text-xs capitalize">{t.type}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditData(t); setShowAdd(true); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#a78bfa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                    <HiPencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(t._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                    <HiTrash size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-ghost text-sm disabled:opacity-30 py-2">← Prev</button>
          <span className="text-white/25 text-sm">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-ghost text-sm disabled:opacity-30 py-2">Next →</button>
        </div>
      )}

      <AddTransactionModal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); setEditData(null); }}
        onSuccess={fetchTransactions}
        editData={editData}
      />
    </div>
  );
};

export default Transactions;
