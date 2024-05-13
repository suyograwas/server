const express = require('express');
const router = express.Router();

const {
  capturePayments,
  verifySignature
} = require('../controllers/paymentsController');
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin
} = require('../middleware/auth');
router.post('/capturePayment', auth, isStudent, capturePayments);
router.post('/verifySignature', verifySignature);

module.exports = router;
