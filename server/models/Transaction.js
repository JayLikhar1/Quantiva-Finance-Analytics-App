const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Salary', 'Freelance', 'Investment', 'Business', 'Other Income',
        'Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare',
        'Shopping', 'Education', 'Utilities', 'Travel', 'Subscriptions', 'Other Expense'
      ],
    },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, default: Date.now },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
