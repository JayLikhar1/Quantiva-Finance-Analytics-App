export const formatCurrency = (amount, currency = 'INR') => {
  const safe = isFinite(amount) && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(safe);
};

export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

export const formatShortDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
};

export const formatMonth = (key) => {
  if (!key) return '—';
  const [year, month] = key.split('-');
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1));
};

export const categoryColors = {
  Food: '#f97316', Transport: '#3b82f6', Housing: '#8b5cf6',
  Entertainment: '#ec4899', Healthcare: '#10b981', Shopping: '#f59e0b',
  Education: '#06b6d4', Utilities: '#6366f1', Travel: '#14b8a6',
  Subscriptions: '#a855f7', Salary: '#22c55e', Freelance: '#84cc16',
  Investment: '#eab308', Business: '#f97316', 'Other Income': '#10b981',
  'Other Expense': '#94a3b8',
};

export const exportToCSV = (transactions) => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = transactions.map((t) => [
    formatDate(t.date), t.type, t.category, t.description || '', t.amount,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'transactions.csv'; a.click();
  URL.revokeObjectURL(url);
};
