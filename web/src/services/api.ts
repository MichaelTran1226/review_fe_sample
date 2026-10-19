import type { LeadItem, DashboardSummary, Agent } from '../types';

const API_BASE = '/api/v1';

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.error || errorJson.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export interface GetLeadsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stage?: string;
  source?: string;
  ownerId?: string;
  temperature?: string;
  tab?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetLeadsResponse {
  data: LeadItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const api = {
  // Leads
  getLeads: (params: GetLeadsParams) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.search) searchParams.set('search', params.search);
    if (params.stage && params.stage !== 'All') searchParams.set('stage', params.stage);
    if (params.source && params.source !== 'All') searchParams.set('source', params.source);
    if (params.ownerId) searchParams.set('ownerId', params.ownerId);
    if (params.temperature) searchParams.set('temperature', params.temperature);
    if (params.tab) searchParams.set('tab', params.tab);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    return fetchApi<GetLeadsResponse>(`/leads?${searchParams.toString()}`);
  },

  getLead: (id: string) => fetchApi<{ lead: LeadItem }>(`/leads/${id}`),

  createLead: (lead: Partial<LeadItem>) =>
    fetchApi<{ lead: LeadItem }>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),

  updateLead: (id: string, lead: Partial<LeadItem>) =>
    fetchApi<{ lead: LeadItem }>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lead),
    }),

  deleteLead: (id: string) =>
    fetchApi<{ message: string; id: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),

  bulkAction: (leadIds: string[], action: 'change_stage' | 'delete', stage?: string) =>
    fetchApi<{ message: string }>('/leads/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ leadIds, action, stage }),
    }),

  getExportCsvUrl: (params: GetLeadsParams) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.stage && params.stage !== 'All') searchParams.set('stage', params.stage);
    if (params.source && params.source !== 'All') searchParams.set('source', params.source);
    return `${API_BASE}/leads/export/csv?${searchParams.toString()}`;
  },

  // Supporting
  getDashboardSummary: () =>
    fetchApi<{ summary: DashboardSummary }>('/dashboard/summary'),

  getAgents: () => fetchApi<{ agents: Agent[] }>('/agents'),

  addLeadNote: (leadId: string, content: string) =>
    fetchApi<{ activity: any }>('/activities', {
      method: 'POST',
      body: JSON.stringify({
        leadId,
        title: 'Note Added',
        description: content,
        type: 'NOTE',
      }),
    }),

  getSavedViews: () => fetchApi<{ views: any[] }>('/saved-views'),

  createSavedView: (name: string, filters: any) =>
    fetchApi<{ view: any }>('/saved-views', {
      method: 'POST',
      body: JSON.stringify({ name, filters }),
    }),

  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => fetchApi<{ message: string }>('/auth/logout', { method: 'POST' }),

  getMe: () => fetchApi<{ user: any }>('/auth/me'),
};
