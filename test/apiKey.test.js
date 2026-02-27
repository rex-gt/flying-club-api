const http = require('http');

jest.mock('pg', () => {
  const mPool = {
    query: () => Promise.resolve({ rows: [] })
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(() => ({ id: 1 }))
}));

const app = require('../src/index');

function httpGet(port, path, headers = {}) {
  const options = { port, path, method: 'GET', host: '127.0.0.1', headers };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(data); } catch (e) { body = data; }
        resolve({ statusCode: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('API key authentication', () => {
  let server, port;

  beforeAll(() => {
    process.env.API_KEYS = 'valid-key-1,valid-key-2';
    return new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(() => {
    delete process.env.API_KEYS;
    return new Promise((resolve) => server.close(resolve));
  });

  test('returns 401 when no auth credentials provided', async () => {
    const res = await httpGet(port, '/api/reservations');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('returns 401 when invalid API key is provided', async () => {
    const res = await httpGet(port, '/api/reservations', { 'X-API-Key': 'invalid-key' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, invalid API key');
  });

  test('returns 200 when valid API key is provided', async () => {
    const res = await httpGet(port, '/api/reservations', { 'X-API-Key': 'valid-key-1' });
    expect(res.statusCode).toBe(200);
  });

  test('accepts any valid key from a comma-separated list', async () => {
    const res = await httpGet(port, '/api/reservations', { 'X-API-Key': 'valid-key-2' });
    expect(res.statusCode).toBe(200);
  });

  test('flight-logs route requires auth', async () => {
    const res = await httpGet(port, '/api/flight-logs');
    expect(res.statusCode).toBe(401);
  });

  test('flight-logs route accepts valid API key', async () => {
    const res = await httpGet(port, '/api/flight-logs', { 'X-API-Key': 'valid-key-1' });
    expect(res.statusCode).toBe(200);
  });

  test('billing route requires auth', async () => {
    const res = await httpGet(port, '/api/billing');
    expect(res.statusCode).toBe(401);
  });

  test('billing route accepts valid API key', async () => {
    const res = await httpGet(port, '/api/billing', { 'X-API-Key': 'valid-key-1' });
    expect(res.statusCode).toBe(200);
  });
});
