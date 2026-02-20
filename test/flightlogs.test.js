const http = require('http');

jest.mock('pg', () => {
  const mPool = {
    query: (text, params) => {
      const lt = (text || '').toLowerCase();
      if (lt.includes('insert into flight_logs')) {
        return Promise.resolve({ rows: [{ id: 77, reservation_id: params[0], member_id: params[1], aircraft_id: params[2], tach_end: params[4] }] });
      }
      if (lt.includes('update aircraft set current_tach_hours')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    }
  };
  return { Pool: jest.fn(() => mPool) };
});

const app = require('../src/index');

function httpRequest(port, path, method = 'GET', data = null, headers = {}) {
  const options = { port, path, method, host: '127.0.0.1', headers: Object.assign({ 'Content-Type': 'application/json' }, headers) };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

describe('Flight logs endpoints', () => {
  let server, port;
  beforeAll(() => new Promise((resolve) => { server = app.listen(0, () => { port = server.address().port; resolve(); }); }));
  afterAll(() => new Promise((resolve) => server.close(resolve)));

  test('POST /api/flight-logs creates a flight log and updates aircraft tach', async () => {
    const payload = { reservation_id: 1, member_id: 1, aircraft_id: 2, tach_start: 100, tach_end: 110, flight_date: '2026-02-02', departure_time: '10:00', arrival_time: '11:00' };
    const res = await httpRequest(port, '/api/flight-logs', 'POST', payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('tach_end', 110);
  });
});
