const http = require('http');

jest.mock('pg', () => {
  const mPool = {
    query: (text, params) => {
      const lt = (text || '').toLowerCase();
      if (lt.includes('select * from aircraft order by')) {
        return Promise.resolve({ rows: [ { id: 1, tail_number: 'N100', make: 'Piper', model: 'PA-28' } ] });
      }
      if (lt.includes('insert into aircraft')) {
        return Promise.resolve({ rows: [{ id: 5, tail_number: params[0], make: params[1], model: params[2] }] });
      }
      if (lt.includes('select * from aircraft where id = $1')) {
        return Promise.resolve({ rows: [{ id: params[0], tail_number: 'N100', make: 'Piper', model: 'PA-28' }] });
      }
      if (lt.includes('update aircraft')) {
        return Promise.resolve({ rows: [{ id: params[5], tail_number: 'N100', make: params[0], model: params[1] }] });
      }
      if (lt.includes('delete from aircraft')) {
        return Promise.resolve({ rows: [{ id: params[0] }] });
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

describe('Aircraft endpoints', () => {
  let server, port;
  beforeAll(() => new Promise((resolve) => { server = app.listen(0, () => { port = server.address().port; resolve(); }); }));
  afterAll(() => new Promise((resolve) => server.close(resolve)));

  test('GET /api/aircraft returns list', async () => {
    const res = await httpRequest(port, '/api/aircraft');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('tail_number');
  });

  test('POST /api/aircraft creates aircraft', async () => {
    const payload = { tail_number: 'N200', make: 'Cessna', model: '172', year: 2000, hourly_rate: 100 };
    const res = await httpRequest(port, '/api/aircraft', 'POST', payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('tail_number', 'N200');
  });
});
