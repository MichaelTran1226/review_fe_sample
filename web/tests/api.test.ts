import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/app';
import { prisma } from '../server/lib/prisma';

describe('Keystone CRM Backend REST API', () => {
  let authToken = '';
  let createdLeadId = '';

  beforeAll(async () => {
    // Ensure test user exists
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'agent@keystone.com', password: 'password123' });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    if (createdLeadId) {
      await prisma.lead.delete({ where: { id: createdLeadId } }).catch(() => {});
    }
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/v1/auth/login - should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'agent@keystone.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('GET /api/v1/auth/me - should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'agent@keystone.com');
      expect(res.body.user).toHaveProperty('name', 'Ilias Miah');
    });

    it('GET /api/v1/auth/me - should reject request without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Leads API Endpoints', () => {
    it('GET /api/v1/leads - should return paginated leads list with meta', async () => {
      const res = await request(app).get('/api/v1/leads?page=1&pageSize=10');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(17);
    });

    it('GET /api/v1/leads - should filter by search term', async () => {
      const res = await request(app).get('/api/v1/leads?search=Sofia');

      expect(res.status).toBe(200);
      expect(res.body.data.some((l: any) => l.firstName === 'Sofia')).toBe(true);
    });

    it('GET /api/v1/leads - should filter by stage', async () => {
      const res = await request(app).get('/api/v1/leads?stage=Active');

      expect(res.status).toBe(200);
      expect(res.body.data.every((l: any) => l.stage === 'Active')).toBe(true);
    });

    it('POST /api/v1/leads - should validate and reject invalid email', async () => {
      const res = await request(app).post('/api/v1/leads').send({
        firstName: 'Test',
        lastName: 'Invalid',
        email: 'not-an-email',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('POST /api/v1/leads - should successfully create a new lead', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Robert',
          lastName: 'Fox',
          email: `robert.fox.${Date.now()}@example.com`,
          stage: 'New',
          score: 75,
          source: 'Zillow',
          intent: 'Buy',
          budgetMin: 800000,
          budgetMax: 950000,
          preferredLocation: 'Brickell',
          bedrooms: '3 bed',
        });

      expect(res.status).toBe(201);
      expect(res.body.lead).toHaveProperty('id');
      expect(res.body.lead.firstName).toBe('Robert');
      createdLeadId = res.body.lead.id;
    });

    it('GET /api/v1/leads/:id - should return single lead with activities and notes', async () => {
      const res = await request(app).get(`/api/v1/leads/${createdLeadId}`);

      expect(res.status).toBe(200);
      expect(res.body.lead).toHaveProperty('id', createdLeadId);
      expect(res.body.lead).toHaveProperty('activities');
    });

    it('PATCH /api/v1/leads/:id - should update lead stage and details', async () => {
      const res = await request(app)
        .patch(`/api/v1/leads/${createdLeadId}`)
        .send({ stage: 'Qualified', score: 85 });

      expect(res.status).toBe(200);
      expect(res.body.lead.stage).toBe('Qualified');
      expect(res.body.lead.score).toBe(85);
    });

    it('DELETE /api/v1/leads/:id - should delete lead', async () => {
      const res = await request(app)
        .delete(`/api/v1/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      const check = await request(app).get(`/api/v1/leads/${createdLeadId}`);
      expect(check.status).toBe(404);
      createdLeadId = '';
    });
  });

  describe('Supporting Endpoints', () => {
    it('GET /api/v1/dashboard/summary - should return aggregated CRM metrics', async () => {
      const res = await request(app).get('/api/v1/dashboard/summary');

      expect(res.status).toBe(200);
      expect(res.body.summary).toHaveProperty('totalLeads');
      expect(res.body.summary).toHaveProperty('goalPercentage', 78);
      expect(res.body.summary).toHaveProperty('goalAchieved', 186420);
    });

    it('GET /api/v1/agents - should list available agents', async () => {
      const res = await request(app).get('/api/v1/agents');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.agents)).toBe(true);
      expect(res.body.agents.length).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/v1/leads/export/csv - should stream CSV output', async () => {
      const res = await request(app).get('/api/v1/leads/export/csv');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('ID,Name,Email');
    });
  });
});
