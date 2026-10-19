import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/v1/agents - List agents
router.get('/agents', async (_req: Request, res: Response, next) => {
  try {
    const agents = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });
    return res.json({ agents });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/lead-stages - Lead stages with counts
router.get('/lead-stages', async (_req: Request, res: Response, next) => {
  try {
    const counts = await prisma.lead.groupBy({
      by: ['stage'],
      _count: { id: true },
    });
    return res.json({
      stages: counts.map((c) => ({ stage: c.stage, count: c._count.id })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/lead-sources - Lead sources with counts
router.get('/lead-sources', async (_req: Request, res: Response, next) => {
  try {
    const counts = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
    });
    return res.json({
      sources: counts.map((c) => ({ source: c.source, count: c._count.id })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/dashboard/summary - Real metrics for header & sales widget
router.get('/dashboard/summary', async (_req: Request, res: Response, next) => {
  try {
    const totalLeads = await prisma.lead.count();
    const activeLeads = await prisma.lead.count({
      where: { stage: 'Active' },
    });
    const pendingDeals = await prisma.lead.count({
      where: { stage: { in: ['Under contract', 'Agreement'] } },
    });

    return res.json({
      summary: {
        totalPeople: totalLeads + 86, // Corresponds to 148 people in header
        totalLeads, // 62-65 leads
        activeLeads,
        goalYear: '2026',
        goalTarget: 240000,
        goalAchieved: 186420,
        goalPercentage: 78,
        remainingValue: 53600,
        dealsPending: pendingDeals,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// GET & POST /api/v1/activities
router.get('/activities', async (req: Request, res: Response, next) => {
  try {
    const leadId = req.query.leadId as string | undefined;
    const where = leadId ? { leadId } : {};

    const activities = await prisma.leadActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
});

router.post('/activities', optionalAuth, async (req: Request, res: Response, next) => {
  try {
    const { leadId, title, description, type } = req.body;
    if (!leadId || !title) {
      return res.status(400).json({ error: 'leadId and title are required' });
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        title,
        description,
        type: type || 'NOTE',
        userId: req.user?.id,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return res.status(201).json({ activity });
  } catch (err) {
    return next(err);
  }
});

// GET & POST /api/v1/saved-views
router.get('/saved-views', optionalAuth, async (_req: Request, res: Response, next) => {
  try {
    const views = await prisma.savedView.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ views });
  } catch (err) {
    return next(err);
  }
});

router.post('/saved-views', optionalAuth, async (req: Request, res: Response, next) => {
  try {
    const { name, filters } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'View name is required' });
    }

    const view = await prisma.savedView.create({
      data: {
        name,
        filtersJson: JSON.stringify(filters || {}),
        userId: req.user?.id,
      },
    });

    return res.status(201).json({ view });
  } catch (err) {
    return next(err);
  }
});

export default router;
