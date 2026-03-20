import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import { transactionsAPI } from '../../api';
import toast from 'react-hot-toast';

const INCOME_CATS  = ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'];
const EXPENSE_CATS = ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Utilities', 'Travel', 'Subscriptions', 'Other Expense'];

const AddTransactionModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [form, setForm] = useState(editData || {
    amount: '', type: 'expense', category: 'Food', description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handleTypeChange = (type) =>
    setForm((f) => ({ ...f, type, category: type === 'income' ? 'Salary' : 'Food' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      if (editData?._id) {
        await transactionsAPI.update(editData._id, form);
        toast.success('Transaction updated');
      } else {
        await transactionsAPI.create(form);
        toast.success('Transaction added');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'New Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Type toggle */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { value: 'expense', label: '− Expense', activeStyle: { background: 'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(249,115,22,0.2))', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' } },
            { value: 'income',  label: '+ Income',  activeStyle: { background: 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(6,182,212,0.2))', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' } },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTypeChange(t.value)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={form.type === t.value ? t.activeStyle : { color: 'rgba(255,255,255,0.3)' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg font-light">₹</span>
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input-field pl-8 text-xl font-semibold"
            min="0" step="0.01" required
          />
        </div>

        {/* Category */}
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="input-field text-sm"
          style={{ background: '#0f0e1a', color: '#e2e8f0' }}
        >
          {categories.map((c) => (
            <option key={c} value={c} style={{ background: '#0f0e1a', color: '#e2e8f0' }}>{c}</option>
          ))}
        </select>

        {/* Description */}
        <input
          type="text"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field text-sm"
        />

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="input-field text-sm"
        />

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 font-semibold text-sm disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span className="w-4 h-4 border-2 rounded-full"
                style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Saving...
            </span>
          ) : editData ? 'Update Transaction' : 'Add Transaction'}
        </motion.button>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;
