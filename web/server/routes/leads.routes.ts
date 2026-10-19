import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  createLeadSchema,
  updateLeadSchema,
  queryLeadsSchema,
  bulkUpdateLeadsSchema,
} from '../schemas/lead.schema';
import { optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();

// 1. GET /api/v1/leads - List leads with filters, pagination, sorting
router.get('/', optionalAuth, async (req: Request, res: Response, next) => {
  try {
    const q = queryLeadsSchema.parse(req.query);

    // Build Prisma where conditions
    const where: any = {};

    // Search query: matches firstName, lastName, email, phone, lookingFor
    if (q.search && q.search.trim()) {
      const term = q.search.trim();
      where.OR = [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
        { lookingFor: { contains: term } },
        { preferredLocation: { contains: term } },
      ];
    }

    // Tab filter
    if (q.tab) {
      if (q.tab === 'Contacts') {
        where.stage = { in: ['Active', 'Qualified', 'Agreement', 'Under contract'] };
      } else if (q.tab === 'My hot leads') {
        where.temperature = 'Hot';
      } else if (q.tab === 'Pond') {
        where.assignedAgentId = null;
      } else if (q.tab === 'Past clients') {
        where.stage = 'Agreement';
      }
    }

    // Explicit Stage filter
    if (q.stage && q.stage !== 'All') {
      where.stage = q.stage;
    }

    // Source filter
    if (q.source && q.source !== 'All') {
      where.source = q.source;
    }

    // Owner filter
    if (q.ownerId) {
      where.assignedAgentId = q.ownerId;
    }

    // Temperature filter
    if (q.temperature) {
      where.temperature = q.temperature;
    }

    // Budget range
    if (q.budgetMin !== undefined || q.budgetMax !== undefined) {
      where.budgetMax = {};
      if (q.budgetMin !== undefined) where.budgetMax.gte = q.budgetMin;
      if (q.budgetMax !== undefined) where.budgetMax.lte = q.budgetMax;
    }

    // Sorting
    let orderBy: any = {};
    if (q.sortBy === 'score') {
      orderBy = { score: q.sortOrder };
    } else if (q.sortBy === 'name') {
      orderBy = { firstName: q.sortOrder };
    } else if (q.sortBy === 'createdAt') {
      orderBy = { createdAt: q.sortOrder };
    } else if (q.sortBy === 'nextFollowUp') {
      orderBy = { nextFollowUp: q.sortOrder };
    } else {
      orderBy = { lastActivity: q.sortOrder };
    }

    const total = await prisma.lead.count({ where });
    const leads = await prisma.lead.findMany({
      where,
      orderBy,
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.json({
      data: leads,
      meta: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// 2. GET /api/v1/leads/export/csv - CSV Export
router.get('/export/csv', async (req: Request, res: Response, next) => {
  try {
    const q = queryLeadsSchema.parse(req.query);

    const where: any = {};
    if (q.search && q.search.trim()) {
      const term = q.search.trim();
      where.OR = [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
      ];
    }
    if (q.stage && q.stage !== 'All') where.stage = q.stage;
    if (q.source && q.source !== 'All') where.source = q.source;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { lastActivity: 'desc' },
      include: { assignedAgent: true },
    });

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Stage',
      'Score',
      'Source',
      'Looking For',
      'Agent',
      'Last Activity',
      'Next Follow-up',
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.firstName} ${l.lastName}"`,
      `"${l.email}"`,
      `"${l.phone || ''}"`,
      `"${l.stage}"`,
      l.score,
      `"${l.source}"`,
      `"${(l.lookingFor || '').replace(/"/g, '""')}"`,
      `"${l.assignedAgent?.name || 'Unassigned'}"`,
      `"${l.lastActivity.toISOString()}"`,
      `"${l.nextFollowUp ? l.nextFollowUp.toISOString() : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="keystone_leads.csv"');
    return res.send(csvContent);
  } catch (err) {
    return next(err);
  }
});

// 3. GET /api/v1/leads/:id - Get single lead detail
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.json({ lead });
  } catch (err) {
    return next(err);
  }
});

// 4. POST /api/v1/leads - Create new lead
router.post('/', optionalAuth, async (req: Request, res: Response, next) => {
  try {
    const data = createLeadSchema.parse(req.body);

    const lookingFor =
      data.lookingFor ||
      `${data.intent} · $${Math.round((data.budgetMin || 400000) / 1000)}k to $${Math.round(
        (data.budgetMax || 600000) / 1000
      )}k · ${data.preferredLocation || 'Miami'} · ${data.bedrooms || '2 bed'}`;

    const newLead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        stage: data.stage,
        score: data.score,
        source: data.source,
        temperature: data.temperature,
        intent: data.intent,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        propertyType: data.propertyType,
        preferredLocation: data.preferredLocation,
        bedrooms: data.bedrooms,
        lookingFor,
        assignedAgentId: data.assignedAgentId,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      },
      include: {
        assignedAgent: true,
      },
    });

    // Record initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: newLead.id,
        userId: req.user?.id || newLead.assignedAgentId,
        type: 'NOTE',
        title: 'Lead Created',
        description: `New lead created via Keystone CRM by ${req.user?.name || 'System'}`,
      },
    });

    return res.status(201).json({ lead: newLead });
  } catch (err) {
    return next(err);
  }
});

// 5. PATCH /api/v1/leads/:id - Update lead
router.patch('/:id', optionalAuth, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const data = updateLeadSchema.parse(req.body);

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const updateData: any = { ...data };
    if (data.nextFollowUp !== undefined) {
      updateData.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : null;
    }
    updateData.lastActivity = new Date();

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedAgent: true,
      },
    });

    // If stage changed, record stage activity
    if (data.stage && data.stage !== existing.stage) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          userId: req.user?.id,
          type: 'STAGE_CHANGE',
          title: `Stage changed to ${data.stage}`,
          description: `Stage moved from ${existing.stage} to ${data.stage}`,
        },
      });
    }

    return res.json({ lead: updated });
  } catch (err) {
    return next(err);
  }
});

// 6. DELETE /api/v1/leads/:id - Delete lead
router.delete('/:id', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await prisma.lead.delete({ where: { id } });

    return res.json({ message: 'Lead deleted successfully', id });
  } catch (err) {
    return next(err);
  }
});

// 7. PATCH /api/v1/leads/bulk - Bulk update/delete
router.patch('/bulk', optionalAuth, async (req: Request, res: Response, next) => {
  try {
    const { leadIds, action, stage, agentId } = bulkUpdateLeadsSchema.parse(req.body);

    if (action === 'delete') {
      await prisma.lead.deleteMany({
        where: { id: { in: leadIds } },
      });
      return res.json({ message: `Deleted ${leadIds.length} leads` });
    }

    if (action === 'change_stage' && stage) {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { stage, lastActivity: new Date() },
      });
      return res.json({ message: `Updated stage for ${leadIds.length} leads to ${stage}` });
    }

    if (action === 'assign_agent' && agentId) {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { assignedAgentId: agentId, lastActivity: new Date() },
      });
      return res.json({ message: `Assigned ${leadIds.length} leads to agent` });
    }

    return res.status(400).json({ error: 'Invalid bulk action configuration' });
  } catch (err) {
    return next(err);
  }
});

export default router;
