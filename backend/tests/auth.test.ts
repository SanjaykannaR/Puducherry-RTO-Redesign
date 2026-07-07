import request from 'supertest';
import app from '../src/index';

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', mobile: '9876543210', password: 'Pass123!', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', mobile: '1111111111', password: 'Pass123!', name: 'Dup' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', mobile: '2222222222', password: 'Pass123!', name: 'Dup' });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', mobile: '3333333333', password: 'Pass123!', name: 'Login' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Pass123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user info with valid token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@example.com', mobile: '4444444444', password: 'Pass123!', name: 'Me' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
  });

  it('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
