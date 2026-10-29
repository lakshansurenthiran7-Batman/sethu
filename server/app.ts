import express from 'express';
import { db } from './db.js';
import {
  analyzeChallengeAI,
  transcribeAudioAI,
  queryMapsGroundingAI,
  chatWithGeminiAI,
  analyzeLiveCameraFrameAI
} from './aiService.js';
import { reverseGeocodeLocation, searchPlacesLocation } from './mapsService.js';


export function createApp() {
const app = express();
app.use(express.json({ limit: '5mb' }));
// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'SETU', time: new Date().toISOString() });
});

// --- CHALLENGES API ---

// Create Challenge
app.post('/api/challenges', async (req, res) => {
  try {
    const body = req.body;
    if (!body.title || !body.description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // 1. Initial Challenge creation
    const generatedId = db.generateChallengeId();
    const locationPayload = body.location || {
      state: 'Jharkhand',
      district: body.district || 'Ranchi',
      block: body.block || '',
      villageOrCity: body.villageOrCity || '',
      address: body.address || '',
      road: body.road || '',
      landmark: body.landmark || '',
      pincode: body.pincode || '',
      coordinates: body.coordinates,
      accuracyMeters: body.accuracyMeters,
      locationSource: body.locationSource,
      locationConfidence: body.locationConfidence,
      locationConfirmed: body.locationConfirmed,
      locationConfirmedAt: body.locationConfirmedAt,
      originalGpsLocation: body.originalGpsLocation,
      confirmedLocation: body.confirmedLocation,
      nearbyContext: body.nearbyContext
    };

    const newChallenge = db.createChallenge({
      id: generatedId,
      title: body.title,
      description: body.description,
      category: body.category || 'General',
      location: locationPayload,
      citizenId: body.citizenId || 'usr-citizen-01',
      citizenName: body.citizenName || 'Citizen Contributor',
      citizenPhone: body.citizenPhone || '',
      peopleAffected: Number(body.peopleAffected) || 100,
      urgency: body.urgency || 'MEDIUM',
      additionalInfo: body.additionalInfo || '',
      media: body.media || [],
      status: 'SUBMITTED'
    });

    // 2. Automated AI Analysis
    const existing = db.getChallenges().filter((c) => c.id !== newChallenge.id);
    const aiAnalysis = await analyzeChallengeAI({
      title: newChallenge.title,
      description: newChallenge.description,
      category: newChallenge.category,
      district: newChallenge.location.district,
      existingChallenges: existing.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        domain: c.aiAnalysis?.domain
      }))
    });

    // 3. Department lookup from official directory database table
    let assignedDepartmentId: string | undefined;
    let assignedDepartmentName: string | undefined;

    if (aiAnalysis.department_contact_info && aiAnalysis.department_contact_info.length > 0) {
      const primaryContact = aiAnalysis.department_contact_info[0];
      assignedDepartmentId = primaryContact.departmentId;
      assignedDepartmentName = primaryContact.department;
    } else if (aiAnalysis.possible_departments.length > 0 && aiAnalysis.possible_departments[0] !== 'Needs Government Review') {
      const dept = db.findDepartmentByDomain(aiAnalysis.possible_departments[0]);
      if (dept) {
        assignedDepartmentId = dept.id;
        assignedDepartmentName = dept.department;
      }
    }

    const updated = db.updateChallenge(
      newChallenge.id,
      {
        aiAnalysis,
        assignedDepartmentId,
        assignedDepartmentName,
        status: 'PENDING_GOVT_VALIDATION'
      },
      'SETU AI Engine',
      'PLATFORM_ADMIN'
    );

    res.status(201).json({
      success: true,
      challenge: updated || newChallenge,
      message: 'Your challenge has been successfully submitted and analyzed.'
    });
  } catch (err: any) {
    console.error('Error creating challenge:', err);
    res.status(500).json({ error: err.message || 'Failed to submit challenge' });
  }
});

// List Challenges
app.get('/api/challenges', (req, res) => {
  const { district, domain, status, priority, search, citizenId } = req.query;
  const challenges = db.getChallenges({
    district: district as string,
    domain: domain as string,
    status: status as string,
    priority: priority as string,
    search: search as string,
    citizenId: citizenId as string
  });
  res.json({ challenges });
});

