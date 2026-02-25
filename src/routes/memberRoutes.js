const express = require('express');
const router = express.Router();
const {
	getMembers,
	getMemberById,
	createMember,
	updateMember,
	deleteMember,
} = require('../controllers/memberController');
const { protect } = require('../middleware/auth');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', protect, asyncHandler(getMembers));
router.get('/:id', protect, asyncHandler(getMemberById));
router.post('/', protect, asyncHandler(createMember));
router.put('/:id', protect, asyncHandler(updateMember));
router.delete('/:id', protect, asyncHandler(deleteMember));

module.exports = router;
