const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

dotenv.config();

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Business'],
  expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Utilities', 'Travel', 'Subscriptions'],
};

const descriptions = {
  Food: ['Grocery store', 'Restaurant dinner', 'Coffee shop', 'Lunch delivery', 'Supermarket'],
  Transport: ['Uber ride', 'Gas station', 'Monthly transit pass', 'Parking fee'],
  Housing: ['Monthly rent', 'Electricity bill', 'Internet bill', 'Home maintenance'],
  Entertainment: ['Netflix subscription', 'Movie tickets', 'Concert tickets', 'Gaming'],
  Healthcare: ['Doctor visit', 'Pharmacy', 'Gym membership', 'Dental checkup'],
  Shopping: ['Amazon order', 'Clothing store', 'Electronics', 'Home decor'],
  Education: ['Online course', 'Books', 'Workshop fee'],
  Utilities: ['Water bill', 'Gas bill', 'Phone bill'],
  Travel: ['Flight tickets', 'Hotel booking', 'Airbnb'],
  Subscriptions: ['Spotify', 'Adobe Creative Cloud', 'iCloud storage', 'YouTube Premium'],
  Salary: ['Monthly salary', 'Bi-weekly paycheck'],
  Freelance: ['Web design project', 'Consulting fee', 'Freelance writing'],
  Investment: ['Dividend income', 'Stock sale', 'Crypto gains'],
  Business: ['Client payment', 'Product sale'],
};

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(monthsAgo) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()));
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Transaction.deleteMany({});

  // Create demo user — let the model's pre-save hook handle hashing
  const user = await User.create({
    name: 'Alex Johnson',
    email: 'demo@quantiva.app',
    password: 'demo1234',
    currency: 'INR',
  });

  console.log('Demo user created:', user.email);

  const transactions = [];

  // Generate 12 months of data
  for (let month = 11; month >= 0; month--) {
    // Income (1-2 per month)
    transactions.push({
      userId: user._id,
      amount: randomBetween(4500, 6000),
      type: 'income',
      category: 'Salary',
      description: 'Monthly salary',
      date: randomDate(month),
    });

    if (Math.random() > 0.5) {
      transactions.push({
        userId: user._id,
        amount: randomBetween(200, 1500),
        type: 'income',
        category: categories.income[Math.floor(Math.random() * 3) + 1],
        description: 'Side income',
        date: randomDate(month),
      });
    }

    // Expenses (15-25 per month)
    const expenseCount = Math.floor(randomBetween(15, 25));
    for (let i = 0; i < expenseCount; i++) {
      const cat = categories.expense[Math.floor(Math.random() * categories.expense.length)];
      const descs = descriptions[cat];
      const desc = descs[Math.floor(Math.random() * descs.length)];

      const amountRanges = {
        Housing: [800, 1800], Food: [15, 150], Transport: [10, 120],
        Entertainment: [10, 80], Healthcare: [20, 200], Shopping: [20, 300],
        Education: [30, 200], Utilities: [30, 150], Travel: [100, 800],
        Subscriptions: [5, 30],
      };

      const [min, max] = amountRanges[cat] || [10, 100];
      transactions.push({
        userId: user._id,
        amount: randomBetween(min, max),
        type: 'expense',
        category: cat,
        description: desc,
        date: randomDate(month),
      });
    }
  }

  await Transaction.insertMany(transactions);
  console.log(`Seeded ${transactions.length} transactions`);
  console.log('\n✅ Seed complete!');
  console.log('Demo credentials: demo@quantiva.app / demo1234');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
