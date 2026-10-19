import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Bell,
  HelpCircle,
  Search,
  ChevronDown,
  ArrowUpDown,
  Columns3,
  Download,
  Menu,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import type { TabType, StageType, DashboardSummary } from '../types';

interface TopbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage: string | null;
  onStageSelect: (stage: string | null) => void;
  selectedSource: string | null;
  onSourceSelect: (source: string | null) => void;
  selectedTemperature: string | null;
  onTemperatureSelect: (temp: string | null) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
  onToggleSidebarMobile: () => void;
  onAddLeadModalOpen: () => void;
  summary?: DashboardSummary | null;
  onExportCsv: () => void;
  onSaveView: () => void;
  visibleColumns: {
    stage: boolean;
    score: boolean;
    source: boolean;
    lookingFor: boolean;
    agent: boolean;
    lastActivity: boolean;
    nextFollowUp: boolean;
    created: boolean;
  };
  onToggleColumn: (colKey: string) => void;
  onClearFilters: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedStage,
  onStageSelect,
  selectedSource,
  onSourceSelect,
  selectedTemperature,
  onTemperatureSelect,
  sortOrder,
  onToggleSort,
  onToggleSidebarMobile,
  onAddLeadModalOpen,
  summary,
  onExportCsv,
  onSaveView,
  visibleColumns,
  onToggleColumn,
  onClearFilters,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabType; label: string; count?: number | string }[] = [
    { id: 'Leads', label: 'Leads', count: summary?.totalLeads || 62 },
    { id: 'Contacts', label: 'Contacts', count: 86 },
    { id: 'My hot leads', label: 'My hot leads', count: 9 },
    { id: 'Pond', label: 'Pond', count: 14 },
    { id: 'Past clients', label: 'Past clients' },
  ];

  const stages: StageType[] = [
    'Active',
    'New',
    'Qualified',
    'Under contract',
    'Agreement',
    'Contacted',
    'Nurture',
    'Lost',
  ];

  const sources = [
    'Zillow',
    'Referral',
    'Website',
    'Sphere',
    'Facebook',
    'Instagram',
    'Google',
    'Realtor.com',
    'Open house',
  ];

  const temperatures = ['Hot', 'Warm', 'Cold'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedStage || selectedSource || selectedTemperature
  );

  return (
    <div className="flex flex-col bg-white border-b border-neutral-100 select-none" ref={dropdownRef}>
      {/* Level 1: Page Title & Top Actions */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        {/* Left: Mobile hamburger + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-1.5 rounded-lg border border-neutral-200 lg:hidden text-neutral-600 hover:bg-neutral-50"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-neutral-900 leading-none">
              People
            </h1>
            <span className="text-xs text-neutral-400 font-normal">
              {summary?.totalPeople || 148} people · {summary?.totalLeads || 62} leads
            </span>
          </div>
        </div>

        {/* Right: + New, Bell, Help, Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddLeadModalOpen}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>

          <button
            className="w-8 h-8 rounded-full border border-neutral-200/90 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>

          <button
            className="w-8 h-8 rounded-full border border-neutral-200/90 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            title="Help Center"
          >
            <HelpCircle className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200/90 ml-0.5 cursor-pointer hover:ring-2 hover:ring-neutral-200 transition-all">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Ilias Miah"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Level 2: Tabs Navigation Bar */}
      <div className="flex items-center justify-between px-6 border-b border-neutral-100">
        <div className="flex items-center gap-5 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 pb-2.5 pt-1 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] font-medium ${
                      isActive ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
          {/* Add Tab Button */}
          <button
            onClick={() => onSaveView()}
            className="w-5 h-5 rounded-full border border-neutral-200/90 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 flex items-center justify-center mb-1.5 transition-colors"
            title="Add custom view"
          >
            <Plus className="w-3 h-3 stroke-[2.2]" />
          </button>
        </div>

        <button
          onClick={onSaveView}
          className="text-xs font-medium text-neutral-400 hover:text-neutral-800 transition-colors flex items-center gap-1 py-1 pb-2"
        >
          <span>+ Save view</span>
        </button>
      </div>

      {/* Level 3: Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-white">
        {/* Left Controls: Search + Dropdown Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Leads Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none stroke-[2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search leads"
              className="pl-8 pr-7 py-1.5 bg-white border border-neutral-200/90 rounded-full text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 w-48 focus:w-60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Stage Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('stage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                selectedStage
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{selectedStage ? `Stage: ${selectedStage}` : 'Stage'}</span>
              <ChevronDown className={`w-3 h-3 stroke-[2.2] ${selectedStage ? 'text-white' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'stage' && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-neutral-200 rounded-2xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onStageSelect(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                    selectedStage === null ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All stages</span>
                  {selectedStage === null && <Check className="w-3 h-3 text-neutral-900" />}
                </button>
                <div className="my-1 border-t border-neutral-100" />
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => {
                      onStageSelect(selectedStage === stage ? null : stage);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                      selectedStage === stage ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{stage}</span>
                    {selectedStage === stage && <Check className="w-3 h-3 text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Source Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('source')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                selectedSource
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{selectedSource ? `Source: ${selectedSource}` : 'Source'}</span>
              <ChevronDown className={`w-3 h-3 stroke-[2.2] ${selectedSource ? 'text-white' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'source' && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-neutral-200 rounded-2xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onSourceSelect(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                    selectedSource === null ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All sources</span>
                  {selectedSource === null && <Check className="w-3 h-3 text-neutral-900" />}
                </button>
                <div className="my-1 border-t border-neutral-100" />
                {sources.map((src) => (
                  <button
                    key={src}
                    onClick={() => {
                      onSourceSelect(selectedSource === src ? null : src);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                      selectedSource === src ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{src}</span>
                    {selectedSource === src && <Check className="w-3 h-3 text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Temperature Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('temperature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                selectedTemperature
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{selectedTemperature ? `Temp: ${selectedTemperature}` : 'Temperature'}</span>
              <ChevronDown className={`w-3 h-3 stroke-[2.2] ${selectedTemperature ? 'text-white' : 'text-neutral-400'}`} />
            </button>

            {openDropdown === 'temperature' && (
              <div className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-neutral-200 rounded-2xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onTemperatureSelect(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                    selectedTemperature === null ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All</span>
                  {selectedTemperature === null && <Check className="w-3 h-3 text-neutral-900" />}
                </button>
                <div className="my-1 border-t border-neutral-100" />
                {temperatures.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => {
                      onTemperatureSelect(selectedTemperature === temp ? null : temp);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                      selectedTemperature === temp ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{temp}</span>
                    {selectedTemperature === temp && <Check className="w-3 h-3 text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 px-2 py-1 hover:bg-neutral-100 rounded-full transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Tools: Sort, Columns, Export, + Add Lead */}
        <div className="flex items-center gap-2">
          {/* Sort button */}
          <button
            onClick={onToggleSort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            title={`Sort by Last activity (${sortOrder === 'asc' ? 'Oldest first' : 'Newest first'})`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-600 stroke-[2]" />
            <span>Sort: Last activity</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 stroke-[2.2]" />
          </button>

          {/* Column Visibility Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('columns')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              title="Customize columns"
            >
              <Columns3 className="w-3.5 h-3.5 text-neutral-600 stroke-[2]" />
              <span>Columns</span>
            </button>

            {openDropdown === 'columns' && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-neutral-200 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-2 mb-1.5">
                  Toggle Columns
                </span>
                {Object.entries(visibleColumns).map(([key, isVis]) => (
                  <button
                    key={key}
                    onClick={() => onToggleColumn(key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left text-neutral-700 hover:bg-neutral-50 transition-colors capitalize"
                  >
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    {isVis && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Export button */}
          <button
            onClick={onExportCsv}
            className="w-7 h-7 rounded-full border border-neutral-200/90 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            title="Export leads CSV"
          >
            <Download className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {/* + Add Lead Primary Pill */}
          <button
            onClick={onAddLeadModalOpen}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Add lead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
