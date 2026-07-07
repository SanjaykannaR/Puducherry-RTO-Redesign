import request from 'supertest';
import app from '../src/index';

let token: string;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'exam@example.com', mobile: '5555555555', password: 'Pass123!', name: 'Exam Taker' });
  token = res.body.token;
});

describe('POST /api/exam/start', () => {
  it('starts exam and returns questions', async () => {
    const res = await request(app)
      .post('/api/exam/start')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(5);
    expect(res.body.questions[0]).not.toHaveProperty('answer');
  });

  it('rejects without auth', async () => {
    const res = await request(app).post('/api/exam/start');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/exam/submit', () => {
  it('scores and returns pass/fail', async () => {
    await request(app)
      .post('/api/exam/start')
      .set('Authorization', `Bearer ${token}`);

    const answers = { 1: 1, 2: 2, 3: 1, 4: 0, 5: 1 };
    const res = await request(app)
      .post('/api/exam/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('total', 5);
    expect(res.body).toHaveProperty('passed');
  });
});
