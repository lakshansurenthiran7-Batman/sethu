/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Challenge,
  Project,
  JharkhandDepartment,
  University,
  NotificationItem,
  AuditLogItem,
  DashboardAnalytics
} from '../types.js';
import { DEMO_USERS } from '../data/mockSeedData.js';

type ViewMode =
  | 'CITIZEN'
  | 'GOVERNMENT'
  | 'UNIVERSITY'
  | 'INDUSTRY'
  | 'DIRECTORY'
  | 'ANALYTICS';

type Language = 'en' | 'hi';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  challenges: Challenge[];
  projects: Project[];
  departments: JharkhandDepartment[];
  universities: University[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
  dataError: string | null;
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  refreshData: () => Promise<void>;
  createChallenge: (challengeData: any) => Promise<Challenge | null>;
  validateChallenge: (id: string, actionData: any) => Promise<boolean>;
  supportChallenge: (challengeId: string, note?: string) => Promise<boolean>;
  updateClusterStatus: (challengeId: string, status: 'PENDING_REVIEW' | 'MERGED' | 'SEPARATE') => Promise<boolean>;
  adoptChallengeProject: (projectData: any) => Promise<Project | null>;
  updateProjectStage: (projectId: string, stage: Project['currentStage']) => Promise<boolean>;
  addProjectMember: (projectId: string, memberData: any) => Promise<boolean>;
  updateMilestoneStatus: (projectId: string, milestoneId: string, statusData: any) => Promise<boolean>;
  offerCollaboration: (projectId: string, collabData: any) => Promise<boolean>;
  recordImpactMetric: (projectId: string, impactData: any) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  t: (key: string, defaultText: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Hindi translation dictionary for primary UI labels
const TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    'portal.title': 'सेतु (SETU) - झारखंड सामाजिक नवाचार सहयोग पोर्टल',
    'portal.subtitle': 'उच्च एवं तकनीकी शिक्षा विभाग, झारखंड सरकार | SIH 2026',
    'nav.citizen': 'नागरिक पोर्टल',
    'nav.government': 'सरकारी सत्यापन',
    'nav.university': 'विश्वविद्यालय एवं अनुसंधान',
    'nav.industry': 'उद्योग एवं सीएसआर',
    'nav.directory': 'विभाग निर्देशिका',
    'nav.analytics': 'सामाजिक प्रभाव एवं डेटा',
    'btn.report_challenge': 'नया सामाजिक मुद्दा दर्ज करें',
    'badge.demo_mode': 'डेमो मोड सक्रिय',
    'status.SUBMITTED': 'दर्ज किया गया',
    'status.PENDING_GOVT_VALIDATION': 'सरकारी सत्यापन प्रतीक्षारत',
    'status.GOVT_VALIDATED': 'सत्यापित',
    'status.DEPARTMENT_ROUTED': 'विभाग को अग्रसारित',
    'status.UNIVERSITY_MATCHED': 'विश्वविद्यालय चयनित',
    'status.PROJECT_PROPOSED': 'प्रस्ताव प्रस्तुत',
    'status.PROJECT_APPROVED': 'परियोजना स्वीकृत',
    'status.PROTOTYPE_READY': 'प्रोटोटाइप तैयार',
    'status.TESTING_IN_PROGRESS': 'परीक्षण जारी',
    'status.PILOT_DEPLOYED': 'पायलट समाधान स्थापित',
    'status.IMPACT_VERIFIED': 'सामाजिक प्रभाव प्रमाणित'
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // Rameshwar Munda (Citizen)
  const [currentView, setCurrentView] = useState<ViewMode>('CITIZEN');
  const [language, setLanguage] = useState<Language>('en');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<JharkhandDepartment[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Sync role view when user switches role
  useEffect(() => {
    if (currentUser.role === 'CITIZEN') setCurrentView('CITIZEN');
    else if (currentUser.role === 'GOVERNMENT_OFFICER') setCurrentView('GOVERNMENT');
    else if (currentUser.role === 'UNIVERSITY_ADMIN' || currentUser.role === 'FACULTY_MENTOR' || currentUser.role === 'STUDENT') setCurrentView('UNIVERSITY');
    else if (currentUser.role === 'INDUSTRY_PARTNER' || currentUser.role === 'CSR_ORGANIZATION') setCurrentView('INDUSTRY');
    else if (currentUser.role === 'PLATFORM_ADMIN') setCurrentView('ANALYTICS');
  }, [currentUser]);

  const refreshData = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const [chRes, prRes, depRes, unRes, notifRes, audRes, anRes] = await Promise.all([
        fetch('/api/challenges'),
        fetch('/api/projects'),
        fetch('/api/departments'),
        fetch('/api/universities'),
        fetch(`/api/notifications?role=${currentUser.role}`),
        fetch('/api/audit-logs'),
        fetch('/api/analytics')
      ]);

      if ([chRes, prRes, depRes, unRes, notifRes, audRes, anRes].some(res => !res.ok)) {
        throw new Error('Unable to load portal data');
      }

      const [chData, prData, depData, unData, notifData, audData, anData] = await Promise.all([
        chRes.json(),
        prRes.json(),
        depRes.json(),
        unRes.json(),
        notifRes.json(),
        audRes.json(),
        anRes.json()
      ]);

      if (chData.challenges) setChallenges(chData.challenges);
      if (prData.projects) setProjects(prData.projects);
      if (depData.departments) setDepartments(depData.departments);
      if (unData.universities) setUniversities(unData.universities);
      if (notifData.notifications) setNotifications(notifData.notifications);
      if (audData.logs) setAuditLogs(audData.logs);
      if (anData.analytics) setAnalytics(anData.analytics);
    } catch (err) {
      setDataError('Portal data could not be loaded. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser.role]);

  const createChallenge = async (challengeData: any): Promise<Challenge | null> => {
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...challengeData,
          citizenId: currentUser.id,
          citizenName: currentUser.name,
          citizenPhone: currentUser.phone
        })
      });
      const data = await res.json();
      if (data.success && data.challenge) {
        await refreshData();
        return data.challenge;
      }
      return null;
    } catch (err) {
      console.error('Error creating challenge:', err);
      return null;
    }
  };

  const validateChallenge = async (id: string, actionData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/challenges/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...actionData,
          officerName: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error validating challenge:', err);
      return false;
    }
  };

  const supportChallenge = async (challengeId: string, note?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: currentUser.id,
          citizenName: currentUser.name,
          location: currentUser.district || 'Jharkhand',
          note
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error supporting challenge:', err);
      return false;
    }
  };

  const updateClusterStatus = async (
    challengeId: string,
    status: 'PENDING_REVIEW' | 'MERGED' | 'SEPARATE'
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/cluster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          officerName: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating cluster status:', err);
      return false;
    }
  };

  const adoptChallengeProject = async (projectData: any): Promise<Project | null> => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const data = await res.json();
      if (data.success && data.project) {
        await refreshData();
        return data.project;
      }
      return null;
    } catch (err) {
      console.error('Error creating project:', err);
      return null;
    }
  };

  const updateProjectStage = async (projectId: string, stage: Project['currentStage']): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating project stage:', err);
      return false;
    }
  };

  const addProjectMember = async (projectId: string, memberData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding project member:', err);
      return false;
    }
  };

  const updateMilestoneStatus = async (projectId: string, milestoneId: string, statusData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...statusData,
          actorName: currentUser.name,
          actorRole: currentUser.role
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating milestone:', err);
      return false;
    }
  };

  const offerCollaboration = async (projectId: string, collabData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...collabData,
          partnerName: currentUser.organization || currentUser.name,
          contactPerson: currentUser.name,
          contactEmail: currentUser.email
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error offering collaboration:', err);
      return false;
    }
  };

  const recordImpactMetric = async (projectId: string, impactData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...impactData,
          verifiedByOfficer: currentUser.role === 'GOVERNMENT_OFFICER' || currentUser.role === 'PLATFORM_ADMIN'
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error recording impact:', err);
      return false;
    }
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const resetDemoData = async (): Promise<void> => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error resetting demo data:', err);
    }
  };

  const t = (key: string, defaultText: string): string => {
    if (language === 'hi' && TRANSLATIONS.hi[key]) {
      return TRANSLATIONS.hi[key];
    }
    return defaultText;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: DEMO_USERS,
        currentView,
        setCurrentView,
        language,
        setLanguage,
        challenges,
        projects,
        departments,
        universities,
        notifications,
        auditLogs,
        analytics,
        isLoading,
        dataError,
        selectedChallengeId,
        setSelectedChallengeId,
        selectedProjectId,
        setSelectedProjectId,
        refreshData,
        createChallenge,
        validateChallenge,
        supportChallenge,
        updateClusterStatus,
        adoptChallengeProject,
        updateProjectStage,
        addProjectMember,
        updateMilestoneStatus,
        offerCollaboration,
        recordImpactMetric,
        markNotificationRead,
        resetDemoData,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
