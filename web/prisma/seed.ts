import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables
  await prisma.leadNote.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const ilias = await prisma.user.create({
    data: {
      id: 'agent-ilias-miah',
      name: 'Ilias Miah',
      email: 'agent@keystone.com',
      passwordHash,
      role: 'AGENT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: 'manager-sarah-jenkins',
      name: 'Sarah Jenkins',
      email: 'manager@keystone.com',
      passwordHash,
      role: 'MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const alex = await prisma.user.create({
    data: {
      id: 'agent-alex-morgan',
      name: 'Alex Morgan',
      email: 'alex@keystone.com',
      passwordHash,
      role: 'AGENT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created 3 users');

  // Exact 17 primary leads matching reference screenshot
  const initialLeads = [
    {
      firstName: 'Sofia',
      lastName: 'Alvarez',
      email: 'sofia.alvarez@gmail.com',
      phone: '+1 305 555 0192',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      stage: 'Active',
      score: 86,
      source: 'Zillow',
      temperature: 'Hot',
      intent: 'Buy',
      budgetMin: 600000,
      budgetMax: 720000,
      propertyType: 'Condo',
      preferredLocation: 'Brickell',
      bedrooms: '2+ bed',
      lookingFor: 'Buy · $600k to $720k · Brickell · 2+ bed',
      lastActivity: new Date(Date.now() - 12 * 60 * 1000), // 12m ago
      nextFollowUp: new Date(Date.now() + 4 * 60 * 60 * 1000), // Today 11:00 AM
      createdAt: new Date('2026-08-14T09:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Omar',
      lastName: 'Haddad',
      email: 'omar.h@outlook.com',
      phone: '+1 305 555 0184',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      stage: 'New',
      score: 61,
      source: 'Zillow',
      temperature: 'Hot',
      intent: 'Buy',
      budgetMin: 550000,
      budgetMax: 700000,
      propertyType: 'Single Family',
      preferredLocation: 'Coconut Grove',
      bedrooms: '3 bed',
      lookingFor: 'Buy · $550k to $700k · Coconut Grove · ...',
      lastActivity: new Date(Date.now() - 3 * 60 * 1000), // Never / recent
      nextFollowUp: new Date(Date.now() + 10 * 60 * 1000), // Now
      createdAt: new Date(Date.now() - 3 * 60 * 1000),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Lauren',
      lastName: 'Mitchell',
      email: '+1 305 555 0147',
      phone: '+1 305 555 0147',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      stage: 'Qualified',
      score: 64,
      source: 'Referral',
      temperature: 'Warm',
      intent: 'Buy',
      budgetMin: 700000,
      budgetMax: 800000,
      propertyType: 'Single Family',
      preferredLocation: 'Coconut Grove',
      bedrooms: '3 bed',
      lookingFor: 'Buy · $700k to $800k · Coconut Grove · ...',
      lastActivity: new Date(Date.now() - 48 * 60 * 1000), // 48m ago
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Sat 10:00 AM
      createdAt: new Date('2026-07-30T10:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Rafael',
      lastName: 'Duarte',
      email: 'rafael@duartecapital.com',
      phone: '+1 305 555 0122',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      stage: 'Under contract',
      score: 91,
      source: 'Referral',
      temperature: 'Hot',
      intent: 'Invest',
      budgetMin: 1000000,
      budgetMax: 1300000,
      propertyType: 'Multi-family',
      preferredLocation: 'Edgewater',
      bedrooms: 'multi f...',
      lookingFor: 'Invest · up to $1.3M · Edgewater · multi f...',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdAt: new Date('2026-05-02T14:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Victor',
      lastName: 'Santos',
      email: 'victor.santos@me.com',
      phone: '+1 305 555 0177',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      stage: 'Active',
      score: 88,
      source: 'Website',
      temperature: 'Hot',
      intent: 'Buy',
      budgetMin: 650000,
      budgetMax: 720000,
      propertyType: 'Condo',
      preferredLocation: 'Brickell',
      bedrooms: '2 bed',
      lookingFor: 'Buy · $650k to $720k · Brickell · 2 bed',
      lastActivity: new Date(),
      nextFollowUp: new Date(Date.now() + 2 * 60 * 60 * 1000), // Today 9:30 AM
      createdAt: new Date('2026-09-03T11:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'James',
      lastName: 'Chen',
      email: 'jchen@gmail.com',
      phone: '+1 305 555 0133',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      stage: 'Agreement',
      score: 58,
      source: 'Sphere',
      temperature: 'Warm',
      intent: 'Sell',
      budgetMin: 1800000,
      budgetMax: 1950000,
      propertyType: 'Single Family',
      preferredLocation: 'Coral Gables',
      bedrooms: '4 bed',
      lookingFor: 'Sell · 1245 Alhambra Cir · est. $1.9M',
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3d ago
      nextFollowUp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue 2d
      createdAt: new Date('2026-09-08T15:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Hannah',
      lastName: 'Berg',
      email: 'hannah.berg@yahoo.com',
      phone: '+1 305 555 0144',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      stage: 'Contacted',
      score: 55,
      source: 'Facebook',
      temperature: 'Warm',
      intent: 'Sell',
      budgetMin: 450000,
      budgetMax: 500000,
      propertyType: 'Condo',
      preferredLocation: 'Midtown',
      bedrooms: '1 bed',
      lookingFor: 'Sell · Midtown condo · est. $480k',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Thu
      createdAt: new Date('2026-09-19T13:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Grace',
      lastName: 'Kim',
      email: 'grace.kim@gmail.com',
      phone: '+1 305 555 0155',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      stage: 'New',
      score: 28,
      source: 'Website',
      temperature: 'Cold',
      intent: 'Sell',
      budgetMin: 400000,
      budgetMax: 450000,
      propertyType: 'Condo',
      preferredLocation: 'Midtown',
      bedrooms: '2 bed',
      lookingFor: 'Sell · 2 bed Midtown · spring',
      lastActivity: new Date(Date.now() - 41 * 60 * 1000), // Never
      nextFollowUp: new Date(Date.now() + 15 * 60 * 1000), // Now
      createdAt: new Date(Date.now() - 41 * 60 * 1000), // 41m ago
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Nina',
      lastName: 'Petrova',
      email: 'nina.p@gmail.com',
      phone: '+1 305 555 0166',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      stage: 'Qualified',
      score: 34,
      source: 'Instagram',
      temperature: 'Warm',
      intent: 'Rent',
      budgetMin: 3000,
      budgetMax: 3600,
      propertyType: 'Loft',
      preferredLocation: 'Wynwood',
      bedrooms: 'loft',
      lookingFor: 'Rent · $3k to $3.6k/mo · Wynwood · loft',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      nextFollowUp: new Date(Date.now() + 5 * 60 * 60 * 1000), // Today 4:00 PM
      createdAt: new Date('2026-09-21T12:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Derek',
      lastName: 'Walsh',
      email: 'dwalsh@company.com',
      phone: '+1 305 555 0188',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      stage: 'Contacted',
      score: 49,
      source: 'Google',
      temperature: 'Warm',
      intent: 'Buy',
      budgetMin: 400000,
      budgetMax: 480000,
      propertyType: 'Single Family',
      preferredLocation: 'Doral',
      bedrooms: '3 bed',
      lookingFor: 'Buy · $400k to $480k · Doral · 3 bed',
      lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5d ago
      nextFollowUp: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Mon
      createdAt: new Date('2026-09-12T16:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Maria',
      lastName: 'Castillo',
      email: 'maria.castillo@gmail.com',
      phone: '+1 305 555 0199',
      avatarUrl: 'https://images.unsplash.com/photo-1557296387-5358ad7997bb?w=150&auto=format&fit=crop&q=80',
      stage: 'Nurture',
      score: 22,
      source: 'Open house',
      temperature: 'Cold',
      intent: 'Buy',
      budgetMin: 350000,
      budgetMax: 420000,
      propertyType: 'Condo',
      preferredLocation: 'Kendall',
      bedrooms: '2 bed',
      lookingFor: 'Buy · $350k to $420k · Kendall · 2 bed',
      lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2w ago
      nextFollowUp: new Date('2026-11-15T10:00:00Z'), // Nov 15
      createdAt: new Date('2026-06-06T11:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Andre',
      lastName: 'Kouyate',
      email: 'andre.k@gmail.com',
      phone: '+1 305 555 0200',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      stage: 'Active',
      score: 67,
      source: 'Realtor.com',
      temperature: 'Hot',
      intent: 'Buy',
      budgetMin: 900000,
      budgetMax: 1100000,
      propertyType: 'Single Family',
      preferredLocation: 'Key Biscayne',
      bedrooms: '3...',
      lookingFor: 'Buy · $900k to $1.1M · Key Biscayne · 3...',
      lastActivity: new Date(),
      nextFollowUp: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Fri 3:00 PM
      createdAt: new Date('2026-08-27T08:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Priya',
      lastName: 'Lal',
      email: 'priya.lal@gmail.com',
      phone: '+1 305 555 0211',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      stage: 'Qualified',
      score: 60,
      source: 'Referral',
      temperature: 'Warm',
      intent: 'Buy',
      budgetMin: 520000,
      budgetMax: 600000,
      propertyType: 'Condo',
      preferredLocation: 'Coral Gables',
      bedrooms: '2...',
      lookingFor: 'Buy · $520k to $600k · Coral Gables · 2...',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago
      nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Wed
      createdAt: new Date('2026-09-15T14:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Tomas',
      lastName: 'Bauer',
      email: 't.bauer@web.de',
      phone: '+1 305 555 0222',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      stage: 'Lost',
      score: 12,
      source: 'Zillow',
      temperature: 'Cold',
      intent: 'Buy',
      budgetMin: 300000,
      budgetMax: 350000,
      propertyType: 'Single Family',
      preferredLocation: 'Hialeah',
      bedrooms: '2 bed',
      lookingFor: 'Buy · $300k to $350k · Hialeah',
      lastActivity: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3w ago
      nextFollowUp: null,
      createdAt: new Date('2026-07-02T13:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Carla',
      lastName: 'Mendes',
      email: 'carla.mendes@gmail.com',
      phone: '+1 305 555 0233',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      stage: 'Contacted',
      score: 52,
      source: 'Zillow',
      temperature: 'Warm',
      intent: 'Buy',
      budgetMin: 450000,
      budgetMax: 520000,
      propertyType: 'Single Family',
      preferredLocation: 'Doral',
      bedrooms: '3 bed',
      lookingFor: 'Buy · $450k to $520k · Doral · 3 bed',
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2d ago
      nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdAt: new Date('2026-09-24T10:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Yusuf',
      lastName: 'Rahman',
      email: 'yusuf.r@gmail.com',
      phone: '+1 305 555 0244',
      avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
      stage: 'Qualified',
      score: 57,
      source: 'Website',
      temperature: 'Warm',
      intent: 'Rent',
      budgetMin: 2400,
      budgetMax: 2800,
      propertyType: 'Loft',
      preferredLocation: 'Wynwood',
      bedrooms: '1...',
      lookingFor: 'Rent · $2.4k to $2.8k/mo · Wynwood · 1...',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Thu 6:00 PM
      createdAt: new Date('2026-09-20T17:00:00Z'),
      assignedAgentId: ilias.id,
    },
    {
      firstName: 'Kevin',
      lastName: 'Park',
      email: 'kevin.park@icloud.com',
      phone: '+1 305 555 0255',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      stage: 'Active',
      score: 79,
      source: 'Realtor.com',
      temperature: 'Hot',
      intent: 'Buy',
      budgetMin: 1100000,
      budgetMax: 1300000,
      propertyType: 'Single Family',
      preferredLocation: 'Key Biscayne',
      bedrooms: '3 b...',
      lookingFor: 'Buy · $1.1M to $1.3M · Key Biscayne · 3 b...',
      lastActivity: new Date(),
      nextFollowUp: new Date(Date.now() + 6 * 60 * 60 * 1000), // Today 5:30 PM
      createdAt: new Date('2026-08-30T15:00:00Z'),
      assignedAgentId: ilias.id,
    },
  ];

  // Insert primary leads
  for (const lead of initialLeads) {
    const created = await prisma.lead.create({ data: lead });
    // Add sample activity
    await prisma.leadActivity.create({
      data: {
        leadId: created.id,
        userId: ilias.id,
        type: 'NOTE',
        title: 'Initial Inquiry Received',
        description: `Lead inquired regarding ${created.lookingFor}`,
      },
    });
    // Add sample note
    await prisma.leadNote.create({
      data: {
        leadId: created.id,
        authorId: ilias.id,
        content: `Followed up with ${created.firstName}. They are pre-approved and motivated.`,
      },
    });
  }

  // Generate 48 additional diverse realistic leads to total 65 leads (satisfies > 60 requirement)
  const additionalNames = [
    ['Lucas', 'Vance', 'Zillow', 'Active', 'Buy', 750000, 900000, 'Brickell', '2 bed'],
    ['Elena', 'Rostova', 'Website', 'Qualified', 'Buy', 620000, 750000, 'Edgewater', '2 bed'],
    ['Marcus', 'Sterling', 'Referral', 'Under contract', 'Buy', 1400000, 1800000, 'Coconut Grove', '4 bed'],
    ['Chloe', 'Dupont', 'Instagram', 'New', 'Rent', 3200, 4000, 'South Beach', '1 bed'],
    ['Samuel', 'Okafor', 'Google', 'Contacted', 'Buy', 480000, 550000, 'Doral', '3 bed'],
    ['Isabella', 'Rossi', 'Sphere', 'Agreement', 'Sell', 950000, 1100000, 'Coral Gables', '3 bed'],
    ['Julian', 'Morales', 'Realtor.com', 'Active', 'Buy', 820000, 950000, 'Brickell', '2+ bed'],
    ['Maya', 'Lin', 'Open house', 'Nurture', 'Buy', 390000, 460000, 'Kendall', '2 bed'],
    ['Devon', 'Brooks', 'Zillow', 'Contacted', 'Buy', 520000, 600000, 'Midtown', '2 bed'],
    ['Aria', 'Montgomery', 'Website', 'Qualified', 'Rent', 2800, 3500, 'Wynwood', 'Loft'],
    ['Mateo', 'Silva', 'Referral', 'Active', 'Buy', 1200000, 1500000, 'Key Biscayne', '3 bed'],
    ['Camila', 'Rios', 'Facebook', 'Lost', 'Buy', 320000, 380000, 'Hialeah', '2 bed'],
    ['Noah', 'Bennett', 'Zillow', 'New', 'Buy', 600000, 700000, 'Brickell', '1+ bed'],
    ['Harper', 'Quinn', 'Google', 'Contacted', 'Sell', 780000, 850000, 'Midtown', '2 bed'],
    ['Ethan', 'Hunt', 'Sphere', 'Under contract', 'Invest', 1600000, 2000000, 'Edgewater', 'Multi-family'],
    ['Zoe', 'Kravitz', 'Instagram', 'Active', 'Rent', 4500, 5500, 'South Beach', '2 bed'],
    ['Liam', 'Gallagher', 'Realtor.com', 'Qualified', 'Buy', 530000, 610000, 'Doral', '3 bed'],
    ['Mia', 'Thornton', 'Website', 'Nurture', 'Buy', 410000, 480000, 'Kendall', '2 bed'],
    ['Gabriel', 'Santos', 'Zillow', 'Active', 'Buy', 890000, 1050000, 'Coconut Grove', '3 bed'],
    ['Olivia', 'Wilde', 'Referral', 'Agreement', 'Sell', 1300000, 1450000, 'Coral Gables', '4 bed'],
    ['Austin', 'Mahone', 'Google', 'Contacted', 'Buy', 470000, 530000, 'Midtown', '1 bed'],
    ['Penelope', 'Cruz', 'Facebook', 'New', 'Buy', 650000, 720000, 'Edgewater', '2 bed'],
    ['Sebastian', 'Stan', 'Open house', 'Qualified', 'Buy', 710000, 800000, 'Brickell', '2 bed'],
    ['Amara', 'Diallo', 'Website', 'Active', 'Rent', 3100, 3700, 'Wynwood', '1 bed'],
    ['Xavier', 'Knight', 'Zillow', 'Under contract', 'Buy', 1500000, 1800000, 'Key Biscayne', '4 bed'],
    ['Sienna', 'Miller', 'Realtor.com', 'Nurture', 'Buy', 360000, 420000, 'Hialeah', '2 bed'],
    ['Christian', 'Bale', 'Referral', 'Active', 'Invest', 2100000, 2600000, 'Brickell', 'Penthouse'],
    ['Gia', 'Carangi', 'Instagram', 'Contacted', 'Rent', 3800, 4400, 'South Beach', '1 bed'],
    ['Dante', 'Alighieri', 'Sphere', 'Qualified', 'Sell', 890000, 960000, 'Coral Gables', '3 bed'],
    ['Freya', 'Allan', 'Google', 'New', 'Buy', 540000, 620000, 'Doral', '2 bed'],
    ['Ezra', 'Miller', 'Website', 'Lost', 'Buy', 290000, 340000, 'Kendall', '1 bed'],
    ['Seraphina', 'Picard', 'Zillow', 'Active', 'Buy', 980000, 1150000, 'Coconut Grove', '3 bed'],
    ['Dominic', 'Toretto', 'Facebook', 'Contacted', 'Buy', 490000, 560000, 'Hialeah', '3 bed'],
    ['Natasha', 'Romanoff', 'Referral', 'Qualified', 'Buy', 1250000, 1400000, 'Edgewater', '3 bed'],
    ['Bruce', 'Wayne', 'Sphere', 'Under contract', 'Invest', 3500000, 4500000, 'Star Island', 'Estate'],
    ['Diana', 'Prince', 'Realtor.com', 'Active', 'Buy', 1100000, 1300000, 'Brickell', '3 bed'],
    ['Barry', 'Allen', 'Google', 'New', 'Rent', 2600, 3100, 'Wynwood', 'Studio'],
    ['Hal', 'Jordan', 'Website', 'Contacted', 'Buy', 620000, 710000, 'Doral', '2 bed'],
    ['Arthur', 'Curry', 'Open house', 'Nurture', 'Buy', 800000, 950000, 'Key Biscayne', 'Waterfront'],
    ['Victor', 'Stone', 'Zillow', 'Qualified', 'Buy', 670000, 760000, 'Midtown', '2 bed'],
    ['Clark', 'Kent', 'Referral', 'Agreement', 'Buy', 580000, 650000, 'Kendall', '3 bed'],
    ['Selina', 'Kyle', 'Instagram', 'Active', 'Rent', 4200, 5000, 'Brickell', 'Penthouse'],
    ['Harleen', 'Quinzel', 'Facebook', 'Contacted', 'Rent', 2900, 3400, 'Wynwood', 'Loft'],
    ['Pamela', 'Isley', 'Website', 'Nurture', 'Buy', 750000, 880000, 'Coconut Grove', 'Garden home'],
    ['Jonathan', 'Crane', 'Google', 'Lost', 'Buy', 310000, 360000, 'Hialeah', '2 bed'],
    ['Edward', 'Nygma', 'Sphere', 'Qualified', 'Buy', 830000, 940000, 'Coral Gables', '3 bed'],
    ['Harvey', 'Dent', 'Realtor.com', 'Active', 'Sell', 1450000, 1600000, 'Edgewater', '4 bed'],
    ['Oswald', 'Cobblepot', 'Referral', 'Under contract', 'Invest', 2800000, 3400000, 'Brickell', 'Commercial'],
  ];

  const agentIds = [ilias.id, sarah.id, alex.id];

  for (let i = 0; i < additionalNames.length; i++) {
    const [fn, ln, src, stg, intnt, bmin, bmax, loc, beds] = additionalNames[i];
    const scoreVal = Math.floor(Math.random() * 80) + 15;
    const agentId = agentIds[i % agentIds.length];
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const hoursAgo = Math.floor(Math.random() * 24);

    const createdLead = await prisma.lead.create({
      data: {
        firstName: fn as string,
        lastName: ln as string,
        email: `${(fn as string).toLowerCase()}.${(ln as string).toLowerCase()}@example.com`,
        phone: `+1 305 555 ${String(300 + i).padStart(4, '0')}`,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=150&auto=format&fit=crop&q=80`,
        stage: stg as string,
        score: scoreVal,
        source: src as string,
        temperature: scoreVal > 70 ? 'Hot' : scoreVal > 40 ? 'Warm' : 'Cold',
        intent: intnt as string,
        budgetMin: bmin as number,
        budgetMax: bmax as number,
        propertyType: beds === 'Loft' ? 'Loft' : 'Condo',
        preferredLocation: loc as string,
        bedrooms: beds as string,
        lookingFor: `${intnt} · $${Math.round((bmin as number) / 1000)}k to $${Math.round((bmax as number) / 1000)}k · ${loc} · ${beds}`,
        lastActivity: new Date(Date.now() - (hoursAgo * 60 + 10) * 60 * 1000),
        nextFollowUp: new Date(Date.now() + (i % 5 + 1) * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        assignedAgentId: agentId,
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: createdLead.id,
        userId: agentId,
        type: 'STAGE_CHANGE',
        title: `Stage updated to ${stg}`,
        description: `Lead status transitioned to ${stg} stage`,
      },
    });
  }

  // Create default saved view
  await prisma.savedView.create({
    data: {
      name: 'All Active Leads',
      userId: ilias.id,
      filtersJson: JSON.stringify({ stage: 'Active' }),
      isDefault: true,
    },
  });

  const totalLeads = await prisma.lead.count();
  console.log(`🎉 Seed finished successfully! Total leads in database: ${totalLeads}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
