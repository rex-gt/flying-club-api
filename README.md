# WingTime Flight Management System API

A comprehensive backend service for WingTime Flight Management System, supporting aircraft scheduling, flight logs, and member billing for a flying club.

## Project Structure

```
flying-club-api/
├── src/                          # Application source code
│   ├── app.js                   # Express app setup and route mounting (50 lines)
│   ├── index.js                 # Application entry point
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool configuration
│   ├── controllers/             # Business logic controllers
│   │   ├── aircraftController.js
│   │   ├── authController.js
│   │   ├── billingController.js
│   │   ├── flightLogsController.js
│   │   ├── memberController.js
│   │   ├── reservationsController.js
│   │   └── utilityController.js
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/                  # Route definitions and endpoint mounting
│   │   ├── aircraftRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── flightLogsRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── reservationsRoutes.js
│   │   ├── userRoutes.js
│   │   └── utilityRoutes.js
│   └── utils/                   # Utility functions (for future use)
├── db/
│   ├── schema.sql               # Complete database schema
│   └── sample-data.sql          # Sample data for testing
├── test/                        # Comprehensive test suite
│   ├── aircraft.test.js         # Aircraft endpoint tests (6 tests)
│   ├── app.test.js              # API smoke tests (4 tests)
│   ├── auth.test.js             # Authentication tests (16 tests)
│   ├── billing.test.js          # Billing endpoint tests (15 tests)
│   ├── flightlogs.test.js       # Flight logs tests (8 tests)
│   ├── members.test.js          # Members endpoint tests (5 tests)
│   ├── reservations.test.js     # Reservations endpoint tests (6 tests)
│   ├── roles.test.js            # Role-based access control tests (21 tests)
│   ├── smoke-test.sh            # Live server integration tests (29 tests)
│   └── utility.test.js          # Utility endpoint tests (12 tests)
├── index.js                     # Application entry point
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Features

- **Member Management**: CRUD operations for club members with role-based access
- **Aircraft Fleet Management**: Track aircraft details, availability, tach hours, and hourly rates
- **Reservation System**: Schedule aircraft with built-in conflict detection
- **Flight Logging**: Record actual flight times, calculate tach hours, auto-update aircraft tach
- **Automated Billing**: Generate billing records based on tach hours and hourly rates
- **Availability Checking**: Query aircraft availability for specific time ranges
- **JWT Authentication**: Secure endpoints with token-based authentication
- **Role-Based Access Control (RBAC)**: Three user roles (Admin, Operator, Member) with enforced permissions
- **HTTPS Support**: Optional SSL/TLS encryption with configurable certificates
- **Protected Endpoints**: All API endpoints require authentication and role authorization
- **Comprehensive Testing**: 93 unit tests across 9 test suites plus 29 live server integration tests
- **Clean Architecture**: Modular design with separation of concerns

## Architecture

The project follows a clean, modular architecture with proper separation of concerns:

### Controller-Route Pattern
- **Controllers** contain business logic and database operations
- **Routes** define endpoint paths and mount controller functions
- **Middleware** handles authentication, error handling, and validation

### File Organization
- `app.js` (50 lines) - Minimal Express setup and route mounting only
- 7 controller files - Each handling specific business domain logic
- 7 route files - Clean endpoint definitions with asyncHandler wrapper
- Centralized error handling and database configuration

### Benefits
- **Maintainable**: Each endpoint type has its own controller/route files
- **Testable**: Clean separation allows for easier unit testing
- **Scalable**: Easy to add new endpoints following the established pattern
- **Readable**: Clear file organization and minimal app.js

## Database Schema

### Tables

1. **members** - Club member information and authentication
2. **aircraft** - Fleet aircraft details and current tach hours
3. **reservations** - Scheduled aircraft bookings with conflict detection
4. **flight_logs** - Actual flight records with tach hours
5. **billing_records** - Generated billing based on usage

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create PostgreSQL database:
```bash
createdb flying_club
```

3. Run the schema setup:
```bash
psql -d flying_club -f db/schema.sql
```

4. (Optional) Load sample data:
```bash
psql -d flying_club -f db/sample-data.sql
```

5. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT_SECRET
# Optional: Add SSL_KEY_PATH and SSL_CERT_PATH for HTTPS support
```

6. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:3000` or `https://localhost:3000` if SSL is configured

## Testing

### Test Coverage

The project includes comprehensive test coverage with **93 unit tests** across **9 test suites**, covering **100% of all endpoints**:

| Test Suite | Tests | Coverage |
|-----------|-------|----------|
| aircraft.test.js | 6 | Aircraft CRUD, Availability |
| app.test.js | 4 | API Smoke Tests |
| auth.test.js | 16 | Registration, Login, Profile, Validation, Errors |
| billing.test.js | 15 | Billing CRUD, Generation, Summary |
| flightlogs.test.js | 8 | Flight Logs CRUD, Filtering |
| members.test.js | 5 | Members CRUD |
| reservations.test.js | 6 | Reservations CRUD, Conflict Detection |
| roles.test.js | 21 | Role-Based Access Control (admin/operator/member) |
| utility.test.js | 12 | Aircraft Availability Utility |
| **TOTAL** | **93** | **31 Endpoints** |

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test auth.test.js
npm test billing.test.js
npm test flightlogs.test.js

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm test -- --coverage
```

### Test Architecture

- Tests use Jest as the testing framework
- Database layer is mocked using jest.mock() - **no real database required**
- JWT tokens are mocked for authentication testing
- All tests run sequentially with `--runInBand` flag
- Tests follow the Arrange-Act-Assert pattern

### Example Test Run

```bash
$ npm test

PASS test/billing.test.js
PASS test/auth.test.js
PASS test/roles.test.js
PASS test/utility.test.js
PASS test/reservations.test.js
PASS test/flightlogs.test.js
PASS test/aircraft.test.js
PASS test/members.test.js
PASS test/app.test.js

Test Suites: 9 passed, 9 total
Tests:       93 passed, 93 total
Snapshots:   0 total
Time:        0.689 s
```

### Live Server Integration Tests

`test/smoke-test.sh` runs 29 end-to-end tests against a live running server, covering all endpoints:

```bash
# Against local server (default: https://localhost:3000)
bash test/smoke-test.sh

# Against a specific host
bash test/smoke-test.sh https://other-host:3000
```

The script registers a temporary admin user, exercises every endpoint (auth, members, aircraft, reservations, flight logs, billing), and cleans up all created records afterward.

> **Note**: Uses `curl -sk` to skip SSL certificate verification for self-signed certs. The server must be running before executing the script.

## API Endpoints

### Members

#### GET /api/members
Get all members
```bash
curl http://localhost:3000/api/members
```

#### GET /api/members/:id
Get specific member
```bash
curl http://localhost:3000/api/members/1
```

#### POST /api/members
Create new member
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "member_number": "M001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-0100"
  }'
```

#### PUT /api/members/:id
Update member
```bash
curl -X PUT http://localhost:3000/api/members/1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "phone": "555-0100",
    "is_active": true
  }'
```

#### DELETE /api/members/:id
Delete member
```bash
curl -X DELETE http://localhost:3000/api/members/1
```

### Aircraft

#### GET /api/aircraft
Get all aircraft
```bash
curl http://localhost:3000/api/aircraft
```

#### GET /api/aircraft/:id
Get specific aircraft
```bash
curl http://localhost:3000/api/aircraft/1
```

#### POST /api/aircraft
Create new aircraft
```bash
curl -X POST http://localhost:3000/api/aircraft \
  -H "Content-Type: application/json" \
  -d '{
    "tail_number": "N12345",
    "make": "Cessna",
    "model": "172S",
    "year": 2018,
    "hourly_rate": 135.00,
    "current_tach_hours": 2450.5
  }'
```

#### PUT /api/aircraft/:id
Update aircraft
```bash
curl -X PUT http://localhost:3000/api/aircraft/1 \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Cessna",
    "model": "172S",
    "year": 2018,
    "hourly_rate": 140.00,
    "current_tach_hours": 2455.3,
    "is_available": true
  }'
```

