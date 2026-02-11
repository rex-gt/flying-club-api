const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flying_club',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============ MEMBERS ENDPOINTS ============

// GET all members
app.get('/api/members', asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM members ORDER BY last_name, first_name'
  );
  res.json(result.rows);
}));

// GET member by ID
app.get('/api/members/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.json(result.rows[0]);
}));

// POST create new member
app.post('/api/members', asyncHandler(async (req, res) => {
  const { member_number, first_name, last_name, email, phone } = req.body;
  
  const result = await pool.query(
    `INSERT INTO members (member_number, first_name, last_name, email, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [member_number, first_name, last_name, email, phone]
  );
  
  res.status(201).json(result.rows[0]);
}));

// PUT update member
app.put('/api/members/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, is_active } = req.body;
  
  const result = await pool.query(
    `UPDATE members 
     SET first_name = $1, last_name = $2, email = $3, phone = $4, is_active = $5
     WHERE id = $6
     RETURNING *`,
    [first_name, last_name, email, phone, is_active, id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.json(result.rows[0]);
}));

// DELETE member
app.delete('/api/members/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.json({ message: 'Member deleted successfully', member: result.rows[0] });
}));

// ============ AIRCRAFT ENDPOINTS ============

// GET all aircraft
app.get('/api/aircraft', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM aircraft ORDER BY tail_number');
  res.json(result.rows);
}));

// GET aircraft by ID
app.get('/api/aircraft/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM aircraft WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Aircraft not found' });
  }
  res.json(result.rows[0]);
}));

// POST create new aircraft
app.post('/api/aircraft', asyncHandler(async (req, res) => {
  const { tail_number, make, model, year, hourly_rate, current_tach_hours } = req.body;
  
  const result = await pool.query(
    `INSERT INTO aircraft (tail_number, make, model, year, hourly_rate, current_tach_hours)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tail_number, make, model, year, hourly_rate, current_tach_hours || 0]
  );
  
  res.status(201).json(result.rows[0]);
}));

// PUT update aircraft
app.put('/api/aircraft/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { make, model, year, hourly_rate, current_tach_hours, is_available } = req.body;
  
  const result = await pool.query(
    `UPDATE aircraft 
     SET make = $1, model = $2, year = $3, hourly_rate = $4, 
         current_tach_hours = $5, is_available = $6
     WHERE id = $7
     RETURNING *`,
    [make, model, year, hourly_rate, current_tach_hours, is_available, id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Aircraft not found' });
  }
  res.json(result.rows[0]);
}));

// DELETE aircraft
app.delete('/api/aircraft/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM aircraft WHERE id = $1 RETURNING *', [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Aircraft not found' });
  }
  res.json({ message: 'Aircraft deleted successfully', aircraft: result.rows[0] });
}));

// ============ RESERVATIONS ENDPOINTS ============

// GET all reservations (with optional filters)
app.get('/api/reservations', asyncHandler(async (req, res) => {
  const { member_id, aircraft_id, status, start_date, end_date } = req.query;
  
  let query = `
    SELECT r.*, 
           m.first_name || ' ' || m.last_name as member_name,
           a.tail_number, a.make, a.model
    FROM reservations r
    JOIN members m ON r.member_id = m.id
    JOIN aircraft a ON r.aircraft_id = a.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;
  
  if (member_id) {
    query += ` AND r.member_id = $${paramCount}`;
    params.push(member_id);
    paramCount++;
  }
  
  if (aircraft_id) {
    query += ` AND r.aircraft_id = $${paramCount}`;
    params.push(aircraft_id);
    paramCount++;
  }
  
  if (status) {
    query += ` AND r.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }
  
  if (start_date) {
    query += ` AND r.start_time >= $${paramCount}`;
    params.push(start_date);
    paramCount++;
  }
  
  if (end_date) {
    query += ` AND r.end_time <= $${paramCount}`;
    params.push(end_date);
    paramCount++;
  }
  
  query += ' ORDER BY r.start_time DESC';
  
  const result = await pool.query(query, params);
  res.json(result.rows);
}));

// GET reservation by ID
app.get('/api/reservations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT r.*, 
            m.first_name || ' ' || m.last_name as member_name,
            a.tail_number, a.make, a.model
     FROM reservations r
     JOIN members m ON r.member_id = m.id
     JOIN aircraft a ON r.aircraft_id = a.id
     WHERE r.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json(result.rows[0]);
}));