// Get Challenge Details
app.get('/api/challenges/:id', (req, res) => {
  const challenge = db.getChallengeById(req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  // Retrieve official department details if assigned
  let departmentDetails = null;
  if (challenge.assignedDepartmentId) {
    departmentDetails = db.getDepartmentById(challenge.assignedDepartmentId);
  } else if (challenge.aiAnalysis?.domain) {
    departmentDetails = db.findDepartmentByDomain(challenge.aiAnalysis.domain);
  }

  // Retrieve university capability match scores
  const universityMatches = db.calculateUniversityMatch(challenge);

  // Retrieve linked project if exists
  const project = challenge.projectId ? db.getProjectById(challenge.projectId) : null;

  // Retrieve audit logs
  const auditLogs = db.getAuditLogs(challenge.id);

  res.json({
    challenge,
    departmentDetails,
    universityMatches,
    project,
    auditLogs
  });
});

// Government Officer Validation & Routing Action
app.post('/api/challenges/:id/validate', (req, res) => {
  try {
    const { id } = req.params;
    const {
      action,
      departmentId,
      departmentName,
      remarks,
      duplicateTargetId,
      officerName = 'Dr. Alok Kumar Verma, IAS'
    } = req.body;

    const challenge = db.getChallengeById(id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    let nextStatus = challenge.status;
    let details = '';

    switch (action) {
      case 'ACCEPT_AI':
        nextStatus = 'GOVT_VALIDATED';
        details = `Officer approved AI domain classification. Assigned to ${challenge.assignedDepartmentName || 'Department'}. Remarks: ${remarks || 'Approved'}`;
        break;

      case 'CHANGE_DEPARTMENT':
        nextStatus = 'DEPARTMENT_ROUTED';
        const newDept = departmentId ? db.getDepartmentById(departmentId) : null;
        challenge.assignedDepartmentId = departmentId;
        challenge.assignedDepartmentName = newDept?.department || departmentName || 'Specified Department';
        details = `Officer changed department routing to ${challenge.assignedDepartmentName}. Remarks: ${remarks || ''}`;
        break;

      case 'FORWARD_UNIVERSITY':
        nextStatus = 'UNIVERSITY_MATCHED';
        details = `Challenge validated and opened for University R&D solutions. Remarks: ${remarks || ''}`;
        break;

      case 'MERGE_DUPLICATE':
        nextStatus = 'MERGED_DUPLICATE';
        challenge.mergedIntoId = duplicateTargetId;
        details = `Merged as duplicate into ${duplicateTargetId}. Remarks: ${remarks || ''}`;
        break;

      case 'REJECT':
        nextStatus = 'REJECTED';
        details = `Report rejected. Reason: ${remarks || 'Out of jurisdiction or invalid'}`;
        break;

      case 'REQUEST_MORE_INFO':
        details = `Officer requested additional information from citizen: ${remarks || ''}`;
        break;

      default:
        details = `Officer action: ${action}. Remarks: ${remarks || ''}`;
    }

    const updated = db.updateChallenge(
      id,
      {
        status: nextStatus,
        officerRemarks: remarks ? `${challenge.officerRemarks ? challenge.officerRemarks + ' | ' : ''}${remarks}` : challenge.officerRemarks
      },
      officerName,
      'GOVERNMENT_OFFICER'
    );

    // Notify citizen
    db.addNotification({
      targetRole: 'CITIZEN',
      title: `Challenge Status: ${nextStatus.replace(/_/g, ' ')}`,
      message: `Your challenge ${id} was reviewed by Government Administration: ${details}`,
      category: 'VALIDATION',
      relatedId: id
    });

    res.json({ success: true, challenge: updated, details });
  } catch (err: any) {
    console.error('Validation error:', err);
    res.status(500).json({ error: err.message || 'Validation action failed' });
  }
});

// Citizen Support ("I Also Face This Problem")
app.post('/api/challenges/:id/support', (req, res) => {
  try {
    const { id } = req.params;
    const { citizenId, citizenName, location, note } = req.body;

    if (!citizenId || !citizenName) {
      return res.status(400).json({ error: 'Citizen identifier and name are required.' });
    }

    const updated = db.addCitizenSupport(id, { citizenId, citizenName, location, note });
    if (!updated) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    res.json({
      success: true,
      challenge: updated,
      supportCount: updated.supportCount || 0,
      message: 'Thank you. Your support has been officially recorded for this societal issue.'
    });
  } catch (err: any) {
    console.error('Support error:', err);
    res.status(500).json({ error: err.message || 'Failed to record support' });
  }
});

// Duplicate Cluster Management (Government Officer)
app.post('/api/challenges/:id/cluster', (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerName } = req.body;

    if (!['PENDING_REVIEW', 'MERGED', 'SEPARATE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid cluster status.' });
    }

    const updated = db.updateDuplicateCluster(id, status, officerName);
    if (!updated) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    res.json({
      success: true,
      challenge: updated,
      message: `Cluster status successfully updated to ${status}.`
    });
  } catch (err: any) {
    console.error('Cluster update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update cluster status' });
  }
});