#### DELETE /api/aircraft/:id
Delete aircraft
```bash
curl -X DELETE http://localhost:3000/api/aircraft/1
```

#### GET /api/aircraft/availability
Check aircraft availability for a time range
```bash
curl "http://localhost:3000/api/aircraft/availability?start_time=2024-03-15T09:00:00Z&end_time=2024-03-15T12:00:00Z"
```

### Reservations

#### GET /api/reservations
Get all reservations (with optional filters)
```bash
# All reservations
curl http://localhost:3000/api/reservations

# Filter by member
curl "http://localhost:3000/api/reservations?member_id=1"

# Filter by aircraft
curl "http://localhost:3000/api/reservations?aircraft_id=2"

# Filter by status
curl "http://localhost:3000/api/reservations?status=scheduled"

# Filter by date range
curl "http://localhost:3000/api/reservations?start_date=2024-03-01&end_date=2024-03-31"
```

#### GET /api/reservations/:id
Get specific reservation
```bash
curl http://localhost:3000/api/reservations/1
```

#### POST /api/reservations
Create new reservation (includes conflict detection)
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 1,
    "aircraft_id": 2,
    "start_time": "2024-03-15T09:00:00Z",
    "end_time": "2024-03-15T12:00:00Z",
    "notes": "Local flight practice"
  }'
```

#### PUT /api/reservations/:id
Update reservation
```bash
curl -X PUT http://localhost:3000/api/reservations/1 \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2024-03-15T10:00:00Z",
    "end_time": "2024-03-15T13:00:00Z",
    "status": "completed",
    "notes": "Flight completed successfully"
  }'
```

#### DELETE /api/reservations/:id
Delete reservation
```bash
curl -X DELETE http://localhost:3000/api/reservations/1
```

### Flight Logs

#### GET /api/flight-logs
Get all flight logs (with optional filters)
```bash
# All flight logs
curl http://localhost:3000/api/flight-logs

# Filter by member
curl "http://localhost:3000/api/flight-logs?member_id=1"

# Filter by aircraft
curl "http://localhost:3000/api/flight-logs?aircraft_id=2"

# Filter by date range
curl "http://localhost:3000/api/flight-logs?start_date=2024-03-01&end_date=2024-03-31"
```

#### GET /api/flight-logs/:id
Get specific flight log
```bash
curl http://localhost:3000/api/flight-logs/1
```

#### POST /api/flight-logs
Create new flight log
```bash
curl -X POST http://localhost:3000/api/flight-logs \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": 1,
    "member_id": 1,
    "aircraft_id": 2,
    "tach_start": 2450.5,
    "tach_end": 2452.8,
    "flight_date": "2024-03-15",
    "departure_time": "2024-03-15T09:15:00Z",
    "arrival_time": "2024-03-15T11:45:00Z"
  }'
```

#### PUT /api/flight-logs/:id
Update flight log
```bash
curl -X PUT http://localhost:3000/api/flight-logs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "tach_start": 2450.5,
    "tach_end": 2453.0,
    "flight_date": "2024-03-15",
    "departure_time": "2024-03-15T09:15:00Z",
    "arrival_time": "2024-03-15T12:00:00Z"
  }'
```

#### DELETE /api/flight-logs/:id
Delete flight log
```bash
curl -X DELETE http://localhost:3000/api/flight-logs/1
```

### Billing

#### GET /api/billing
Get all billing records (with optional filters)
```bash
# All billing records
curl http://localhost:3000/api/billing

# Filter by member
curl "http://localhost:3000/api/billing?member_id=1"

# Filter by payment status
curl "http://localhost:3000/api/billing?is_paid=false"

# Filter by date range
curl "http://localhost:3000/api/billing?start_date=2024-03-01&end_date=2024-03-31"
```

#### POST /api/billing/generate
Generate billing record from flight log
```bash
curl -X POST http://localhost:3000/api/billing/generate \
  -H "Content-Type: application/json" \
  -d '{
    "flight_log_id": 1
  }'
