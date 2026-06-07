const { CATEGORIES, PAYMENT_METHODS } = require('../models/Expense');

function validateExpense({ title, amount, category, paymentMethod, expenseDate }) {
  const fields = {};

  if (!title || String(title).trim() === '') {
    fields.title = 'Title is required';
  } else if (String(title).length > 255) {
    fields.title = 'Title must be 255 characters or fewer';
  }

  if (amount === undefined || amount === null || amount === '') {
    fields.amount = 'Amount is required';
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    fields.amount = 'Amount must be a positive number greater than 0';
  }

  if (!category || !CATEGORIES.includes(category)) {
    fields.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
  }

  if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
    fields.paymentMethod = `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`;
  }

  if (!expenseDate) {
    fields.expenseDate = 'Expense date is required';
  } else if (isNaN(new Date(expenseDate).getTime())) {
    fields.expenseDate = 'Expense date must be a valid date';
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

module.exports = { validateExpense };
