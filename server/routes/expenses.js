const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { listExpenses, createExpense, getExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');

router.use(authenticate);

router.get('/', listExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
