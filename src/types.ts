/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'CITIZEN'
  | 'GOVERNMENT_OFFICER'
  | 'UNIVERSITY_ADMIN'
  | 'FACULTY_MENTOR'
  | 'STUDENT'
  | 'INDUSTRY_PARTNER'
  | 'CSR_ORGANIZATION'
  | 'PLATFORM_ADMIN';

export type ChallengeStatus =
  | 'SUBMITTED'
  | 'AI_ANALYZED'
  | 'PENDING_GOVT_VALIDATION'
  | 'GOVT_VALIDATED'
  | 'DEPARTMENT_ROUTED'
  | 'UNIVERSITY_MATCHED'
  | 'PROJECT_PROPOSED'
  | 'PROJECT_APPROVED'
  | 'PROTOTYPE_READY'
  | 'TESTING_IN_PROGRESS'
  | 'PILOT_DEPLOYED'
  | 'IMPACT_VERIFIED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'MERGED_DUPLICATE';

export type InnovationGateClassification =
  | 'EXISTING_SOLUTION'
  | 'IMPLEMENTATION_GAP'
  | 'INNOVATION_GAP'
  | 'NEEDS_FURTHER_REVIEW';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organization?: string;
  department?: string;
  district?: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
}

export type LocationConfidence = 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW' | 'USER_CONFIRMED' | 'AI_SUGGESTED';

export type LocationSource = 'GPS' | 'USER_ENTERED' | 'AI_SUGGESTED' | 'GOOGLE_MAPS';

export interface NearbyLandmarkContext {
  name: string;
  type: 'school' | 'hospital' | 'government_office' | 'railway_station' | 'police_station' | 'water_body' | 'road' | 'landmark';
  distanceMeters?: number;
  vicinity?: string;
}

export interface DetailedLocationInfo {
  district?: string;
  block?: string;
  villageOrCity?: string;
  address?: string;
  pincode?: string;
  road?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  gpsAccuracy?: number;
  originalLatitude?: number;
  originalLongitude?: number;
  originalGpsAccuracy?: number;
  originalGpsLocation?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
  };
  confirmedLocation?: {
    lat: number;
    lng: number;
    district?: string;
    block?: string;
    villageOrCity?: string;
    address?: string;
    landmark?: string;
    pincode?: string;
    source: string;
    confirmedAt: string;
  };
  source?: LocationSource;
  locationSource?: LocationSource;
  confidence?: LocationConfidence;
  locationConfidence?: LocationConfidence;
  confirmed?: boolean;
  locationConfirmed?: boolean;
  confirmedAt?: string;
  locationConfirmedAt?: string;
  nearbyContext?: NearbyLandmarkContext[];
  diffFromGpsMeters?: number;
  gpsUnavailable?: boolean;
}

export interface ChallengeLocation {
  state: string;
  district: string;
  block?: string;
  villageOrCity?: string;
  address?: string;
  landmark?: string;
  road?: string;
  pincode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  originalLatitude?: number;
  originalLongitude?: number;
  originalGpsAccuracy?: number;
  accuracyMeters?: number;
  locationSource?: LocationSource;
  locationConfidence?: LocationConfidence;
  locationConfirmed?: boolean;
  locationConfirmedAt?: string;
  originalGpsLocation?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
  };
  confirmedLocation?: {
    lat: number;
    lng: number;
    district?: string;
    block?: string;
    villageOrCity?: string;
    address?: string;
    landmark?: string;
    pincode?: string;
    source: string;
    confirmedAt: string;
  };
  nearbyContext?: NearbyLandmarkContext[];
}

export interface ChallengeMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  url: string;
  name: string;
  caption?: string;
  sizeBytes?: number;
  uploadedAt: string;
}

export interface DepartmentContactSummary {
  departmentId: string;
  department: string;
  department_code: string;
  designation: string | null;
  officer_name: string | null;
  phone_numbers: string[];
  emails: string[];
  address: string;
  district?: string | null;
  source?: string;
  source_url?: string;
}

export interface DuplicateCandidateMatch {
  challengeId: string;
  title: string;
  similarityScore: number;
  reason: string;
}

