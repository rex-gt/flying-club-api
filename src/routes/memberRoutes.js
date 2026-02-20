const express = require('express');
const router = express.Router();
const { getMembers } = require('../controllers/memberController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMembers);

module.exports = router;
