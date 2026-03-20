const Transaction = require('../models/Transaction');

// Summary: total income, expense, balance
exports.getSummary = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let income = 0, expense = 0, incomeCount = 0, expenseCount = 0;
    result.forEach((r) => {
      if (r._id === 'income') { income = r.total; incomeCount = r.count; }
      if (r._id === 'expense') { expense = r.total; expenseCount = r.count; }
    });

    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    res.json({ success: true, data: { income, expense, balance, savingsRate, incomeCount, expenseCount } });
  } catch (err) { next(err); }
};

// Category breakdown
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type = 'expense', months = 3 } = req.query;
    const since = new Date();
    since.setMonth(since.getMonth() - Number(months));

    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, type, date: { $gte: since } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = data.reduce((s, d) => s + d.total, 0);
    const breakdown = data.map((d) => ({
      category: d._id,
      total: d.total,
      count: d.count,
      percentage: grandTotal > 0 ? ((d.total / grandTotal) * 100).toFixed(1) : 0,
    }));

    res.json({ success: true, data: breakdown });
  } catch (err) { next(err); }
};

// Monthly trends (last N months)
exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const since = new Date();
    since.setMonth(since.getMonth() - Number(months));

    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build month map
    const monthMap = {};
    data.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 };
      monthMap[key][_id.type] = total;
    });

    const trends = Object.values(monthMap).map((m) => ({
      ...m,
      net: m.income - m.expense,
    }));

    res.json({ success: true, data: trends });
  } catch (err) { next(err); }
};

// Month-over-month comparison
exports.getMoMComparison = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: thisMonthStart } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    const parse = (arr) => {
      const obj = { income: 0, expense: 0 };
      arr.forEach((r) => { obj[r._id] = r.total; });
      return obj;
    };

    const tm = parse(thisMonth);
    const lm = parse(lastMonth);

    const pctChange = (curr, prev) =>
      prev === 0 ? 100 : (((curr - prev) / prev) * 100).toFixed(1);

    res.json({
      success: true,
      data: {
        thisMonth: tm,
        lastMonth: lm,
        changes: {
          income: pctChange(tm.income, lm.income),
          expense: pctChange(tm.expense, lm.expense),
        },
      },
    });
  } catch (err) { next(err); }
};

// Predictive: forecast next month
exports.getForecast = async (req, res, next) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const byType = { income: [], expense: [] };
    data.forEach(({ _id, total }) => {
      if (byType[_id.type]) byType[_id.type].push(total);
    });

    const avg = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
    const trend = (arr) => {
      if (arr.length < 2) return 0;
      const last = arr[arr.length - 1];
      const prev = arr[arr.length - 2];
      return last - prev;
    };

    const forecastIncome = avg(byType.income) + trend(byType.income);
    const forecastExpense = avg(byType.expense) + trend(byType.expense);

    res.json({
      success: true,
      data: {
        forecastIncome: Math.max(0, forecastIncome),
        forecastExpense: Math.max(0, forecastExpense),
        forecastBalance: forecastIncome - forecastExpense,
        confidence: byType.expense.length >= 3 ? 'high' : byType.expense.length >= 1 ? 'medium' : 'low',
      },
    });
  } catch (err) { next(err); }
};

// Behavioral analytics
exports.getBehavioral = async (req, res, next) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);

    const transactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: since },
    });

    // Weekend vs weekday
    let weekendSpend = 0, weekdaySpend = 0;
    const categoryFreq = {};
    const descFreq = {};

    transactions.forEach((t) => {
      const day = new Date(t.date).getDay();
      if (day === 0 || day === 6) weekendSpend += t.amount;
      else weekdaySpend += t.amount;

      categoryFreq[t.category] = (categoryFreq[t.category] || 0) + 1;
      if (t.description) {
        const key = t.description.toLowerCase().trim();
        descFreq[key] = (descFreq[key] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => ({ category: cat, count }));

    const recurring = Object.entries(descFreq)
      .filter(([, count]) => count >= 2)
      .map(([desc, count]) => ({ description: desc, count }));

    res.json({
      success: true,
      data: { weekendSpend, weekdaySpend, topCategories, recurring },
    });
  } catch (err) { next(err); }
};

// Financial health score
exports.getHealthScore = async (req, res, next) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);

    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: since } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    let income = 0, expense = 0;
    result.forEach((r) => {
      if (r._id === 'income') income = r.total;
      if (r._id === 'expense') expense = r.total;
    });

    const savingsRate = income > 0 ? (income - expense) / income : 0;
    const expenseRatio = income > 0 ? expense / income : 1;

    // Score components (0-100)
    const savingsScore = Math.min(100, Math.max(0, savingsRate * 200)); // 50% savings = 100
    const spendingScore = Math.max(0, 100 - expenseRatio * 100);
    const consistencyScore = result.length > 0 ? 70 : 30; // simplified

    const score = Math.round((savingsScore * 0.4 + spendingScore * 0.4 + consistencyScore * 0.2));

    const grade =
      score >= 80 ? 'Excellent' :
      score >= 60 ? 'Good' :
      score >= 40 ? 'Fair' : 'Needs Attention';

    res.json({ success: true, data: { score, grade, savingsRate: (savingsRate * 100).toFixed(1), expenseRatio: (expenseRatio * 100).toFixed(1) } });
  } catch (err) { next(err); }
};

// AI Insights
exports.getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthCats, lastMonthCats, summary] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense', date: { $gte: thisMonthStart } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense', date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    const insights = [];
    const tmMap = {}, lmMap = {};
    thisMonthCats.forEach((c) => (tmMap[c._id] = c.total));
    lastMonthCats.forEach((c) => (lmMap[c._id] = c.total));

    // Category change insights
    Object.keys(tmMap).forEach((cat) => {
      const curr = tmMap[cat];
      const prev = lmMap[cat] || 0;
      if (prev > 0) {
        const pct = (((curr - prev) / prev) * 100).toFixed(0);
        if (pct > 20) insights.push({ type: 'warning', text: `${cat} spending increased by ${pct}% this month`, icon: '📈' });
        else if (pct < -20) insights.push({ type: 'success', text: `${cat} spending decreased by ${Math.abs(pct)}% — great job!`, icon: '📉' });
      }
    });

    // Savings insight
    let income = 0, expense = 0;
    summary.forEach((r) => {
      if (r._id === 'income') income = r.total;
      if (r._id === 'expense') expense = r.total;
    });

    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    if (savingsRate > 30) insights.push({ type: 'success', text: `You're saving ${savingsRate.toFixed(0)}% of your income — excellent!`, icon: '💰' });
    else if (savingsRate < 10 && income > 0) insights.push({ type: 'warning', text: `Savings rate is only ${savingsRate.toFixed(0)}%. Consider reducing expenses.`, icon: '⚠️' });

    if (insights.length === 0) insights.push({ type: 'info', text: 'Keep tracking your transactions for personalized insights.', icon: '💡' });

    res.json({ success: true, data: insights });
  } catch (err) { next(err); }
};

// Daily spending heatmap
exports.getDailyHeatmap = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