export interface AIAnalysisResult {
  detected_language: string;
  problem_summary: string;
  domain: string;
  sub_domain: string;
  priority: PriorityLevel;
  confidence: number; // 0 - 100
  required_expertise: string[];
  possible_departments: string[];
  possible_universities: string[];
  duplicate_candidates: string[];
  duplicate_matches?: DuplicateCandidateMatch[];
  university_capability_requirements?: string[];
  department_contact_info?: DepartmentContactSummary[];
  innovation_assessment: InnovationGateClassification;
  reasoning_summary: string;
  existing_schemes?: string[];
  analyzed_at: string;
  model_used: string;
}

export interface CitizenSupporter {
  citizenId: string;
  citizenName: string;
  location?: string;
  note?: string;
  supportedAt: string;
}

export interface DuplicateClusterInfo {
  clusterId: string;
  mainChallengeId: string;
  reportsCount: number;
  supportingCitizensCount: number;
  photosCount: number;
  videosCount?: number;
  semanticSimilarityPercent: number;
  locationOverlapPercent: number;
  status: 'PENDING_REVIEW' | 'MERGED' | 'SEPARATE';
}

export interface InnovationGateIntelligence {
  checkedAt: string;
  classification: 'SOLVED' | 'PARTIALLY_ADDRESSED' | 'INNOVATION_GAP' | 'INSUFFICIENT_EVIDENCE';
  existingSolutions: {
    governmentSolutionsCount: number;
    researchCount: number;
    patentsCount: number;
    openSourceCount: number;
    existingProductsCount: number;
    previousProjectsCount: number;
  };
  gapExplanation: string;
  recommendation: string;
  references: {
    title: string;
    type: string;
    url?: string;
  }[];
}

export interface Challenge {
  id: string; // e.g. SETU-JH-2026-00142
  title: string;
  description: string;
  category: string;
  location: ChallengeLocation;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  peopleAffected: number;
  urgency: PriorityLevel;
  additionalInfo?: string;
  media: ChallengeMedia[];
  status: ChallengeStatus;
  aiAnalysis?: AIAnalysisResult;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  officerRemarks?: string;
  mergedIntoId?: string;
  supportCount?: number;
  supporters?: CitizenSupporter[];
  duplicateCluster?: DuplicateClusterInfo;
  innovationGate?: InnovationGateIntelligence;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export const JHARKHAND_DISTRICTS = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahibganj',
  'Seraikela-Kharsawan',
  'Simdega',
  'West Singhbhum'
] as const;

export interface JharkhandDepartment {
  id: string;
  department: string;
  department_code: string;
  domains: string[];
  sub_domains: string[];
  phone_numbers: string[];
  emails: string[];
  address: string;
  district: string | null;
  designation: string | null;
  officer_name: string | null;
  source: string;
  source_url: string;
  last_verified: string;
  is_active: boolean;
  primary_domain?: string;
  secretariat?: string;
  contact_email?: string;
  schemes?: string[];
  jurisdiction?: string;
}

export interface UniversityCapability {
  name: string;
  category: 'LAB' | 'FACULTY_EXPERTISE' | 'CENTRE_OF_EXCELLENCE' | 'STUDENT_SKILL';
  description: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  location: string;
  district: string;
  departments: string[];
  courses: string[];
  facultyExpertise: string[];
  researchAreas: string[];
  labs: string[];
  innovationCentre: string;
  incubationCentre?: string;
  existingProjectsCount: number;
  patentsCount: number;
  facilities: string[];
  studentCapabilities: string[];
  isDemoData: boolean;
}

export interface UniversityMatchScore {
  universityId: string;
  universityName: string;
  matchPercentage: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  recommendationLevel: 'Highly Recommended' | 'Recommended' | 'Potentially Compatible';
}

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  role: 'LEAD_STUDENT' | 'STUDENT_COLLABORATOR' | 'FACULTY_MENTOR' | 'INDUSTRY_ADVISOR';
  department: string;
  skills: string[];
  joinedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  stage:
    | 'TEAM_FORMATION'
    | 'PROPOSAL'
    | 'RESEARCH_DESIGN'
    | 'PROTOTYPE_BUILD'
    | 'LAB_TESTING'
    | 'PILOT_DEPLOYMENT'
    | 'IMPACT_VERIFICATION'
    | 'COMPLETED';
  title: string;
  description: string;
  ownerName: string;
  dueDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  documents: { name: string; url: string; uploadedAt: string }[];
  comments: string;
  evidence?: string;
}

