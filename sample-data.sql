-- Sample data for Flying Club Scheduling System
-- Run this after schema.sql to populate the database with test data

-- Insert sample members
INSERT INTO members (member_number, first_name, last_name, email, phone, is_active) VALUES
('M001', 'John', 'Smith', 'john.smith@example.com', '555-0101', true),
('M002', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '555-0102', true),
('M003', 'Michael', 'Williams', 'michael.williams@example.com', '555-0103', true),
('M004', 'Emily', 'Brown', 'emily.brown@example.com', '555-0104', true),
('M005', 'David', 'Jones', 'david.jones@example.com', '555-0105', true),
('M006', 'Lisa', 'Garcia', 'lisa.garcia@example.com', '555-0106', true),
('M007', 'Robert', 'Martinez', 'robert.martinez@example.com', '555-0107', true),
('M008', 'Jennifer', 'Davis', 'jennifer.davis@example.com', '555-0108', true),
('M009', 'William', 'Rodriguez', 'william.rodriguez@example.com', '555-0109', true),
('M010', 'Mary', 'Wilson', 'mary.wilson@example.com', '555-0110', true);

-- Insert sample aircraft
INSERT INTO aircraft (tail_number, make, model, year, hourly_rate, current_tach_hours, is_available) VALUES
('N12345', 'Cessna', '172S', 2018, 135.00, 2450.5, true),
('N67890', 'Piper', 'PA-28-181', 2015, 125.00, 3821.3, true),
('N24680', 'Cessna', '182T', 2020, 165.00, 892.7, true),
('N13579', 'Cirrus', 'SR22', 2019, 285.00, 1247.2, true),
('N97531', 'Cessna', '172N', 2005, 110.00, 8456.9, false);

-- Insert sample reservations
INSERT INTO reservations (member_id, aircraft_id, start_time, end_time, status, notes) VALUES
(1, 1, '2024-03-20 09:00:00', '2024-03-20 12:00:00', 'scheduled', 'Local flight practice'),
(2, 2, '2024-03-20 14:00:00', '2024-03-20 17:00:00', 'scheduled', 'Cross country to KBOS'),
(3, 3, '2024-03-21 08:00:00', '2024-03-21 10:00:00', 'scheduled', 'Instrument practice'),
(4, 1, '2024-03-22 10:00:00', '2024-03-22 13:00:00', 'scheduled', 'Touch and go practice'),
(5, 4, '2024-03-23 15:00:00', '2024-03-23 18:00:00', 'scheduled', 'Personal trip'),
-- Past completed reservations
(1, 1, '2024-03-10 09:00:00', '2024-03-10 11:00:00', 'completed', 'Pattern work'),
(2, 2, '2024-03-12 13:00:00', '2024-03-12 16:00:00', 'completed', 'Local area'),
(3, 1, '2024-03-14 10:00:00', '2024-03-14 12:30:00', 'completed', 'Solo practice'),
(6, 3, '2024-03-15 14:00:00', '2024-03-15 17:00:00', 'completed', 'XC to KHPN'),
(7, 2, '2024-03-16 09:00:00', '2024-03-16 11:00:00', 'completed', 'Flight review');

-- Insert sample flight logs for completed flights
INSERT INTO flight_logs (reservation_id, member_id, aircraft_id, tach_start, tach_end, flight_date, departure_time, arrival_time) VALUES
(6, 1, 1, 2445.2, 2447.1, '2024-03-10', '2024-03-10 09:15:00', '2024-03-10 10:50:00'),
(7, 2, 2, 3815.8, 3818.9, '2024-03-12', '2024-03-12 13:10:00', '2024-03-12 15:55:00'),
(8, 3, 1, 2447.1, 2449.6, '2024-03-14', '2024-03-14 10:05:00', '2024-03-14 12:25:00'),
(9, 6, 3, 888.5, 891.3, '2024-03-15', '2024-03-15 14:20:00', '2024-03-15 16:52:00'),
(10, 7, 2, 3818.9, 3821.3, '2024-03-16', '2024-03-16 09:05:00', '2024-03-16 10:58:00');

-- Generate billing records for the completed flights
INSERT INTO billing_records (member_id, flight_log_id, aircraft_id, tach_hours, hourly_rate, amount, billing_date, is_paid, payment_date) VALUES
(1, 1, 1, 1.9, 135.00, 256.50, '2024-03-10', true, '2024-03-12'),
(2, 2, 2, 3.1, 125.00, 387.50, '2024-03-12', true, '2024-03-14'),
(3, 3, 1, 2.5, 135.00, 337.50, '2024-03-14', false, null),
(6, 4, 3, 2.8, 165.00, 462.00, '2024-03-15', false, null),
(7, 5, 2, 2.4, 125.00, 300.00, '2024-03-16', false, null);

-- Verify data was inserted
SELECT 'Members inserted: ' || COUNT(*) FROM members;
SELECT 'Aircraft inserted: ' || COUNT(*) FROM aircraft;
SELECT 'Reservations inserted: ' || COUNT(*) FROM reservations;
SELECT 'Flight logs inserted: ' || COUNT(*) FROM flight_logs;
SELECT 'Billing records inserted: ' || COUNT(*) FROM billing_records;
