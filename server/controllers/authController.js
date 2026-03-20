const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, currency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both fields are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

exports.getBudgets = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('budgets');
    const budgets = user?.budgets instanceof Map
      ? Object.fromEntries(user.budgets)
      : (user?.budgets || {});
    res.json({ success: true, budgets });
  } catch (err) { next(err); }
};

exports.saveBudgets = async (req, res, next) => {
  try {
    const { budgets } = req.body;
    if (!budgets || typeof budgets !== 'object')
      return res.status(400).json({ success: false, message: 'Invalid budgets data' });

    // Use $set with dot-notation — most reliable way to update Map fields in Mongoose
    const setOps = {};
    Object.entries(budgets).forEach(([k, v]) => {
      setOps[`budgets.${k}`] = Number(v);
    });

    await User.findByIdAndUpdate(req.user._id, { $set: setOps }, { new: true });
    res.json({ success: true, message: 'Budgets saved' });
  } catch (err) { next(err); }
};