export type CollaborationType =
  | 'MENTORSHIP'
  | 'FUNDING'
  | 'EQUIPMENT'
  | 'TESTING_FACILITY'
  | 'PILOT_SITE'
  | 'TECH_TRANSFER';

export interface IndustryCollaboration {
  id: string;
  projectId: string;
  partnerName: string;
  partnerType: 'INDUSTRY' | 'STARTUP' | 'MSME' | 'CSR_FOUNDATION';
  supportTypes: CollaborationType[];
  committedAmount?: number;
  contactPerson: string;
  contactEmail: string;
  status: 'OFFERED' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED';
  offeredAt: string;
  notes?: string;
}

export interface SocialImpactMetric {
  id: string;
  projectId: string;
  challengeId: string;
  peopleImpacted: number;
  householdsBenefited: number;
  villagesBenefited: number;
  schoolsBenefited?: number;
  waterSavedLitresPerDay?: number;
  energySavedKwhPerMonth?: number;
  costSavedInr?: number;
  timeSavedHoursPerDay?: number;
  environmentalImprovement?: string;
  accessibilityImprovement?: string;
  beforeSnapshot: string;
  afterSnapshot: string;
  verifiedByOfficer: boolean;
  verifiedAt?: string;
  recordedAt: string;
}

export interface Project {
  id: string;
  challengeId: string;
  challengeTitle: string;
  universityId: string;
  universityName: string;
  title: string;
  abstract: string;
  facultyMentorName: string;
  facultyMentorEmail: string;
  currentStage:
    | 'TEAM_FORMATION'
    | 'PROPOSAL'
    | 'RESEARCH_DESIGN'
    | 'PROTOTYPE_BUILD'
    | 'LAB_TESTING'
    | 'PILOT_DEPLOYMENT'
    | 'IMPACT_VERIFICATION'
    | 'COMPLETED';
  members: ProjectMember[];
  milestones: ProjectMilestone[];
  collaborations: IndustryCollaboration[];
  impactMetric?: SocialImpactMetric;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole: UserRole | 'ALL';
  title: string;
  message: string;
  category: 'CHALLENGE' | 'PROJECT' | 'VALIDATION' | 'MILESTONE' | 'IMPACT';
  relatedId?: string;
  challengeId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'CHALLENGE' | 'PROJECT' | 'DEPARTMENT' | 'USER' | 'INNOVATION_GATE';
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface DashboardAnalytics {
  totalChallenges: number;
  validatedChallenges: number;
  activeProjects: number;
  universitiesParticipating: number;
  studentsParticipating: number;
  facultyMentors: number;
  industryPartners: number;
  prototypesBuilt: number;
  pilotsDeployed: number;
  deploymentsCompleted: number;
  patentsFiled: number;
  startupsIncubated: number;
  techTransfers: number;
  researchOutputs: number;
  challengesByDistrict: { district: string; count: number }[];
  challengesByDomain: { domain: string; count: number }[];
  challengesByStatus: { status: string; count: number }[];
  byDistrict?: Record<string, number>;
  verifiedImpactMetrics?: {
    totalPeopleBenefited: number;
    totalHouseholdsReached: number;
    totalTimeSavedHoursDaily: number;
    totalCleanWaterLitresDaily: number;
  };
  impactAggregates: {
    totalPeopleImpacted: number;
    totalHouseholdsBenefited: number;
    totalVillagesBenefited: number;
    totalWaterSavedLitres: number;
  };
}

export type ChatRole =
  | 'GOVT_LIAISON'
  | 'RESEARCH_ADVISOR'
  | 'GEO_EXPLORER'
  | 'CITIZEN_GUIDE';

export type ChatModel =
  | 'gemini-3.8-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-pro-preview';

export interface GroundingMapSource {
  uri: string;
  title: string;
  reviewSnippets?: string[];
  placeId?: string;
  address?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  liveImage?: string;
  mapsSources?: GroundingMapSource[];
}

export interface LiveCameraEvidence {
  id: string;
  dataUrl: string;
  capturedAt: string;
  lat?: number;
  lng?: number;
  district?: string;
  analysisSummary?: string;
  location?: DetailedLocationInfo;
  originalGpsLocation?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
  };
  confirmedLocation?: {
    lat: number;
    lng: number;
    district?: string;
    block?: string;
    villageOrCity?: string;
    address?: string;
    source: string;
    confirmedAt: string;
  };
}