// --- AI API ---

// Full AI Problem Analysis Module Endpoint (implements A - J)
app.post(['/api/ai/analyze', '/api/ai/analyze-challenge'], async (req, res) => {
  try {
    const { title, description, category, district } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for AI analysis.' });
    }

    const existing = db.getChallenges();
    const result = await analyzeChallengeAI({
      title,
      description,
      category,
      district,
      existingChallenges: existing.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        domain: c.aiAnalysis?.domain,
        district: c.location?.district
      }))
    });

    res.json({ success: true, analysis: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
});

// Deduplicate helper
app.post('/api/ai/deduplicate', (req, res) => {
  const { title, description, district } = req.body;
  if (!title && !description) return res.json({ duplicates: [] });

  const existing = db.getChallenges();
  const searchWords = `${title || ''} ${description || ''}`
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter((w: string) => w.length > 3);

  const duplicates = existing
    .map((c) => {
      const text = `${c.title} ${c.description}`.toLowerCase();
      let matchCount = 0;
      for (const w of searchWords) {
        if (text.includes(w)) matchCount++;
      }
      const sameDistrict = district && c.location.district.toLowerCase() === district.toLowerCase();
      const score = Math.min(100, Math.round((matchCount / Math.max(searchWords.length, 1)) * 70 + (sameDistrict ? 25 : 0)));
      return { challenge: c, matchCount, score };
    })
    .filter((item) => item.matchCount >= 2 || item.score >= 50)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.challenge);

  res.json({ duplicates });
});

// Audio Transcription Endpoint using gemini-3.5-transcribe
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType, prompt } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 payload is required' });
    }
    const result = await transcribeAudioAI({
      base64Audio: audioData,
      mimeType,
      prompt
    });
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/transcribe:', err);
    res.status(500).json({ error: err.message || 'Audio transcription failed' });
  }
});

// Reverse Geocode coordinates to address and Jharkhand district
app.all('/api/maps/geocode', async (req, res) => {
  try {
    const lat = req.body?.lat ?? req.query?.lat;
    const lng = req.body?.lng ?? req.query?.lng;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }
    const result = await reverseGeocodeLocation(Number(lat), Number(lng));
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error in /api/maps/geocode:', err);
    res.status(500).json({ error: err.message || 'Geocoding failed' });
  }
});

// Search Jharkhand places and institutions
app.get('/api/maps/places', async (req, res) => {
  try {
    const query = req.query.q as string;
    const districtHint = req.query.district as string;
    if (!query) {
      return res.status(400).json({ error: 'q query param is required' });
    }
    const results = await searchPlacesLocation(query, districtHint);
    res.json({ success: true, results });
  } catch (err: any) {
    console.error('Error in /api/maps/places:', err);
    res.status(500).json({ error: err.message || 'Places search failed' });
  }
});

// Google Maps Grounding Endpoint using gemini-3.5-flash with googleMaps tool
app.post('/api/ai/maps-grounding', async (req, res) => {
  try {
    const { query, latitude, longitude, district } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query string is required' });
    }
    const result = await queryMapsGroundingAI({
      query,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      district
    });
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/maps-grounding:', err);
    res.status(500).json({ error: err.message || 'Maps grounding query failed' });
  }
});

// Multi-turn Gemini Chatbot Endpoint with role switching and maps grounding
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, role, model, useMapsGrounding, userLocation } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const result = await chatWithGeminiAI({
      messages,
      role,
      model,
      useMapsGrounding: Boolean(useMapsGrounding),
      userLocation
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error in /api/ai/chat:', err);
    res.status(500).json({ error: err.message || 'Chat query failed' });
  }
});

// Live Camera Snapshot AI Vision Inspection
app.post('/api/ai/analyze-camera', async (req, res) => {
  try {
    const { image, contextText, district, location } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'image base64 is required from live camera' });
    }
    const analysis = await analyzeLiveCameraFrameAI({
      base64Image: image,
      contextText,
      district,
      location
    });
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze-camera:', err);
    res.status(500).json({ error: err.message || 'Live camera analysis failed' });
  }
});

