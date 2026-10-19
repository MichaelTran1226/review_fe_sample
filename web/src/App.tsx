import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LeadsTable } from './components/LeadsTable';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { AddLeadModal } from './components/AddLeadModal';
import { api } from './services/api';
import type { TabType, LeadItem } from './types';
import { Maximize2, Minimize2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

function KeystoneCRMApp() {
  const qc = useQueryClient();

  // Navigation & View state
  const [activeNav, setActiveNav] = useState<string>('People');
  const [currentTab, setCurrentTab] = useState<TabType>('Leads');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTemperature, setSelectedTemperature] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 17;

  // UI Modals & Drawers
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFloatingFrame, setIsFloatingFrame] = useState<boolean>(true);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    stage: true,
    score: true,
    source: true,
    lookingFor: true,
    agent: true,
    lastActivity: true,
    nextFollowUp: true,
    created: true,
  });

  // Query: Dashboard Summary
  const { data: summaryData } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => api.getDashboardSummary(),
  });

  // Query: User Session (Demo account auto-loaded)
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await api.getMe();
        return res.user;
      } catch {
        // Auto-login demo agent
        try {
          const loginRes = await api.login('agent@keystone.com', 'password123');
          return loginRes.user;
        } catch {
          return {
            name: 'Ilias Miah',
            email: 'agent@keystone.com',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          };
        }
      }
    },
  });

  // Query: Leads List
  const {
    data: leadsData,
    isLoading: isLeadsLoading,
    isError: isLeadsError,
    refetch: refetchLeads,
  } = useQuery({
    queryKey: [
      'leads',
      currentPage,
      pageSize,
      searchQuery,
      selectedStage,
      selectedSource,
      selectedTemperature,
      currentTab,
      sortOrder,
    ],
    queryFn: () =>
      api.getLeads({
        page: currentPage,
        pageSize,
        search: searchQuery,
        stage: selectedStage || undefined,
        source: selectedSource || undefined,
        temperature: selectedTemperature || undefined,
        tab: currentTab,
        sortBy: 'lastActivity',
        sortOrder,
      }),
  });

  // Mutations
  const createLeadMutation = useMutation({
    mutationFn: (newLead: Partial<LeadItem>) => api.createLead(newLead),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LeadItem> }) =>
      api.updateLead(id, updates),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboardSummary'] });
      if (selectedLead && data.lead) {
        setSelectedLead(data.lead);
      }
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsDetailOpen(false);
      setSelectedLead(null);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({
      leadIds,
      action,
      stage,
    }: {
      leadIds: string[];
      action: 'change_stage' | 'delete';
      stage?: string;
    }) => api.bulkAction(leadIds, action, stage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Event handlers
  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleStageSelect = (stage: string | null) => {
    setSelectedStage(stage);
    setCurrentPage(1);
  };

  const handleSourceSelect = (source: string | null) => {
    setSelectedSource(source);
    setCurrentPage(1);
  };

  const handleTemperatureSelect = (temp: string | null) => {
    setSelectedTemperature(temp);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStage(null);
    setSelectedSource(null);
    setSelectedTemperature(null);
    setCurrentPage(1);
  };

  const handleLeadClick = async (lead: LeadItem) => {
    try {
      const full = await api.getLead(lead.id);
      setSelectedLead(full.lead);
    } catch {
      setSelectedLead(lead);
    }
    setIsDetailOpen(true);
  };

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl({
      search: searchQuery,
      stage: selectedStage || undefined,
      source: selectedSource || undefined,
    });
    window.open(url, '_blank');
  };

  const handleSaveView = async () => {
    const viewName = window.prompt('Enter a name for this saved view:', `${currentTab} - Custom Filter`);
    if (!viewName) return;
    try {
      await api.createSavedView(viewName, {
        tab: currentTab,
        stage: selectedStage,
        source: selectedSource,
      });
      alert(`View "${viewName}" saved successfully!`);
    } catch (err: any) {
      alert(`Failed to save view: ${err.message}`);
    }
  };

  const handleToggleColumn = (colKey: string) => {
    setVisibleColumns((prev: any) => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  const handleLogout = async () => {
    await api.logout();
    window.location.reload();
  };

  const leads = leadsData?.data || [];
  const totalLeadsCount = leadsData?.meta.total || 0;
  const totalPages = leadsData?.meta.totalPages || 1;

  return (
    <div
      className={`min-h-screen bg-[#111215] flex flex-col items-center justify-center ${
        isFloatingFrame ? 'p-3 md:p-6 lg:p-8' : 'p-0'
      }`}
    >
      {/* Floating Toggle Controls Bar */}
      <header className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 rounded-full px-3 py-1.5 shadow-lg text-xs text-neutral-300">
        <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">Frame Mode:</span>
        <button
          onClick={() => setIsFloatingFrame(!isFloatingFrame)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-all"
          title={isFloatingFrame ? 'Switch to Fullscreen View' : 'Switch to Floating Frame View (Mockup style)'}
        >
          {isFloatingFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Floating Mockup</span>
            </>
          )}
        </button>
      </header>

      {/* Main Application Container */}
      <main
        className={`w-full bg-white flex overflow-hidden shadow-2xl transition-all duration-300 ${
          isFloatingFrame
            ? 'max-w-[1380px] h-[92vh] max-h-[960px] rounded-[24px] md:rounded-[28px] border border-neutral-200/90 ring-1 ring-black/5'
            : 'h-screen rounded-none border-none'
        }`}
      >
        {/* Left Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onNavSelect={(nav) => setActiveNav(nav)}
          isOpen={isSidebarMobileOpen}
          onClose={() => setIsSidebarMobileOpen(false)}
          summary={summaryData?.summary}
          currentUser={userData}
          onLogout={handleLogout}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {/* Topbar: 3-level header with search, filters, columns, export and actions */}
          <Topbar
            currentTab={currentTab}
            onTabChange={handleTabChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedStage={selectedStage}
            onStageSelect={handleStageSelect}
            selectedSource={selectedSource}
            onSourceSelect={handleSourceSelect}
            selectedTemperature={selectedTemperature}
            onTemperatureSelect={handleTemperatureSelect}
            sortOrder={sortOrder}
            onToggleSort={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
            onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
            onAddLeadModalOpen={() => setIsAddModalOpen(true)}
            summary={summaryData?.summary}
            onExportCsv={handleExportCsv}
            onSaveView={handleSaveView}
            visibleColumns={visibleColumns}
            onToggleColumn={handleToggleColumn}
            onClearFilters={handleClearFilters}
          />

          {/* Leads Data Table with live backend data */}
          <LeadsTable
            leads={leads}
            totalLeadsCount={totalLeadsCount}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            isLoading={isLeadsLoading}
            isError={isLeadsError}
            onRetry={() => refetchLeads()}
            onLeadClick={handleLeadClick}
            onBulkStageChange={async (ids, stage) => {
              await bulkActionMutation.mutateAsync({ leadIds: ids, action: 'change_stage', stage });
            }}
            onBulkDelete={async (ids) => {
              await bulkActionMutation.mutateAsync({ leadIds: ids, action: 'delete' });
            }}
            visibleColumns={visibleColumns}
          />
        </div>
      </main>

      {/* Lead Detail Slide-over Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateLead={async (id, updates) => {
          await updateLeadMutation.mutateAsync({ id, updates });
        }}
        onDeleteLead={async (id) => {
          await deleteLeadMutation.mutateAsync(id);
        }}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={async (newLead) => {
          await createLeadMutation.mutateAsync(newLead);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeystoneCRMApp />
    </QueryClientProvider>
  );
}

export default App;
