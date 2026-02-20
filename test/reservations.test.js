const http = require('http');

jest.mock('pg', () => {
  const mPool = {
    query: (text, params) => {
      const lt = (text || '').toLowerCase();
      if (lt.includes('select id from reservations')) {
        // Simulate a conflict when aircraft_id === 1 and start_time === '2026-01-01'
        if (params && params[0] === 1 && params[1] === '2026-01-01T10:00:00Z') {
          return Promise.resolve({ rows: [{ id: 99 }] });
        }
        return Promise.resolve({ rows: [] });
      }
      if (lt.includes('insert into reservations')) {
        return Promise.resolve({ rows: [{ id: 123, member_id: params[0], aircraft_id: params[1], start_time: params[2], end_time: params[3] }] });
      }
      return Promise.resolve({ rows: [] });
    }
  };
  return { Pool: jest.fn(() => mPool) };
});

const app = require('../src/index');

function httpRequest(port, path, method = 'GET', data = null) {
  const options = { port, path, method, host: '127.0.0.1', headers: { 'Content-Type': 'application/json' } };
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

describe('Reservations endpoint', () => {
  let server, port;
  beforeAll(() => new Promise((resolve) => { server = app.listen(0, () => { port = server.address().port; resolve(); }); }));
  afterAll(() => new Promise((resolve) => server.close(resolve)));

  test('POST /api/reservations returns 409 on conflict', async () => {
    const payload = { member_id: 1, aircraft_id: 1, start_time: '2026-01-01T10:00:00Z', end_time: '2026-01-01T11:00:00Z' };
    const res = await httpRequest(port, '/api/reservations', 'POST', payload);
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/reservations creates reservation when no conflict', async () => {
    const payload = { member_id: 1, aircraft_id: 2, start_time: '2026-02-01T10:00:00Z', end_time: '2026-02-01T11:00:00Z' };
    const res = await httpRequest(port, '/api/reservations', 'POST', payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('aircraft_id', 2);
  });
});