// POST create new reservation
app.post('/api/reservations', asyncHandler(async (req, res) => {
  const { member_id, aircraft_id, start_time, end_time, notes } = req.body;
  
  // Check for conflicts
  const conflictCheck = await pool.query(
    `SELECT id FROM reservations 
     WHERE aircraft_id = $1 
     AND status NOT IN ('cancelled', 'completed')
     AND (
       (start_time <= $2 AND end_time > $2) OR
       (start_time < $3 AND end_time >= $3) OR
       (start_time >= $2 AND end_time <= $3)
     )`,
    [aircraft_id, start_time, end_time]
  );
  
  if (conflictCheck.rows.length > 0) {
    return res.status(409).json({ 
      error: 'Time conflict with existing reservation',
      conflicting_reservation_id: conflictCheck.rows[0].id
    });
  }
  
  const result = await pool.query(
    `INSERT INTO reservations (member_id, aircraft_id, start_time, end_time, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [member_id, aircraft_id, start_time, end_time, notes]
  );
  
  res.status(201).json(result.rows[0]);
}));

// PUT update reservation
app.put('/api/reservations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, status, notes } = req.body;
  
  const result = await pool.query(
    `UPDATE reservations 
     SET start_time = $1, end_time = $2, status = $3, notes = $4
     WHERE id = $5
     RETURNING *`,
    [start_time, end_time, status, notes, id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json(result.rows[0]);
}));

// DELETE reservation
app.delete('/api/reservations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM reservations WHERE id = $1 RETURNING *',
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json({ message: 'Reservation deleted successfully', reservation: result.rows[0] });
}));

// ============ FLIGHT LOGS ENDPOINTS ============

// GET all flight logs
app.get('/api/flight-logs', asyncHandler(async (req, res) => {
  const { member_id, aircraft_id, start_date, end_date } = req.query;
  
  let query = `
    SELECT fl.*, 
           m.first_name || ' ' || m.last_name as member_name,
           a.tail_number, a.make, a.model
    FROM flight_logs fl
    JOIN members m ON fl.member_id = m.id
    JOIN aircraft a ON fl.aircraft_id = a.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;
  
  if (member_id) {
    query += ` AND fl.member_id = $${paramCount}`;
    params.push(member_id);
    paramCount++;
  }
  
  if (aircraft_id) {
    query += ` AND fl.aircraft_id = $${paramCount}`;
    params.push(aircraft_id);
    paramCount++;
  }
  
  if (start_date) {
    query += ` AND fl.flight_date >= $${paramCount}`;
    params.push(start_date);
    paramCount++;
  }
  
  if (end_date) {
    query += ` AND fl.flight_date <= $${paramCount}`;
    params.push(end_date);
    paramCount++;
  }
  
  query += ' ORDER BY fl.flight_date DESC, fl.departure_time DESC';
  
  const result = await pool.query(query, params);
  res.json(result.rows);
}));

// GET flight log by ID
app.get('/api/flight-logs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT fl.*, 
            m.first_name || ' ' || m.last_name as member_name,
            a.tail_number, a.make, a.model
     FROM flight_logs fl
     JOIN members m ON fl.member_id = m.id
     JOIN aircraft a ON fl.aircraft_id = a.id
     WHERE fl.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Flight log not found' });
  }
  res.json(result.rows[0]);
}));

