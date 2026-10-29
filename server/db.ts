/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  User,
  Challenge,
  JharkhandDepartment,
  University,
  Project,
  NotificationItem,
  AuditLogItem,
  DashboardAnalytics,
  UniversityMatchScore,
  ChallengeStatus,
  ProjectMilestone,
  ProjectMember,
  IndustryCollaboration,
  SocialImpactMetric
} from '../src/types.js';
import { JHARKHAND_DEPARTMENT_DIRECTORY } from '../src/data/jharkhandDirectory.js';
import {
  DEMO_USERS,
  DEMO_UNIVERSITIES,
  DEMO_CHALLENGES,
  DEMO_PROJECTS,
  DEMO_NOTIFICATIONS,
  DEMO_AUDIT_LOGS
} from '../src/data/mockSeedData.js';
import { departmentDirectoryDb } from './departmentDirectoryDb.js';

interface DBState {
  users: User[];
  challenges: Challenge[];
  departments: JharkhandDepartment[];
  universities: University[];
  projects: Project[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'setu_store.json');

class DatabaseService {
  private state: DBState;

  constructor() {
    this.state = this.loadOrInitialize();
  }

  private loadOrInitialize(): DBState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.challenges && parsed.departments) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing DB file, seeding defaults:', e);
    }

    const initialState: DBState = {
      users: [...DEMO_USERS],
      challenges: [...DEMO_CHALLENGES],
      departments: [...JHARKHAND_DEPARTMENT_DIRECTORY],
      universities: [...DEMO_UNIVERSITIES],
      projects: [...DEMO_PROJECTS],
      notifications: [...DEMO_NOTIFICATIONS],
      auditLogs: [...DEMO_AUDIT_LOGS]
    };

    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: DBState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db to disk:', err);
    }
  }

  public resetDemoData() {
    this.state = {
      users: [...DEMO_USERS],
      challenges: [...DEMO_CHALLENGES],
      departments: [...JHARKHAND_DEPARTMENT_DIRECTORY],
      universities: [...DEMO_UNIVERSITIES],
      projects: [...DEMO_PROJECTS],
      notifications: [...DEMO_NOTIFICATIONS],
      auditLogs: [...DEMO_AUDIT_LOGS]
    };
    this.saveState(this.state);
    return { success: true, message: 'SETU Demo Data successfully reset to initial baseline' };
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  // --- Audit Logs ---
  public logAudit(log: Omit<AuditLogItem, 'id' | 'timestamp'>): AuditLogItem {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.state.auditLogs.unshift(newLog);
    this.saveState(this.state);
    return newLog;
  }

  public getAuditLogs(entityId?: string): AuditLogItem[] {
    if (entityId) {
      return this.state.auditLogs.filter((l) => l.entityId === entityId);
    }
    return this.state.auditLogs;
  }

  // --- Notifications ---
  public getNotifications(targetRole?: string): NotificationItem[] {
    if (!targetRole || targetRole === 'ALL') {
      return this.state.notifications;
    }
    return this.state.notifications.filter(
      (n) => n.targetRole === targetRole || n.targetRole === 'ALL'
    );
  }

  public markNotificationRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState(this.state);
    }
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...item
    };
    this.state.notifications.unshift(notif);
    this.saveState(this.state);
    return notif;
  }

  // --- Challenges ---
  public getChallenges(filter?: {
    district?: string;
    domain?: string;
    status?: string;
    priority?: string;
    citizenId?: string;
    search?: string;
  }): Challenge[] {
    return this.state.challenges.filter((c) => {
      if (filter?.district && c.location.district !== filter.district) return false;
      if (filter?.domain && c.aiAnalysis?.domain !== filter.domain) return false;
      if (filter?.status && c.status !== filter.status) return false;
      if (filter?.priority && c.urgency !== filter.priority) return false;
      if (filter?.citizenId && c.citizenId !== filter.citizenId) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const text = `${c.id} ${c.title} ${c.description} ${c.location.district} ${c.category}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }

  public getChallengeById(id: string): Challenge | undefined {
    return this.state.challenges.find((c) => c.id === id);
  }

  public generateChallengeId(): string {
    const year = new Date().getFullYear();
    const count = this.state.challenges.length + 1;
    const padded = String(count + 142).padStart(5, '0');
    return `SETU-JH-${year}-${padded}`;
  }

  public createChallenge(challengeData: Partial<Challenge>): Challenge {
    const id = challengeData.id || this.generateChallengeId();
    const newChallenge: Challenge = {
      id,
      title: challengeData.title || 'Untitled Challenge',
      description: challengeData.description || '',
      category: challengeData.category || 'General',
      location: challengeData.location || { state: 'Jharkhand', district: 'Ranchi' },
      citizenId: challengeData.citizenId || 'usr-citizen-01',
      citizenName: challengeData.citizenName || 'Citizen Contributor',
      citizenPhone: challengeData.citizenPhone,
      peopleAffected: challengeData.peopleAffected || 100,
      urgency: challengeData.urgency || 'MEDIUM',
      additionalInfo: challengeData.additionalInfo,
      media: challengeData.media || [],
      status: challengeData.status || 'SUBMITTED',
      aiAnalysis: challengeData.aiAnalysis,
      assignedDepartmentId: challengeData.assignedDepartmentId,
      assignedDepartmentName: challengeData.assignedDepartmentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.challenges.unshift(newChallenge);

    this.logAudit({
      actorName: newChallenge.citizenName,
      actorRole: 'CITIZEN',
      action: 'SUBMIT_CHALLENGE',
      entityType: 'CHALLENGE',
      entityId: newChallenge.id,
      details: `New challenge reported: "${newChallenge.title}" in ${newChallenge.location.district}`
    });

    this.addNotification({
      targetRole: 'GOVERNMENT_OFFICER',
      title: 'New Challenge Submitted',
      message: `Challenge ${newChallenge.id} reported in ${newChallenge.location.district} requires review.`,
      category: 'CHALLENGE',
      relatedId: newChallenge.id
    });

    this.saveState(this.state);
    return newChallenge;
  }

  public updateChallenge(id: string, updates: Partial<Challenge>, actorName = 'System', actorRole: any = 'PLATFORM_ADMIN'): Challenge | null {
    const challenge = this.getChallengeById(id);
    if (!challenge) return null;

    Object.assign(challenge, updates, { updatedAt: new Date().toISOString() });

    this.logAudit({
      actorName,
      actorRole,
      action: 'UPDATE_CHALLENGE',
      entityType: 'CHALLENGE',
      entityId: challenge.id,
      details: `Challenge updated to status: ${challenge.status}`
    });

    this.saveState(this.state);
    return challenge;
  }

  public addCitizenSupport(challengeId: string, supporter: { citizenId: string; citizenName: string; location?: string; note?: string }): Challenge | null {
    const challenge = this.getChallengeById(challengeId);
    if (!challenge) return null;

    if (!challenge.supporters) {
      challenge.supporters = [];
    }

    const alreadySupported = challenge.supporters.some((s) => s.citizenId === supporter.citizenId);
    if (!alreadySupported) {
      challenge.supporters.push({
        ...supporter,
        supportedAt: new Date().toISOString()
      });
      challenge.supportCount = (challenge.supportCount || 0) + 1;

      // Update cluster count if clustered
      if (challenge.duplicateCluster) {
        challenge.duplicateCluster.supportingCitizensCount = (challenge.duplicateCluster.supportingCitizensCount || 0) + 1;
      }

      this.logAudit({
        actorName: supporter.citizenName,
        actorRole: 'CITIZEN',
        action: 'SUPPORT_CHALLENGE',
        entityType: 'CHALLENGE',
        entityId: challenge.id,
        details: `Citizen supported challenge (${challenge.supportCount} total supporters)`
      });

      this.saveState(this.state);
    }

    return challenge;
  }

  public updateDuplicateCluster(challengeId: string, status: 'PENDING_REVIEW' | 'MERGED' | 'SEPARATE', actorName = 'Government Officer'): Challenge | null {
    const challenge = this.getChallengeById(challengeId);
    if (!challenge) return null;

    if (!challenge.duplicateCluster) {
      challenge.duplicateCluster = {
        clusterId: `CLUST-${challengeId.slice(-5)}`,
        mainChallengeId: challengeId,
        reportsCount: 1,
        supportingCitizensCount: challenge.supportCount || 1,
        photosCount: challenge.media.length,
        semanticSimilarityPercent: 88,
        locationOverlapPercent: 92,
        status
      };
    } else {
      challenge.duplicateCluster.status = status;
    }

    this.logAudit({
      actorName,
      actorRole: 'GOVERNMENT_OFFICER',
      action: 'UPDATE_CLUSTER',
      entityType: 'CHALLENGE',
      entityId: challenge.id,
      details: `Duplicate cluster status updated to ${status}`
    });

    this.saveState(this.state);
    return challenge;
  }

  // --- Departments (Official Jharkhand Department Directory Table) ---
  public getDepartments(query?: string): JharkhandDepartment[] {
    if (!query) {
      return departmentDirectoryDb.getAllDepartments({ activeOnly: true });
    }
    return departmentDirectoryDb.searchDepartments(query);
  }

  public getDepartmentById(id: string): JharkhandDepartment | undefined {
    return departmentDirectoryDb.getDepartmentById(id);
  }

  public findDepartmentByDomain(domainName: string): JharkhandDepartment | undefined {
    const match = departmentDirectoryDb.getDepartmentByClassification(domainName);
    return match.department || undefined;
  }

  /**
   * Retrieves department and contact information based on challenge domain and sub-domain
   * classifications directly from the 'jharkhand_department_directory' database table.
   */
  public getDepartmentByClassification(domain: string, subDomain?: string) {
    return departmentDirectoryDb.getDepartmentByClassification(domain, subDomain);
  }

  public getDepartmentContactDossier(idOrName: string) {
    return departmentDirectoryDb.getDepartmentContactDossier(idOrName);
  }

  // --- Universities ---
  public getUniversities(): University[] {
    return this.state.universities;
  }

  public getUniversityById(id: string): University | undefined {
    return this.state.universities.find((u) => u.id === id);
  }

  public calculateUniversityMatch(challenge: Challenge): UniversityMatchScore[] {
    const required = challenge.aiAnalysis?.required_expertise || ['Engineering', 'IoT', 'Field Research'];

    return this.state.universities.map((uni) => {
      const allCapabilities = [
        ...uni.departments,
        ...uni.facultyExpertise,
        ...uni.researchAreas,
        ...uni.labs,
        ...uni.studentCapabilities
      ].map((c) => c.toLowerCase());

      const matched: string[] = [];
      const missing: string[] = [];

      required.forEach((req) => {
        const reqLower = req.toLowerCase();
        const hasMatch = allCapabilities.some(
          (cap) => cap.includes(reqLower) || reqLower.includes(cap)
        );
        if (hasMatch) {
          matched.push(req);
        } else {
          missing.push(req);
        }
      });

      const matchRatio = required.length > 0 ? matched.length / required.length : 0.5;
      const basePercentage = Math.round(matchRatio * 75 + (uni.patentsCount > 5 ? 15 : 10));
      const matchPercentage = Math.min(98, Math.max(45, basePercentage));

      let recommendationLevel: 'Highly Recommended' | 'Recommended' | 'Potentially Compatible' = 'Potentially Compatible';
      if (matchPercentage >= 85) {
        recommendationLevel = 'Highly Recommended';
      } else if (matchPercentage >= 65) {
        recommendationLevel = 'Recommended';
      }

      return {
        universityId: uni.id,
        universityName: uni.name,
        matchPercentage,
        matchedCapabilities: matched,
        missingCapabilities: missing,
        recommendationLevel
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  // --- Projects ---
  public getProjects(filter?: { universityId?: string; challengeId?: string }): Project[] {
    return this.state.projects.filter((p) => {
      if (filter?.universityId && p.universityId !== filter.universityId) return false;
      if (filter?.challengeId && p.challengeId !== filter.challengeId) return false;
      return true;
    });
  }

  public getProjectById(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public createProject(projectData: {
    challengeId: string;
    universityId: string;
    title: string;
    abstract: string;
    facultyMentorName: string;
    facultyMentorEmail: string;
    initialStudentName?: string;
    initialStudentDepartment?: string;
  }): Project {
    const challenge = this.getChallengeById(projectData.challengeId);
    const university = this.getUniversityById(projectData.universityId);

    const projectId = `proj-${Date.now().toString().slice(-6)}`;
    const newProject: Project = {
      id: projectId,
      challengeId: projectData.challengeId,
      challengeTitle: challenge ? challenge.title : 'Societal Challenge',
      universityId: projectData.universityId,
      universityName: university ? `${university.name} [DEMO DATA]` : 'Partner University [DEMO DATA]',
      title: projectData.title,
      abstract: projectData.abstract,
      facultyMentorName: projectData.facultyMentorName,
      facultyMentorEmail: projectData.facultyMentorEmail,
      currentStage: 'TEAM_FORMATION',
      members: [
        {
          id: `pm-${Date.now()}-1`,
          userId: 'usr-student-01',
          name: projectData.initialStudentName || 'Pooja Kumari',
          role: 'LEAD_STUDENT',
          department: projectData.initialStudentDepartment || 'Computer Science & Engineering',
          skills: ['Lead Student', 'Prototyping', 'System Architecture'],
          joinedAt: new Date().toISOString()
        },
        {
          id: `pm-${Date.now()}-2`,
          userId: 'usr-faculty-01',
          name: projectData.facultyMentorName,
          role: 'FACULTY_MENTOR',
          department: 'Academic Mentor',
          skills: ['Technical Guidance', 'Quality Review', 'Govt Liaison'],
          joinedAt: new Date().toISOString()
        }
      ],
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          projectId,
          stage: 'TEAM_FORMATION',
          title: 'Multidisciplinary Student Team Formation',
          description: 'Recruit and assign students across Computer Science, Civil, Electrical, and Domain disciplines.',
          ownerName: projectData.initialStudentName || 'Lead Student',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'COMPLETED',
          completedDate: new Date().toISOString().split('T')[0],
          documents: [],
          comments: 'Initial team formed and registered.'
        },
        {
          id: `ms-${Date.now()}-2`,
          projectId,
          stage: 'PROPOSAL',
          title: 'Solution Proposal & Technical Architecture Submission',
          description: 'Submit detailed engineering proposal, bill of materials, and methodology for government review.',
          ownerName: projectData.facultyMentorName,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          status: 'IN_PROGRESS',
          documents: [],
          comments: 'Drafting proposal schematics.'
        },
        {
          id: `ms-${Date.now()}-3`,
          projectId,
          stage: 'PROTOTYPE_BUILD',
          title: 'Working Prototype Assembly & Lab Bench Testing',
          description: 'Fabricate bench-scale working model with calibrated telemetry sensors.',
          ownerName: projectData.initialStudentName || 'Lead Student',
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
          documents: [],
          comments: 'Scheduled after proposal approval.'
        },
        {
          id: `ms-${Date.now()}-4`,
          projectId,
          stage: 'PILOT_DEPLOYMENT',
          title: 'Community Field Pilot Deployment',
          description: 'Install working prototype in the target village/block in coordination with local administration.',
          ownerName: projectData.facultyMentorName,
          dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
          documents: [],
          comments: 'Planned field trial.'
        },
        {
          id: `ms-${Date.now()}-5`,
          projectId,
          stage: 'IMPACT_VERIFICATION',
          title: 'Measurable Social Impact Verification',
          description: 'Verify household beneficiaries, operational reliability, and government officer signoff.',
          ownerName: 'Government Officer',
          dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
          documents: [],
          comments: 'Audit stage.'
        }
      ],
      collaborations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.projects.unshift(newProject);

    if (challenge) {
      challenge.projectId = projectId;
      challenge.status = 'PROJECT_PROPOSED';
      challenge.updatedAt = new Date().toISOString();
    }

    this.logAudit({
      actorName: projectData.facultyMentorName,
      actorRole: 'FACULTY_MENTOR',
      action: 'CREATE_PROJECT',
      entityType: 'PROJECT',
      entityId: projectId,
      details: `Project "${newProject.title}" initiated by ${university?.name || 'University'} for challenge ${newProject.challengeId}`
    });

    this.addNotification({
      targetRole: 'CITIZEN',
      title: 'University Team Started Solution Project',
      message: `${university?.name || 'A university team'} has initiated an R&D solution project for your challenge!`,
      category: 'PROJECT',
      relatedId: newProject.challengeId
    });

    this.saveState(this.state);
    return newProject;
  }

  public updateProjectStage(projectId: string, stage: Project['currentStage'], challengeStatusMap?: ChallengeStatus): Project | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    project.currentStage = stage;
    project.updatedAt = new Date().toISOString();

    if (project.challengeId) {
      const challenge = this.getChallengeById(project.challengeId);
      if (challenge) {
        let mappedStatus: ChallengeStatus = 'PROJECT_APPROVED';
        if (stage === 'PROTOTYPE_BUILD') mappedStatus = 'PROTOTYPE_READY';
        if (stage === 'LAB_TESTING') mappedStatus = 'TESTING_IN_PROGRESS';
        if (stage === 'PILOT_DEPLOYMENT') mappedStatus = 'PILOT_DEPLOYED';
        if (stage === 'IMPACT_VERIFICATION') mappedStatus = 'IMPACT_VERIFIED';
        if (stage === 'COMPLETED') mappedStatus = 'COMPLETED';

        challenge.status = challengeStatusMap || mappedStatus;
        challenge.updatedAt = new Date().toISOString();

        if (stage === 'PILOT_DEPLOYMENT' || stage === 'COMPLETED') {
          this.addNotification({
            targetRole: 'CITIZEN',
            title: 'Your Challenge Resulted in a Pilot Solution!',
            message: `A working solution has been piloted in your area for challenge ${challenge.id}.`,
            category: 'IMPACT',
            relatedId: challenge.id
          });
        }
      }
    }

    this.logAudit({
      actorName: 'Project Lead / Faculty',
      actorRole: 'FACULTY_MENTOR',
      action: 'ADVANCE_LIFECYCLE_STAGE',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Project advanced to stage: ${stage}`
    });

    this.saveState(this.state);
    return project;
  }

  public addProjectMember(projectId: string, member: Omit<ProjectMember, 'id' | 'joinedAt'>): ProjectMember | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const newMember: ProjectMember = {
      id: `pm-${Date.now()}`,
      joinedAt: new Date().toISOString(),
      ...member
    };

    project.members.push(newMember);
    project.updatedAt = new Date().toISOString();

    this.logAudit({
      actorName: member.name,
      actorRole: member.role === 'FACULTY_MENTOR' ? 'FACULTY_MENTOR' : 'STUDENT',
      action: 'JOIN_PROJECT_TEAM',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `${member.name} (${member.department}) joined project team as ${member.role}`
    });

    this.saveState(this.state);
    return newMember;
  }

  public updateMilestone(
    projectId: string,
    milestoneId: string,
    updates: Partial<ProjectMilestone>,
    actorName: string,
    actorRole: any
  ): ProjectMilestone | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    Object.assign(milestone, updates);
    if (updates.status === 'COMPLETED' || updates.status === 'APPROVED') {
      milestone.completedDate = new Date().toISOString().split('T')[0];
    }
    project.updatedAt = new Date().toISOString();

    this.logAudit({
      actorName,
      actorRole,
      action: 'UPDATE_MILESTONE',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Milestone "${milestone.title}" marked as ${milestone.status}`
    });

    this.saveState(this.state);
    return milestone;
  }

  public addIndustryCollaboration(
    projectId: string,
    collabData: Omit<IndustryCollaboration, 'id' | 'projectId' | 'offeredAt' | 'status'>
  ): IndustryCollaboration | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const collab: IndustryCollaboration = {
      id: `collab-${Date.now()}`,
      projectId,
      offeredAt: new Date().toISOString(),
      status: 'OFFERED',
      ...collabData
    };

    project.collaborations.push(collab);
    project.updatedAt = new Date().toISOString();

    this.logAudit({
      actorName: collab.partnerName,
      actorRole: 'INDUSTRY_PARTNER',
      action: 'OFFER_COLLABORATION',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `${collab.partnerName} (${collab.partnerType}) offered support: ${collab.supportTypes.join(', ')}`
    });

    this.addNotification({
      targetRole: 'UNIVERSITY_ADMIN',
      title: 'Industry Partner Collaboration Offered',
      message: `${collab.partnerName} offered support for project "${project.title}".`,
      category: 'PROJECT',
      relatedId: project.id
    });

    this.saveState(this.state);
    return collab;
  }

  public recordImpact(
    projectId: string,
    impactData: Omit<SocialImpactMetric, 'id' | 'projectId' | 'recordedAt'>
  ): SocialImpactMetric | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const impact: SocialImpactMetric = {
      id: `imp-${Date.now()}`,
      projectId,
      recordedAt: new Date().toISOString(),
      ...impactData
    };

    project.impactMetric = impact;
    project.currentStage = 'COMPLETED';
    project.updatedAt = new Date().toISOString();

    if (project.challengeId) {
      const challenge = this.getChallengeById(project.challengeId);
      if (challenge) {
        challenge.status = 'IMPACT_VERIFIED';
        challenge.updatedAt = new Date().toISOString();
      }
    }

    this.logAudit({
      actorName: 'Officer / Field Auditor',
      actorRole: 'GOVERNMENT_OFFICER',
      action: 'RECORD_MEASURABLE_IMPACT',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Social impact recorded: ${impact.peopleImpacted} people affected, ${impact.householdsBenefited} households benefited.`
    });

    this.saveState(this.state);
    return impact;
  }

  // --- Analytics Dashboard ---
  public getAnalytics(): DashboardAnalytics {
    const challenges = this.state.challenges;
    const projects = this.state.projects;

    // Challenges by district
    const districtMap: Record<string, number> = {};
    challenges.forEach((c) => {
      const dist = c.location.district || 'Unspecified';
      districtMap[dist] = (districtMap[dist] || 0) + 1;
    });
    const challengesByDistrict = Object.entries(districtMap).map(([district, count]) => ({
      district,
      count
    }));

    // Challenges by domain
    const domainMap: Record<string, number> = {};
    challenges.forEach((c) => {
      const dom = c.aiAnalysis?.domain || c.category || 'General';
      domainMap[dom] = (domainMap[dom] || 0) + 1;
    });
    const challengesByDomain = Object.entries(domainMap).map(([domain, count]) => ({
      domain,
      count
    }));

    // Challenges by status
    const statusMap: Record<string, number> = {};
    challenges.forEach((c) => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });
    const challengesByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count
    }));

    // Impact aggregates
    let totalPeopleImpacted = 0;
    let totalHouseholdsBenefited = 0;
    let totalVillagesBenefited = 0;
    let totalWaterSavedLitres = 0;

    projects.forEach((p) => {
      if (p.impactMetric) {
        totalPeopleImpacted += p.impactMetric.peopleImpacted || 0;
        totalHouseholdsBenefited += p.impactMetric.householdsBenefited || 0;
        totalVillagesBenefited += p.impactMetric.villagesBenefited || 0;
        totalWaterSavedLitres += p.impactMetric.waterSavedLitresPerDay || 0;
      }
    });

    return {
      totalChallenges: challenges.length,
      validatedChallenges: challenges.filter((c) => c.status !== 'SUBMITTED' && c.status !== 'REJECTED').length,
      activeProjects: projects.length,
      universitiesParticipating: this.state.universities.length,
      studentsParticipating: 84, // Realistic count across teams
      facultyMentors: 28,
      industryPartners: 14,
      prototypesBuilt: projects.filter((p) => p.currentStage !== 'TEAM_FORMATION' && p.currentStage !== 'PROPOSAL').length + 3,
      pilotsDeployed: projects.filter((p) => p.currentStage === 'PILOT_DEPLOYMENT' || p.currentStage === 'COMPLETED' || p.currentStage === 'IMPACT_VERIFICATION').length + 1,
      deploymentsCompleted: projects.filter((p) => p.currentStage === 'COMPLETED').length + 1,
      patentsFiled: 4,
      startupsIncubated: 6,
      techTransfers: 2,
      researchOutputs: 11,
      challengesByDistrict,
      challengesByDomain,
      challengesByStatus,
      impactAggregates: {
        totalPeopleImpacted,
        totalHouseholdsBenefited,
        totalVillagesBenefited,
        totalWaterSavedLitres
      }
    };
  }
}

export const db = new DatabaseService();
