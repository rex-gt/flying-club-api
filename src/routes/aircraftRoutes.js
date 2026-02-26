const express = require('express');
const router = express.Router();
const {
  getAircraftList,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  getAircraftAvailability,
} = require('../controllers/aircraftController');
const { protect } = require('../middleware/auth');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/availability', protect, asyncHandler(getAircraftAvailability));
router.get('/', protect, asyncHandler(getAircraftList));
router.get('/:id', protect, asyncHandler(getAircraftById));
router.post('/', protect, asyncHandler(createAircraft));
router.put('/:id', protect, asyncHandler(updateAircraft));
router.delete('/:id', protect, asyncHandler(deleteAircraft));

module.exports = router;
