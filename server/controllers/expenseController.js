const Expense = require('../models/Expense');
const { validateExpense } = require('../validations/expenseValidation');

// GET /api/expenses
async function listExpenses(req, res, next) {
  try {
    const { page = 1, limit = 10, q = '', category = '', sort = 'date_desc' } = req.query;

    const filter = { userId: req.user._id };

    // Keyword search on title or category
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    const sortMap = {
      date_desc: { expenseDate: -1 },
      date_asc: { expenseDate: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 },
    };
    const sortObj = sortMap[sort] || { expenseDate: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Expense.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      Expense.countDocuments(filter),
    ]);

    return res.json({
      data,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/expenses
async function createExpense(req, res, next) {
  try {
    const { title, amount, category, paymentMethod, notes, expenseDate } = req.body;

    const errors = validateExpense({ title, amount, category, paymentMethod, expenseDate });
    if (errors) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      category,
      paymentMethod,
      notes: notes || '',
      expenseDate: new Date(expenseDate),
    });

    return res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

// GET /api/expenses/:id
async function getExpense(req, res, next) {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.json(expense);
  } catch (err) {
    next(err);
  }
}

// PUT /api/expenses/:id
async function updateExpense(req, res, next) {
  try {
    const { title, amount, category, paymentMethod, notes, expenseDate } = req.body;

    const errors = validateExpense({ title, amount, category, paymentMethod, expenseDate });
    if (errors) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, amount: Number(amount), category, paymentMethod, notes: notes || '', expenseDate: new Date(expenseDate) },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.json(expense);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listExpenses, createExpense, getExpense, updateExpense, deleteExpense };
