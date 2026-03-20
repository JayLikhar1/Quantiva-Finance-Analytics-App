const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d)) filter.date.$gte = d;
      }
      if (endDate) {
        const d = new Date(endDate);
        if (!isNaN(d)) filter.date.$lte = d;
      }
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, description, date, tags } = req.body;
    if (!amount || !type || !category)
      return res.status(400).json({ success: false, message: 'Amount, type, and category are required' });

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: Math.abs(amount),
      type,
      category,
      description,
      date: date || new Date(),
      tags,
    });

    res.status(201).json({ success: true, transaction });
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction)
      return res.status(404).json({ success: false, message: 'Transaction not found' });

    // Whitelist updatable fields to prevent userId/security overwrite
    const { amount, type, category, description, date, tags } = req.body;
    if (amount !== undefined) transaction.amount = Math.abs(amount);
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = date;
    if (tags !== undefined) transaction.tags = tags;
    await transaction.save();
    res.json({ success: true, transaction });
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction)
      return res.status(404).json({ success: false, message: 'Transaction not found' });

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};