// POST create new flight log
app.post('/api/flight-logs', asyncHandler(async (req, res) => {
  const { 
    reservation_id, member_id, aircraft_id, tach_start, tach_end, 
    flight_date, departure_time, arrival_time 
  } = req.body;
  
  const result = await pool.query(
    `INSERT INTO flight_logs 
     (reservation_id, member_id, aircraft_id, tach_start, tach_end, 
      flight_date, departure_time, arrival_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [reservation_id, member_id, aircraft_id, tach_start, tach_end, 
     flight_date, departure_time, arrival_time]
  );
  
  // Update aircraft tach hours if flight is complete
  if (tach_end) {
    await pool.query(
      'UPDATE aircraft SET current_tach_hours = $1 WHERE id = $2',
      [tach_end, aircraft_id]
    );
  }
  
  res.status(201).json(result.rows[0]);
}));

// PUT update flight log
app.put('/api/flight-logs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tach_start, tach_end, flight_date, departure_time, arrival_time } = req.body;
  
  const result = await pool.query(
    `UPDATE flight_logs 
     SET tach_start = $1, tach_end = $2, flight_date = $3, 
         departure_time = $4, arrival_time = $5
     WHERE id = $6
     RETURNING *`,
    [tach_start, tach_end, flight_date, departure_time, arrival_time, id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Flight log not found' });
  }
  
  // Update aircraft tach hours if flight is complete
  if (tach_end) {
    await pool.query(
      'UPDATE aircraft SET current_tach_hours = $1 WHERE aircraft_id = $2',
      [tach_end, result.rows[0].aircraft_id]
    );
  }
  
  res.json(result.rows[0]);
}));

// DELETE flight log
app.delete('/api/flight-logs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM flight_logs WHERE id = $1 RETURNING *',
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Flight log not found' });
  }
  res.json({ message: 'Flight log deleted successfully', flight_log: result.rows[0] });
}));

// ============ BILLING ENDPOINTS ============

// GET all billing records
app.get('/api/billing', asyncHandler(async (req, res) => {
  const { member_id, is_paid, start_date, end_date } = req.query;
  
  let query = `
    SELECT br.*, 
           m.first_name || ' ' || m.last_name as member_name,
           m.email as member_email,
           a.tail_number
    FROM billing_records br
    JOIN members m ON br.member_id = m.id
    JOIN aircraft a ON br.aircraft_id = a.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;
  
  if (member_id) {
    query += ` AND br.member_id = $${paramCount}`;
    params.push(member_id);
    paramCount++;
  }
  
  if (is_paid !== undefined) {
    query += ` AND br.is_paid = $${paramCount}`;
    params.push(is_paid === 'true');
    paramCount++;
  }
  
  if (start_date) {
    query += ` AND br.billing_date >= $${paramCount}`;
    params.push(start_date);
    paramCount++;
  }
  
  if (end_date) {
    query += ` AND br.billing_date <= $${paramCount}`;
    params.push(end_date);
    paramCount++;
  }
  
  query += ' ORDER BY br.billing_date DESC';
  
  const result = await pool.query(query, params);
  res.json(result.rows);
}));

// POST generate billing from flight log
app.post('/api/billing/generate', asyncHandler(async (req, res) => {
  const { flight_log_id } = req.body;
  
  // Get flight log details
  const flightLog = await pool.query(
    `SELECT fl.*, a.hourly_rate 
     FROM flight_logs fl
     JOIN aircraft a ON fl.aircraft_id = a.id
     WHERE fl.id = $1`,
    [flight_log_id]
  );
  
  if (flightLog.rows.length === 0) {
    return res.status(404).json({ error: 'Flight log not found' });
  }
  
  const log = flightLog.rows[0];
  
  if (!log.tach_end) {
    return res.status(400).json({ error: 'Flight log must be completed (tach_end required)' });
  }
  
  const tachHours = parseFloat(log.tach_end) - parseFloat(log.tach_start);
  const amount = tachHours * parseFloat(log.hourly_rate);
  
  // Check if billing already exists for this flight log
  const existingBilling = await pool.query(
    'SELECT id FROM billing_records WHERE flight_log_id = $1',
    [flight_log_id]
  );
  
  if (existingBilling.rows.length > 0) {
    return res.status(409).json({ 
      error: 'Billing record already exists for this flight log',
      billing_id: existingBilling.rows[0].id
    });
  }
  
  const result = await pool.query(
    `INSERT INTO billing_records 
     (member_id, flight_log_id, aircraft_id, tach_hours, hourly_rate, amount)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [log.member_id, flight_log_id, log.aircraft_id, tachHours, log.hourly_rate, amount]
  );
  
  res.status(201).json(result.rows[0]);
}));

// PUT mark billing as paid
app.put('/api/billing/:id/pay', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query(
    `UPDATE billing_records 
     SET is_paid = true, payment_date = CURRENT_DATE
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Billing record not found' });
  }
  res.json(result.rows[0]);
}));

// GET member billing summary
app.get('/api/billing/summary/:member_id', asyncHandler(async (req, res) => {
  const { member_id } = req.params;
  
  const result = await pool.query(
    `SELECT 
       COUNT(*) as total_flights,
       SUM(tach_hours) as total_hours,
       SUM(amount) as total_amount,
       SUM(CASE WHEN is_paid THEN amount ELSE 0 END) as paid_amount,
       SUM(CASE WHEN NOT is_paid THEN amount ELSE 0 END) as unpaid_amount
     FROM billing_records
     WHERE member_id = $1`,
    [member_id]
  );
  
  res.json(result.rows[0]);
}));

// DELETE billing record
app.delete('/api/billing/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM billing_records WHERE id = $1 RETURNING *',
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Billing record not found' });
  }
  res.json({ message: 'Billing record deleted successfully', billing: result.rows[0] });
}));

// ============ UTILITY ENDPOINTS ============

// GET aircraft availability for a time range
app.get('/api/aircraft/availability', asyncHandler(async (req, res) => {
  const { start_time, end_time } = req.query;
  
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'start_time and end_time required' });
  }
  
  const result = await pool.query(
    `SELECT a.*, 
       CASE WHEN r.id IS NULL THEN true ELSE false END as is_available_for_timeframe
     FROM aircraft a
     LEFT JOIN reservations r ON a.id = r.aircraft_id
       AND r.status NOT IN ('cancelled', 'completed')
       AND (
         (r.start_time <= $1 AND r.end_time > $1) OR
         (r.start_time < $2 AND r.end_time >= $2) OR
         (r.start_time >= $1 AND r.end_time <= $2)
       )
     WHERE a.is_available = true
     ORDER BY a.tail_number`,
    [start_time, end_time]
  );
  
  res.json(result.rows);
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Flying Club API server running on port ${PORT}`);
});

module.exports = app;