// --- JHARKHAND DEPARTMENT DIRECTORY API ---

// Retrieve departments with optional filtering by query, domain, or sub-domain
app.get(['/api/departments', '/api/department-directory'], (req, res) => {
  const query = (req.query.q || req.query.query || req.query.search) as string;
  const domain = req.query.domain as string;
  const subDomain = (req.query.sub_domain || req.query.subDomain) as string;

  if (domain || subDomain) {
    const match = db.getDepartmentByClassification(domain || '', subDomain);
    return res.json({
      primary_match: match.department,
      all_matches: match.allMatches,
      total: match.allMatches.length
    });
  }

  const departments = db.getDepartments(query);
  res.json({ departments, total: departments.length });
});

// Retrieve specific department by ID
app.get(['/api/departments/:id', '/api/department-directory/:id'], (req, res) => {
  const dept = db.getDepartmentById(req.params.id);
  if (!dept) {
    return res.status(404).json({ error: 'Department not found in directory database' });
  }
  const contactDossier = db.getDepartmentContactDossier(req.params.id);
  res.json({ department: dept, contactDossier });
});

// Match department & contact information based on challenge domain and sub-domain
app.post(['/api/department-directory/match', '/api/departments/match'], (req, res) => {
  const { domain, sub_domain, subDomain } = req.body;
  if (!domain && !sub_domain && !subDomain) {
    return res.status(400).json({ error: 'domain or sub_domain parameter required for lookup' });
  }

  const lookupDomain = domain || '';
  const lookupSubDomain = sub_domain || subDomain || '';

  const matchResult = db.getDepartmentByClassification(lookupDomain, lookupSubDomain);

  res.json({
    success: true,
    matched_department: matchResult.department,
    contact_information: matchResult.department ? {
      departmentId: matchResult.department.id,
      department: matchResult.department.department,
      department_code: matchResult.department.department_code,
      designation: matchResult.department.designation,
      officer_name: matchResult.department.officer_name,
      phone_numbers: matchResult.department.phone_numbers,
      emails: matchResult.department.emails,
      address: matchResult.department.address,
      district: matchResult.department.district,
      source: matchResult.department.source,
      source_url: matchResult.department.source_url,
      last_verified: matchResult.department.last_verified,
      is_active: matchResult.department.is_active
    } : null,
    candidate_departments: matchResult.allMatches.map((m) => ({
      department: m.department.department,
      department_code: m.department.department_code,
      designation: m.department.designation,
      officer_name: m.department.officer_name,
      emails: m.department.emails,
      phone_numbers: m.department.phone_numbers,
      matchScore: m.matchScore,
      matchedReason: m.matchedReason
    }))
  });
});

// --- UNIVERSITIES & CAPABILITY MATCHING API ---

app.get('/api/universities', (_req, res) => {
  const universities = db.getUniversities();
  res.json({ universities });
});

app.get('/api/universities/match', (req, res) => {
  const challengeId = req.query.challengeId as string;
  if (!challengeId) {
    return res.status(400).json({ error: 'challengeId query parameter required' });
  }

  const challenge = db.getChallengeById(challengeId);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const matches = db.calculateUniversityMatch(challenge);
  res.json({ challengeId, matches });
});

// --- PROJECTS & LIFECYCLE API ---

app.get('/api/projects', (req, res) => {
  const { universityId, challengeId } = req.query;
  const projects = db.getProjects({
    universityId: universityId as string,
    challengeId: challengeId as string
  });
  res.json({ projects });
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const challenge = db.getChallengeById(project.challengeId);
  res.json({ project, challenge });
});

