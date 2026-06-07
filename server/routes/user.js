const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getBalance, updateBalance } = require('../controllers/userController');

router.use(authenticate);

router.get('/balance', getBalance);
router.put('/balance', updateBalance);

module.exports = router;