```

#### PUT /api/billing/:id/pay
Mark billing as paid
```bash
curl -X PUT http://localhost:3000/api/billing/1/pay
```

#### GET /api/billing/summary/:member_id
Get billing summary for a member
```bash
curl http://localhost:3000/api/billing/summary/1
```

Response:
```json
{
  "total_flights": "12",
  "total_hours": "28.50",
  "total_amount": "3990.00",
  "paid_amount": "2800.00",
  "unpaid_amount": "1190.00"
}
```

#### DELETE /api/billing/:id
Delete billing record
```bash
curl -X DELETE http://localhost:3000/api/billing/1
```

## Workflow Example

### Complete Flight and Billing Workflow

1. **Create a reservation:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 1,
    "aircraft_id": 1,
    "start_time": "2024-03-15T09:00:00Z",
    "end_time": "2024-03-15T12:00:00Z"
  }'
# Returns: { "id": 1, ... }
```

2. **After the flight, create a flight log:**
```bash
curl -X POST http://localhost:3000/api/flight-logs \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": 1,
    "member_id": 1,
    "aircraft_id": 1,
    "tach_start": 2450.5,
    "tach_end": 2452.8,
    "flight_date": "2024-03-15",
    "departure_time": "2024-03-15T09:15:00Z",
    "arrival_time": "2024-03-15T11:45:00Z"
  }'
# Returns: { "id": 1, "tach_hours": 2.3, ... }
```

3. **Generate billing:**
```bash
curl -X POST http://localhost:3000/api/billing/generate \
  -H "Content-Type: application/json" \
  -d '{
    "flight_log_id": 1
  }'
# Returns: { "id": 1, "amount": 310.50, "is_paid": false, ... }
```

4. **Mark as paid when member pays:**
```bash
curl -X PUT http://localhost:3000/api/billing/1/pay
# Returns: { "id": 1, "is_paid": true, "payment_date": "2024-03-20", ... }
```

5. **Check member's billing summary:**
```bash
curl http://localhost:3000/api/billing/summary/1
# Returns total hours flown, amount owed, amount paid, etc.
```

## Authentication & Authorization

This API uses JWT authentication for all endpoints. All requests require a valid Bearer token.

### User Roles

The system enforces three user roles with specific permissions:

| Role | Permissions |
|------|------------|
| **admin** | Full access to all endpoints (create, read, update, delete on all resources) |
| **operator** | Read access to members and most resources; limited write permissions |
| **member** | Personal access to own flight logs and reservations only |

### Environment Variables

Required environment variables (minimum):

- `JWT_SECRET` — secret used to sign JWT tokens
- `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` — PostgreSQL connection

Optional environment variables:

- `SSL_KEY_PATH` — path to SSL private key file for HTTPS support
- `SSL_CERT_PATH` — path to SSL certificate file for HTTPS support

### Auth Endpoints

- `POST /api/users/register` — register a new member. Required fields: `first_name`, `last_name`, `email`, `password`.
- `POST /api/users/login` — returns `{ token }` when successful.
- `GET /api/users/profile` — protected route; include header `Authorization: Bearer <token>`.

### Authentication Examples

```bash
# Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Access protected profile (replace <token> with login token)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/profile
```

You can also run the smoke test script for full end-to-end testing against a live server:
```bash
bash test/smoke-test.sh
```

### Protected Endpoints

**Note**: All API endpoints require authentication. Requests must include the following header:

```
Authorization: Bearer <JWT_TOKEN>
```

Some endpoints additionally require specific user roles. For example:

- **GET /api/members** — Requires 'admin' or 'operator' role
- **POST /api/members** — Requires 'admin' role
- **DELETE /api/members/:id** — Requires 'admin' role


## Data Models

### Member
```json
{
  "id": 1,
  "member_number": "M001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-0100",
  "is_active": true,
  "created_at": "2024-03-01T10:00:00Z",
  "updated_at": "2024-03-01T10:00:00Z"
}
```

### Aircraft
```json
{
  "id": 1,
  "tail_number": "N12345",
  "make": "Cessna",
  "model": "172S",
  "year": 2018,
  "hourly_rate": 135.00,
  "current_tach_hours": 2450.5,
  "is_available": true,
  "created_at": "2024-03-01T10:00:00Z",
  "updated_at": "2024-03-15T14:30:00Z"
}
```

