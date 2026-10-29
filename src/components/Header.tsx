/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  BarChart3,
  BookOpen,
  Bell,
  RotateCcw,
  Languages,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Camera,
  Bot,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { UserRole } from '../types.js';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuditLogs: () => void;
  onOpenChatbot?: () => void;
  onOpenMaps?: () => void;
  onOpenLiveCamera?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuditLogs,
  onOpenChatbot,
  onOpenMaps,
  onOpenLiveCamera
}) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    currentView,
    setCurrentView,
    language,
    setLanguage,
    notifications,
    resetDemoData,
    t
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'CITIZEN':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'GOVERNMENT_OFFICER':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'UNIVERSITY_ADMIN':
      case 'FACULTY_MENTOR':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'STUDENT':
        return <GraduationCap className="w-4 h-4 text-cyan-600" />;
      case 'INDUSTRY_PARTNER':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'CSR_ORGANIZATION':
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case 'PLATFORM_ADMIN':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    }
  };

  const navItems = [
    { id: 'CITIZEN', label: t('nav.citizen', 'Citizen Portal'), icon: Users },
    { id: 'GOVERNMENT', label: t('nav.government', 'Govt Validation'), icon: ShieldCheck },
    { id: 'UNIVERSITY', label: t('nav.university', 'University & R&D'), icon: GraduationCap },
    { id: 'INDUSTRY', label: t('nav.industry', 'Industry & CSR'), icon: Briefcase },
    { id: 'DIRECTORY', label: t('nav.directory', 'Dept Directory'), icon: BookOpen },
    { id: 'ANALYTICS', label: t('nav.analytics', 'Impact & Analytics'), icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Govt Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-stone-300 font-medium">
            Government of Jharkhand | Department of Higher & Technical Education
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 text-stone-300 hover:text-white px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
            title="Toggle Language (English / हिन्दी)"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="text-stone-400 hover:text-stone-200 transition-colors"
            title="View Immutable Audit Trail"
          >
            Audit Trail
          </button>

          <button
            onClick={async () => {
              if (confirm('Reset SETU to initial pristine demo dataset?')) {
                await resetDemoData();
              }
            }}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/60 transition-colors border border-amber-800/40"
            title="Reset to baseline demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Header & Role Switcher */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-stone-100">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-black text-xl shadow-md tracking-wider">
            सेतु
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">SETU</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Societal Innovation Portal
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Jharkhand Crowdsourced Challenges & University-Industry R&D Bridge
            </p>
          </div>
        </div>

        {/* User Role Switcher & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI & Live Tools */}
          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors shadow-2xs"
              title="Open SETU Multi-turn AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">AI Chatbot</span>
            </button>
          )}

          {onOpenMaps && (
            <button
              onClick={onOpenMaps}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors shadow-2xs"
              title="Open Google Maps Grounding Explorer"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden lg:inline">Maps Grounding</span>
            </button>
          )}

          {onOpenLiveCamera && (
            <button
              onClick={onOpenLiveCamera}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold transition-colors shadow-2xs"
              title="Open Live Camera Viewfinder (Local file uploads prohibited)"
            >
              <Camera className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden xl:inline">Live Camera</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Active Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-2xs">
                {getRoleIcon(currentUser.role)}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                    {currentUser.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 truncate max-w-[160px]">
                  {currentUser.organization || `${currentUser.district || 'Jharkhand'}`}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </button>

            {/* Persona Switcher Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 border-b border-stone-100 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Simulate Active Persona (Demo Mode)
                  </span>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {availableUsers.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-medium'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{user.name}</div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {user.role.replace(/_/g, ' ')} • {user.organization || user.district}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-4 flex items-center gap-1 overflow-x-auto no-scrollbar bg-stone-50/50">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
