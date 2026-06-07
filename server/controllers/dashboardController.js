const Expense = require('../models/Expense');

// GET /api/dashboard
async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalAllTimeResult,
      totalThisMonthResult,
      recentExpenses,
      categoryBreakdown,
      monthlyTrend,
    ] = await Promise.all([

      // Total all-time
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Total this month
      Expense.aggregate([
        { $match: { userId, expenseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // 5 most recent
      Expense.find({ userId }).sort({ expenseDate: -1 }).limit(5).lean(),

      // Category-wise breakdown (for pie chart)
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),

      // Monthly trend — last 6 months (for line/bar chart)
      Expense.aggregate([
        {
          $match: {
            userId,
            expenseDate: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$expenseDate' },
              month: { $month: '$expenseDate' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Format monthly trend labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyTrend.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      total: m.total,
      count: m.count,
    }));

    return res.json({
      totalAllTime: totalAllTimeResult[0]?.total || 0,
      totalThisMonth: totalThisMonthResult[0]?.total || 0,
      recentExpenses,
      categoryBreakdown: categoryBreakdown.map((c) => ({ name: c._id, value: c.total, count: c.count })),
      monthlyTrend: formattedMonthly,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