### Reservation
```json
{
  "id": 1,
  "member_id": 1,
  "aircraft_id": 1,
  "start_time": "2024-03-15T09:00:00Z",
  "end_time": "2024-03-15T12:00:00Z",
  "status": "scheduled",
  "notes": "Local flight practice",
  "created_at": "2024-03-10T10:00:00Z",
  "updated_at": "2024-03-10T10:00:00Z"
}
```

### Flight Log
```json
{
  "id": 1,
  "reservation_id": 1,
  "member_id": 1,
  "aircraft_id": 1,
  "tach_start": 2450.5,
  "tach_end": 2452.8,
  "tach_hours": 2.3,
  "flight_date": "2024-03-15",
  "departure_time": "2024-03-15T09:15:00Z",
  "arrival_time": "2024-03-15T11:45:00Z",
  "created_at": "2024-03-15T12:00:00Z",
  "updated_at": "2024-03-15T12:00:00Z"
}
```

### Billing Record
```json
{
  "id": 1,
  "member_id": 1,
  "flight_log_id": 1,
  "aircraft_id": 1,
  "tach_hours": 2.3,
  "hourly_rate": 135.00,
  "amount": 310.50,
  "billing_date": "2024-03-15",
  "is_paid": false,
  "payment_date": null,
  "created_at": "2024-03-15T12:05:00Z",
  "updated_at": "2024-03-15T12:05:00Z"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (e.g., scheduling conflict, duplicate billing)
- `500` - Internal Server Error

Error responses include a JSON body:
```json
{
  "error": "Error description",
  "message": "Additional details"
}
```

## Security

### HTTPS Support

The API supports optional HTTPS/TLS encryption. To enable HTTPS:

1. Generate SSL certificates:
```bash
# Using OpenSSL (for development only)
openssl req -new -newkey rsa:2048 -nodes \
  -keyout server.key -out server.csr
openssl x509 -req -days 365 -in server.csr \
  -signkey server.key -out server.crt
```

2. Add environment variables to `.env`:
```
SSL_KEY_PATH=/path/to/server.key
SSL_CERT_PATH=/path/to/server.crt
```

3. Start the server. It will automatically use HTTPS when SSL paths are configured:
```bash
npm start
# Output: Tower, we are clear for takeoff on HTTPS port 3000
```

Without SSL configuration, the server runs on HTTP:
```
npm start
# Output: Tower, we are clear for takeoff on port 3000
```

### Password Security

- Passwords are hashed using bcryptjs before storage
- Users must provide valid credentials to obtain JWT tokens
- All protected endpoints require valid JWT tokens

## Features & Business Logic

### Reservation Conflict Detection
When creating a reservation, the system automatically checks for scheduling conflicts with existing reservations for the same aircraft.

### Automatic Tach Hour Updates
When a flight log is created or updated with a `tach_end` value, the aircraft's `current_tach_hours` is automatically updated.

### Calculated Tach Hours
Flight logs use a generated column to automatically calculate `tach_hours` from `tach_end - tach_start`.

### Billing Generation
Billing records are generated from completed flight logs, automatically calculating the amount based on tach hours and the aircraft's hourly rate.

### Duplicate Billing Prevention
The system prevents creating duplicate billing records for the same flight log.

## Future Enhancements

- Email notifications for reservations, cancellations, and billing
- Maintenance tracking for aircraft with preventive maintenance scheduling
- Flight instructor scheduling and student progress tracking
- Weather integration for flight planning
- Mobile app integration (iOS/Android)
- Reporting and analytics dashboard
- Payment processing integration (Stripe, PayPal)
- SMS notifications for reservation reminders
- Aircraft courier log tracking
- Insurance document management
- Fuel tracking and cost analysis

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`npm test`)
- New endpoints include corresponding test cases
- Code follows existing project structure and conventions

## Support

For issues, questions, or feature requests, please open an issue or contact the development team.

## License

MIT
