const User = require('../models/User');

// GET /api/user/balance — return current wallet balance
async function getBalance(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    return res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    next(err);
  }
}

// PUT /api/user/balance — set wallet balance to a new value
async function updateBalance(req, res, next) {
  try {
    const { walletBalance } = req.body;

    if (walletBalance === undefined || walletBalance === null || isNaN(Number(walletBalance))) {
      return res.status(400).json({ error: 'walletBalance must be a number' });
    }
    if (Number(walletBalance) < 0) {
      return res.status(400).json({ error: 'Wallet balance cannot be negative' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletBalance: Number(walletBalance) },
      { new: true, select: 'walletBalance' }
    );

    return res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, updateBalance };
