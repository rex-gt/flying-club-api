const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationsController');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', asyncHandler(getReservations));
router.get('/:id', asyncHandler(getReservationById));
router.post('/', asyncHandler(createReservation));
router.put('/:id', asyncHandler(updateReservation));
router.delete('/:id', asyncHandler(deleteReservation));

module.exports = router;
