import { z } from 'zod';

export const leadStages = [
  'New',
  'Active',
  'Qualified',
  'Under contract',
  'Agreement',
  'Contacted',
  'Nurture',
  'Lost',
] as const;

export const leadSources = [
  'Zillow',
  'Referral',
  'Website',
  'Sphere',
  'Facebook',
  'Instagram',
  'Google',
  'Realtor.com',
  'Open house',
] as const;

export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  stage: z.enum(leadStages).default('New'),
  score: z.number().int().min(0).max(100).default(50),
  source: z.string().default('Website'),
  temperature: z.enum(['Hot', 'Warm', 'Cold']).default('Warm'),
  intent: z.enum(['Buy', 'Sell', 'Rent', 'Invest']).default('Buy'),
  budgetMin: z.number().nonnegative().optional().nullable(),
  budgetMax: z.number().nonnegative().optional().nullable(),
  propertyType: z.string().optional().nullable(),
  preferredLocation: z.string().optional().nullable(),
  bedrooms: z.string().optional().nullable(),
  lookingFor: z.string().optional(),
  assignedAgentId: z.string().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const queryLeadsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(17),
  search: z.string().optional(),
  stage: z.string().optional(),
  source: z.string().optional(),
  ownerId: z.string().optional(),
  temperature: z.string().optional(),
  tab: z.string().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  sortBy: z.enum(['lastActivity', 'score', 'createdAt', 'name', 'nextFollowUp']).default('lastActivity'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const bulkUpdateLeadsSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1, 'At least one lead ID is required'),
  action: z.enum(['change_stage', 'delete', 'assign_agent']),
  stage: z.enum(leadStages).optional(),
  agentId: z.string().optional(),
});
