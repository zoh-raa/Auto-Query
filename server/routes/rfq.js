const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const { validateToken } = require('../middlewares/auth');

router.post('/', validateToken, rfqController.createRFQ);
router.get('/my', validateToken, rfqController.getMyRFQs);
router.get('/all', validateToken, rfqController.getAllRFQs);
router.put('/:id', validateToken, rfqController.updateRFQ);
router.delete('/:id', validateToken, rfqController.deleteRFQ);
router.get('/:id', validateToken, rfqController.getRFQById);

module.exports = router;
