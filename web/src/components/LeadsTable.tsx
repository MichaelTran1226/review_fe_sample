import React, { useState } from 'react';
import {
  ChevronDown,
  Flame,
  ChevronLeft,
  ChevronRight,
  Minus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import type { LeadItem, StageType } from '../types';

interface LeadsTableProps {
  leads: LeadItem[];
  totalLeadsCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onLeadClick: (lead: LeadItem) => void;
  onBulkStageChange: (leadIds: string[], stage: StageType) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
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
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  totalLeadsCount,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  isLoading,
  isError,
  onRetry,
  onLeadClick,
  onBulkStageChange,
  onBulkDelete,
  visibleColumns,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStage, setBulkStage] = useState<StageType>('Qualified');
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkStage = async () => {
    try {
      setIsBulkOperating(true);
      await onBulkStageChange(Array.from(selectedIds), bulkStage);
      setSelectedIds(new Set());
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} selected leads?`)) return;
    try {
      setIsBulkOperating(true);
      await onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsBulkOperating(false);
    }
  };

  const renderStageBadge = (stage: StageType) => {
    let dotColor = 'bg-neutral-400';
    switch (stage) {
      case 'Active':
        dotColor = 'bg-emerald-500';
        break;
      case 'New':
        dotColor = 'bg-sky-500';
        break;
      case 'Qualified':
        dotColor = 'bg-blue-600';
        break;
      case 'Under contract':
        dotColor = 'bg-neutral-800';
        break;
      case 'Agreement':
        dotColor = 'bg-blue-600';
        break;
      case 'Contacted':
        dotColor = 'bg-amber-500';
        break;
      case 'Nurture':
        dotColor = 'bg-purple-500';
        break;
      case 'Lost':
        dotColor = 'bg-rose-500';
        break;
    }

    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
        <span className="text-xs font-medium text-neutral-800">{stage}</span>
      </div>
    );
  };

  const renderScore = (score: number) => {
    const hasFlame = score >= 50;
    return (
      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-neutral-100/80 text-[11px] font-semibold text-neutral-700">
        {hasFlame ? (
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500/20 stroke-[2.2]" />
        ) : (
          <Minus className="w-2.5 h-2.5 text-neutral-400 stroke-[2.5]" />
        )}
        <span>{score}</span>
      </div>
    );
  };

  const formatRelativeActivity = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 5) return { text: 'Just now', highlight: false };
    if (diffMins < 60) return { text: `${diffMins}m ago`, highlight: false };
    if (diffHours < 24) return { text: `${diffHours}h ago`, highlight: false };
    if (diffDays === 1) return { text: 'Yesterday', highlight: false };
    if (diffDays < 7) return { text: `${diffDays}d ago`, highlight: false };
    if (diffDays < 30) return { text: `${Math.floor(diffDays / 7)}w ago`, highlight: false };
    return { text: date.toLocaleDateString([], { month: 'short', day: 'numeric' }), highlight: false };
  };

  const formatNextFollowUp = (dateStr?: string | null) => {
    if (!dateStr) return { text: '—', highlight: false };
    const date = new Date(dateStr);
    const diffHours = (date.getTime() - Date.now()) / (60 * 60 * 1000);

    if (diffHours < 0) return { text: 'Overdue', highlight: true };
    if (diffHours < 2) return { text: 'Now', highlight: true };
    if (diffHours < 24) return { text: 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), highlight: false };
    if (diffHours < 48) return { text: 'Tomorrow', highlight: false };
    return { text: date.toLocaleDateString([], { month: 'short', day: 'numeric' }), highlight: false };
  };

  return (
    <div className="flex flex-col flex-1 bg-white select-none relative">
      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="absolute top-2 left-6 right-6 z-20 bg-neutral-900 text-white rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-xl animate-in slide-in-from-top-2 duration-150 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{selectedIds.size} lead(s) selected</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-neutral-400 hover:text-white underline text-[11px]"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[11px]">Move to:</span>
              <select
                value={bulkStage}
                onChange={(e) => setBulkStage(e.target.value as StageType)}
                className="bg-neutral-800 text-white px-2 py-1 rounded-lg text-xs border border-neutral-700"
              >
                <option value="Active">Active</option>
                <option value="Qualified">Qualified</option>
                <option value="Under contract">Under contract</option>
                <option value="Agreement">Agreement</option>
                <option value="Contacted">Contacted</option>
                <option value="Nurture">Nurture</option>
                <option value="Lost">Lost</option>
              </select>
              <button
                disabled={isBulkOperating}
                onClick={handleBulkStage}
                className="px-2.5 py-1 bg-white text-neutral-900 hover:bg-neutral-100 font-semibold rounded-lg text-xs"
              >
                Apply
              </button>
            </div>

            <button
              disabled={isBulkOperating}
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable table container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 bg-white z-10 border-b border-neutral-100 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 pl-6 pr-3 w-8">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selectedIds.size === leads.length}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-neutral-900"
                />
              </th>
              <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Person</th>
              {visibleColumns.stage && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Stage</th>
              )}
              {visibleColumns.score && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Score</th>
              )}
              {visibleColumns.source && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Source</th>
              )}
              {visibleColumns.lookingFor && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Looking for</th>
              )}
              {visibleColumns.agent && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Agent</th>
              )}
              {visibleColumns.lastActivity && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-neutral-900">
                    <span>Last activity</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400 stroke-[2]" />
                  </div>
                </th>
              )}
              {visibleColumns.nextFollowUp && (
                <th className="py-2.5 px-3 font-medium text-neutral-500 normal-case">Next follow up</th>
              )}
              {visibleColumns.created && (
                <th className="py-2.5 pl-3 pr-6 font-medium text-neutral-500 normal-case">Created</th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 pl-6 pr-3">
                    <div className="w-3.5 h-3.5 bg-neutral-200 rounded" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-neutral-200" />
                      <div className="space-y-1">
                        <div className="w-24 h-2.5 bg-neutral-200 rounded" />
                        <div className="w-32 h-2 bg-neutral-100 rounded" />
                      </div>
                    </div>
                  </td>
                  {visibleColumns.stage && (
                    <td className="py-3 px-3">
                      <div className="w-16 h-4 bg-neutral-100 rounded-full" />
                    </td>
                  )}
                  {visibleColumns.score && (
                    <td className="py-3 px-3">
                      <div className="w-10 h-4 bg-neutral-100 rounded" />
                    </td>
                  )}
                  {visibleColumns.source && (
                    <td className="py-3 px-3">
                      <div className="w-14 h-3 bg-neutral-100 rounded" />
                    </td>
                  )}
                  {visibleColumns.lookingFor && (
                    <td className="py-3 px-3">
                      <div className="w-40 h-3 bg-neutral-100 rounded" />
                    </td>
                  )}
                  {visibleColumns.agent && (
                    <td className="py-3 px-3">
                      <div className="w-5 h-5 rounded-full bg-neutral-200" />
                    </td>
                  )}
                  {visibleColumns.lastActivity && (
                    <td className="py-3 px-3">
                      <div className="w-14 h-3 bg-neutral-100 rounded" />
                    </td>
                  )}
                  {visibleColumns.nextFollowUp && (
                    <td className="py-3 px-3">
                      <div className="w-20 h-3 bg-neutral-100 rounded" />
                    </td>
                  )}
                  {visibleColumns.created && (
                    <td className="py-3 pl-3 pr-6">
                      <div className="w-12 h-3 bg-neutral-100 rounded" />
                    </td>
                  )}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                    <span className="text-neutral-600 font-medium">Failed to load leads from server.</span>
                    <button
                      onClick={onRetry}
                      className="mt-1 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs font-semibold"
                    >
                      Retry Connection
                    </button>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-neutral-400">
                  No leads found matching your search or filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.has(lead.id);
                const fullName = `${lead.firstName} ${lead.lastName}`;
                const activity = formatRelativeActivity(lead.lastActivity);
                const followUp = formatNextFollowUp(lead.nextFollowUp);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className={`transition-colors hover:bg-neutral-50/80 cursor-pointer group ${
                      isSelected ? 'bg-neutral-50/90' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => toggleSelectOne(lead.id, e)}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-neutral-900"
                      />
                    </td>

                    {/* Person */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            lead.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={fullName}
                          className="w-6 h-6 rounded-full object-cover border border-neutral-200/80 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-neutral-900 leading-tight truncate">
                            {fullName}
                          </span>
                          <span className="text-[11px] text-neutral-400 leading-tight truncate mt-0.5">
                            {lead.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    {visibleColumns.stage && (
                      <td className="py-2 px-3">{renderStageBadge(lead.stage)}</td>
                    )}

                    {/* Score */}
                    {visibleColumns.score && (
                      <td className="py-2 px-3">{renderScore(lead.score)}</td>
                    )}

                    {/* Source */}
                    {visibleColumns.source && (
                      <td className="py-2 px-3">
                        <span className="text-neutral-600 text-xs font-normal">
                          {lead.source}
                        </span>
                      </td>
                    )}

                    {/* Looking for */}
                    {visibleColumns.lookingFor && (
                      <td className="py-2 px-3">
                        <span className="text-neutral-600 text-xs truncate max-w-[260px] block font-normal">
                          {lead.lookingFor}
                        </span>
                      </td>
                    )}

                    {/* Agent */}
                    {visibleColumns.agent && (
                      <td className="py-2 px-3">
                        <img
                          src={
                            lead.assignedAgent?.avatarUrl ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                          }
                          alt="Agent"
                          title={lead.assignedAgent?.name || 'Ilias Miah'}
                          className="w-5 h-5 rounded-full object-cover border border-neutral-200/80 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Last activity */}
                    {visibleColumns.lastActivity && (
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`text-xs ${
                            activity.highlight ? 'text-rose-600 font-semibold' : 'text-neutral-600'
                          }`}
                        >
                          {activity.text}
                        </span>
                      </td>
                    )}

                    {/* Next follow up */}
                    {visibleColumns.nextFollowUp && (
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`text-xs ${
                            followUp.highlight
                              ? followUp.text === 'Now'
                                ? 'text-amber-700 font-semibold'
                                : 'text-rose-600 font-semibold'
                              : 'text-neutral-600'
                          }`}
                        >
                          {followUp.text}
                        </span>
                      </td>
                    )}

                    {/* Created */}
                    {visibleColumns.created && (
                      <td className="py-2 pl-3 pr-6 whitespace-nowrap text-neutral-400 text-xs">
                        {new Date(lead.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 bg-white text-xs text-neutral-500">
        <div>
          Showing {leads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalLeadsCount)} of {totalLeadsCount} leads
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: Math.min(5, totalPages || 1) }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-semibold ${
                  currentPage === pageNum
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {(totalPages || 1) > 5 && <span className="px-1 text-neutral-400">...</span>}

          {(totalPages || 1) > 5 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === totalPages
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            disabled={currentPage >= (totalPages || 1) || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
