import React, { useState } from 'react';
import {
  LayoutGrid,
  Sun,
  Inbox,
  Users,
  Building,
  Tag,
  Calendar,
  BarChart3,
  Sparkles,
  Settings,
  ChevronDown,
  Search,
  MoreHorizontal,
  Building2,
  LogOut,
} from 'lucide-react';
import type { DashboardSummary } from '../types';

interface SidebarProps {
  activeNav: string;
  onNavSelect: (nav: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  summary?: DashboardSummary | null;
  currentUser?: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavSelect,
  isOpen = true,
  onClose,
  summary,
  currentUser,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const workspaceItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'Today', label: 'Today', icon: Sun },
    { id: 'Inbox', label: 'Inbox', icon: Inbox, badge: '3' },
    { id: 'People', label: 'People', icon: Users },
    { id: 'Properties', label: 'Properties', icon: Building, badge: '61' },
    { id: 'Deals', label: 'Deals', icon: Tag, badge: '24' },
    { id: 'Calendar', label: 'Calendar', icon: Calendar },
  ];

  const managementItems = [
    { id: 'Team', label: 'Team', icon: Users },
    { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'Automations', label: 'Automations', icon: Sparkles },
  ];

  const systemItems = [
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const achievedFormatted = summary?.goalAchieved
    ? `$${summary.goalAchieved.toLocaleString()}`
    : '$186,420';

  const targetFormatted = summary?.goalTarget
    ? `$${Math.round(summary.goalTarget / 1000)}k`
    : '$240k';

  const percentage = summary?.goalPercentage || 78;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[240px] shrink-0 bg-white border-r border-neutral-100 flex flex-col justify-between p-3 select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-2.5">
          {/* Org Selector */}
          <div className="flex items-center justify-between px-1.5 py-1 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                K
              </div>
              <span className="font-semibold text-neutral-900 text-[13px] tracking-tight">Keystone</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 stroke-[2.2]" />
          </div>

          {/* Sub Workspace Card */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-neutral-300 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center shrink-0 text-neutral-600 group-hover:text-neutral-900 transition-colors">
                <Building2 className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-neutral-800 text-xs truncate leading-tight">Bayfront Realty</span>
                <span className="text-[11px] text-neutral-400 truncate leading-tight mt-0.5">Miami · 6 offices</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 stroke-[2]" />
          </div>

          {/* Quick Search */}
          <div className="rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 flex items-center justify-between text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 stroke-[2]" />
              <span className="text-xs font-normal">Search</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-400 border border-neutral-200/80 rounded px-1.5 py-0.2 bg-neutral-50/50">
              ⌘K
            </span>
          </div>

          {/* Navigation Menus */}
          <div className="flex flex-col gap-4 mt-2 overflow-y-auto max-h-[calc(100vh-320px)] lg:max-h-[calc(100vh-360px)] pr-0.5 scrollbar-thin">
            {/* WORKSPACE */}
            <div>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                WORKSPACE
              </div>
              <div className="flex flex-col gap-0.5">
                {workspaceItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-neutral-800 text-neutral-300'
                              : 'text-neutral-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MANAGEMENT */}
            <div>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                MANAGEMENT
              </div>
              <div className="flex flex-col gap-0.5">
                {managementItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYSTEM */}
            <div>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                SYSTEM
              </div>
              <div className="flex flex-col gap-0.5">
                {systemItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Goal Widget & User Profile */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 relative">
          {/* 2026 GCI Goal Card */}
          <div className="rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-2.5 flex flex-col gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-normal text-neutral-500">2026 GCI goal</span>
              <span className="font-bold text-neutral-800 text-[11px]">{percentage}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-neutral-900 tracking-tight">{achievedFormatted}</span>
              <span className="text-[11px] text-neutral-400">of {targetFormatted}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/70 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-lime-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] font-medium text-[#738a1e] mt-0.5 flex items-center gap-1">
              <span>$53.6k to go</span>
              <span>·</span>
              <span>{summary?.dealsPending || 4} deals pending</span>
            </div>
          </div>

          {/* Agent User Profile */}
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="rounded-xl p-1.5 hover:bg-neutral-100/70 transition-colors flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={
                  currentUser?.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                }
                alt={currentUser?.name || 'Ilias Miah'}
                className="w-7 h-7 rounded-full object-cover border border-neutral-200/80 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-neutral-900 text-xs truncate leading-tight">
                  {currentUser?.name || 'Ilias Miah'}
                </span>
                <span className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
                  Agent · Bayfront Real...
                </span>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0 stroke-[2]" />
          </div>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div className="absolute bottom-12 left-2 right-2 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 border-b border-neutral-100 mb-1">
                <span className="text-xs font-bold text-neutral-900 block">{currentUser?.name || 'Ilias Miah'}</span>
                <span className="text-[11px] text-neutral-400 truncate block">{currentUser?.email || 'agent@keystone.com'}</span>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
