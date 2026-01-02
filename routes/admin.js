const express = require('express');
const router = express.Router();
const c = require('../controllers/pembelianController');

router.get('/', c.index);
router.post('/beli', c.store);
router.post('/cancel/:id', c.cancel);

module.exports = router;