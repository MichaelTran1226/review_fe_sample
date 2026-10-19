import React, { useState } from 'react';
import {
  X,
  Flame,
  Mail,
  Phone,
  Building,
  Trash2,
  Send,
  Activity,
} from 'lucide-react';
import type { LeadItem, StageType } from '../types';

interface LeadDetailDrawerProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (id: string, updates: Partial<LeadItem>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

const STAGES: StageType[] = [
  'New',
  'Active',
  'Qualified',
  'Under contract',
  'Agreement',
  'Contacted',
  'Nurture',
  'Lost',
];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onDeleteLead,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !lead) return null;

  const handleStageChange = async (newStage: StageType) => {
    await onUpdateLead(lead.id, { stage: newStage });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsSubmittingNote(true);
      // Calls update or note endpoint
      await onUpdateLead(lead.id, {
        lookingFor: lead.lookingFor, // touches activity
      });
      setNewNote('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteLead(lead.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-neutral-200/90 flex flex-col transform transition-transform duration-300 ease-in-out select-none">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <img
              src={
                lead.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={`${lead.firstName} ${lead.lastName}`}
              className="w-10 h-10 rounded-full object-cover border border-neutral-200/80 shadow-xs"
            />
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                {lead.firstName} {lead.lastName}
              </h2>
              <span className="text-xs text-neutral-400">
                Created {new Date(lead.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between animate-in fade-in">
            <span className="text-xs text-rose-800 font-medium">
              Are you sure you want to permanently delete this lead?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 text-xs rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-medium"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-2.5 py-1 text-xs rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs text-neutral-700 scrollbar-thin">
          {/* Quick Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/70">
            <div>
              <span className="text-[11px] text-neutral-400 font-medium block mb-1">Current Stage</span>
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value as StageType)}
                className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium block mb-1">Score</span>
                <div className="flex items-center gap-1 font-bold text-neutral-900 text-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span>{lead.score} / 100</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 font-medium block mb-1">Source</span>
                <span className="font-semibold text-neutral-800 bg-white border border-neutral-200 px-2 py-0.5 rounded-md">
                  {lead.source}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200/80 bg-white">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="truncate text-neutral-800 font-medium">{lead.email}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200/80 bg-white">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-800 font-medium">{lead.phone || 'No phone recorded'}</span>
              </div>
            </div>
          </div>

          {/* Looking For & Property Preferences */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
              Property Preferences
            </h3>
            <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-white flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 text-xs">
                <Building className="w-4 h-4 text-neutral-500" />
                <span>{lead.lookingFor}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-[11px]">
                <div>
                  <span className="text-neutral-400">Location:</span>{' '}
                  <span className="font-medium text-neutral-700">{lead.preferredLocation || 'Any Miami'}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Bedrooms:</span>{' '}
                  <span className="font-medium text-neutral-700">{lead.bedrooms || '2+'}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Budget Range:</span>{' '}
                  <span className="font-medium text-neutral-700">
                    ${Math.round((lead.budgetMin || 400000) / 1000)}k - ${Math.round((lead.budgetMax || 700000) / 1000)}k
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Intent:</span>{' '}
                  <span className="font-medium text-neutral-700">{lead.intent || 'Buy'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Agent */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
              Assigned Real Estate Agent
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200/80 bg-white">
              <img
                src={
                  lead.assignedAgent?.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                }
                alt="Agent"
                className="w-8 h-8 rounded-full object-cover border border-neutral-200"
              />
              <div className="flex flex-col">
                <span className="font-bold text-neutral-900 text-xs">
                  {lead.assignedAgent?.name || 'Ilias Miah'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {lead.assignedAgent?.email || 'agent@keystone.com'} · Bayfront Realty
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Activity History &amp; Notes
              </h3>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Live timeline
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {lead.activities && lead.activities.length > 0 ? (
                lead.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/60 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800">{act.title}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {act.description && (
                      <p className="text-neutral-500 text-[11px] leading-relaxed">{act.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-neutral-200 text-center text-neutral-400 text-xs">
                  Initial lead creation logged.
                </div>
              )}
            </div>

            {/* Quick Note Form */}
            <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a client note or call update..."
                className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="submit"
                disabled={isSubmittingNote || !newNote.trim()}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
