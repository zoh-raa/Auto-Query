const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const { validateToken } = require('../middlewares/auth');

// ✅ Route to create RFQ
router.post('/', validateToken, rfqController.createRFQ);

// ✅ Optional additional routes:
router.get('/my', validateToken, rfqController.getMyRFQs);
router.get('/all', validateToken, rfqController.getAllRFQs);
router.get('/:id', validateToken, rfqController.getRFQById);
router.put('/:id', validateToken, rfqController.updateRFQ);
router.delete('/:id', validateToken, rfqController.deleteRFQ);

module.exports = router;
