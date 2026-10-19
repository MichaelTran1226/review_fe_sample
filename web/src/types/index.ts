export type StageType =
  | 'New'
  | 'Active'
  | 'Qualified'
  | 'Under contract'
  | 'Agreement'
  | 'Contacted'
  | 'Nurture'
  | 'Lost';

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface LeadActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

export interface LeadNoteItem {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

export interface LeadItem {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  avatar?: string;
  stage: StageType;
  score: number;
  source: string;
  temperature?: 'Hot' | 'Warm' | 'Cold' | string;
  intent?: 'Buy' | 'Sell' | 'Rent' | 'Invest' | string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  propertyType?: string | null;
  preferredLocation?: string | null;
  bedrooms?: string | null;
  lookingFor: string;
  assignedAgentId?: string | null;
  assignedAgent?: Agent | null;
  agent?: { name: string; avatar?: string; avatarUrl?: string };
  lastActivity: string;
  lastActivityHighlight?: boolean;
  nextFollowUp?: string | null;
  nextFollowUpHighlight?: boolean;
  createdAt?: string;
  created?: string;
  updatedAt?: string;
  activities?: LeadActivityItem[];
  notes?: LeadNoteItem[];
}

export type TabType = 'Leads' | 'Contacts' | 'My hot leads' | 'Pond' | 'Past clients';

export interface DashboardSummary {
  totalPeople: number;
  totalLeads: number;
  activeLeads: number;
  goalYear: string;
  goalTarget: number;
  goalAchieved: number;
  goalPercentage: number;
  remainingValue: number;
  dealsPending: number;
}