app.post('/api/projects', (req, res) => {
  try {
    const body = req.body;
    if (!body.challengeId || !body.universityId || !body.title) {
      return res.status(400).json({ error: 'challengeId, universityId, and title are required' });
    }

    const newProject = db.createProject({
      challengeId: body.challengeId,
      universityId: body.universityId,
      title: body.title,
      abstract: body.abstract || '',
      facultyMentorName: body.facultyMentorName || 'Faculty Mentor',
      facultyMentorEmail: body.facultyMentorEmail || 'mentor@univ.ac.in',
      initialStudentName: body.initialStudentName,
      initialStudentDepartment: body.initialStudentDepartment
    });

    res.status(201).json({ success: true, project: newProject });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});

// Update Project Lifecycle Stage
app.patch('/api/projects/:id/stage', (req, res) => {
  try {
    const { stage, challengeStatus } = req.body;
    const project = db.updateProjectStage(req.params.id, stage, challengeStatus);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project stage' });
  }
});

// Add Member to Project (Multidisciplinary Team Collaboration)
app.post('/api/projects/:id/members', (req, res) => {
  try {
    const { name, role, department, skills = [] } = req.body;
    if (!name || !role || !department) {
      return res.status(400).json({ error: 'name, role, and department are required' });
    }

    const member = db.addProjectMember(req.params.id, {
      userId: `usr-${Date.now()}`,
      name,
      role,
      department,
      skills
    });

    if (!member) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json({ success: true, member });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add project member' });
  }
});

// Update Milestone
app.patch('/api/projects/:id/milestones/:milestoneId', (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { status, comments, documents, actorName = 'Faculty Mentor', actorRole = 'FACULTY_MENTOR' } = req.body;

    const milestone = db.updateMilestone(
      id,
      milestoneId,
      { status, comments, documents },
      actorName,
      actorRole
    );

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone or project not found' });
    }

    res.json({ success: true, milestone });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update milestone' });
  }
});

// Add Industry Collaboration
app.post('/api/projects/:id/collaborations', (req, res) => {
  try {
    const { partnerName, partnerType, supportTypes, committedAmount, contactPerson, contactEmail, notes } = req.body;

    if (!partnerName || !partnerType || !supportTypes || !contactEmail) {
      return res.status(400).json({ error: 'Missing required industry partner details' });
    }

    const collab = db.addIndustryCollaboration(req.params.id, {
      partnerName,
      partnerType,
      supportTypes,
      committedAmount: Number(committedAmount) || 0,
      contactPerson: contactPerson || partnerName,
      contactEmail,
      notes
    });

    if (!collab) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json({ success: true, collaboration: collab });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit collaboration' });
  }
});

// Record Measurable Social Impact
app.post('/api/projects/:id/impact', (req, res) => {
  try {
    const {
      challengeId,
      peopleImpacted,
      householdsBenefited,
      villagesBenefited,
      schoolsBenefited,
      waterSavedLitresPerDay,
      energySavedKwhPerMonth,
      costSavedInr,
      timeSavedHoursPerDay,
      environmentalImprovement,
      accessibilityImprovement,
      beforeSnapshot,
      afterSnapshot,
      verifiedByOfficer = true
    } = req.body;

    const impact = db.recordImpact(req.params.id, {
      challengeId,
      peopleImpacted: Number(peopleImpacted) || 0,
      householdsBenefited: Number(householdsBenefited) || 0,
      villagesBenefited: Number(villagesBenefited) || 0,
      schoolsBenefited: Number(schoolsBenefited) || 0,
      waterSavedLitresPerDay: Number(waterSavedLitresPerDay) || 0,
      energySavedKwhPerMonth: Number(energySavedKwhPerMonth) || 0,
      costSavedInr: Number(costSavedInr) || 0,
      timeSavedHoursPerDay: Number(timeSavedHoursPerDay) || 0,
      environmentalImprovement,
      accessibilityImprovement,
      beforeSnapshot: beforeSnapshot || 'Baseline challenges identified prior to intervention.',
      afterSnapshot: afterSnapshot || 'Pilot system operational with verified community benefit.',
      verifiedByOfficer: Boolean(verifiedByOfficer),
      verifiedAt: new Date().toISOString()
    });

    if (!impact) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json({ success: true, impact });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record impact' });
  }
});

// --- ANALYTICS & AUDIT API ---

app.get('/api/analytics', (_req, res) => {
  const data = db.getAnalytics();
  res.json({ analytics: data });
});

app.get('/api/audit-logs', (req, res) => {
  const entityId = req.query.entityId as string;
  const logs = db.getAuditLogs(entityId);
  res.json({ logs });
});

app.get('/api/notifications', (req, res) => {
  const role = req.query.role as string;
  const notifications = db.getNotifications(role);
  res.json({ notifications });
});

app.post('/api/notifications/:id/read', (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// --- DEMO MODE & DEMO SCENARIO RUNNER ---

app.post('/api/demo/reset', (_req, res) => {
  const result = db.resetDemoData();
  res.json(result);
});


app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));
return app;
}
