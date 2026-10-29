/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  Zap,
  FolderGit2,
  Sparkles,
  ChevronRight,
  Award,
  FlaskConical,
  Wrench,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Challenge, Project, University } from '../types.js';

interface UniversityPortalProps {
  onSelectChallenge: (id: string) => void;
  onSelectProject: (id: string) => void;
}

export const UniversityPortal: React.FC<UniversityPortalProps> = ({
  onSelectChallenge,
  onSelectProject
}) => {
  const {
    challenges,
    projects,
    universities,
    currentUser,
    adoptChallengeProject,
    updateProjectStage,
    addProjectMember,
    updateMilestoneStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'AVAILABLE_CHALLENGES' | 'INSTITUTIONS'>('PROJECTS');
  const [selectedProjectForView, setSelectedProjectForView] = useState<Project | null>(projects[0] || null);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [targetChallengeToAdopt, setTargetChallengeToAdopt] = useState<Challenge | null>(null);

  // Adoption Form State
  const [projTitle, setProjTitle] = useState('');
  const [projAbstract, setProjAbstract] = useState('');
  const [selectedUniId, setSelectedUniId] = useState(universities[0]?.id || 'uni-01');
  const [facultyName, setFacultyName] = useState(currentUser.role === 'FACULTY_MENTOR' ? currentUser.name : 'Dr. Ananya Roy');
  const [leadStudentName, setLeadStudentName] = useState('Pooja Kumari');
  const [leadStudentDept, setLeadStudentDept] = useState('Computer Science & Engineering');

  // Add Member Form
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDept, setNewMemberDept] = useState('Civil Engineering');
  const [newMemberRole, setNewMemberRole] = useState<'STUDENT_COLLABORATOR' | 'FACULTY_MENTOR'>('STUDENT_COLLABORATOR');
  const [newMemberSkill, setNewMemberSkill] = useState('CAD Modelling, Water Filtration');

  // Filter challenges available for university adoption
  const availableChallenges = challenges.filter(
    (c) =>
      c.status === 'GOVT_VALIDATED' ||
      c.status === 'UNIVERSITY_MATCHED' ||
      c.status === 'DEPARTMENT_ROUTED'
  );

  const handleOpenAdopt = (challenge: Challenge) => {
    setTargetChallengeToAdopt(challenge);
    setProjTitle(`R&D Solution: ${challenge.title}`);
    setProjAbstract(
      `University engineering project to research, prototype, and field pilot a localized solution for ${challenge.location.district} district.`
    );
    setIsAdoptModalOpen(true);
  };

  const handleConfirmAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChallengeToAdopt) return;

    const newProj = await adoptChallengeProject({
      challengeId: targetChallengeToAdopt.id,
      universityId: selectedUniId,
      title: projTitle,
      abstract: projAbstract,
      facultyMentorName: facultyName,
      facultyMentorEmail: 'faculty.mentor@univ.ac.in',
      initialStudentName: leadStudentName,
      initialStudentDepartment: leadStudentDept
    });

    if (newProj) {
      setIsAdoptModalOpen(false);
      setSelectedProjectForView(newProj);
      setActiveTab('PROJECTS');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForView || !newMemberName) return;

    await addProjectMember(selectedProjectForView.id, {
      name: newMemberName,
      role: newMemberRole,
      department: newMemberDept,
      skills: newMemberSkill.split(',').map((s) => s.trim())
    });

    setIsAddMemberOpen(false);
    setNewMemberName('');
  };

  const stages: Project['currentStage'][] = [
    'TEAM_FORMATION',
    'PROPOSAL',
    'PROTOTYPE_BUILD',
    'LAB_TESTING',
    'PILOT_DEPLOYMENT',
    'IMPACT_VERIFICATION',
    'COMPLETED'
  ];

  const getStageName = (s: Project['currentStage']) => {
    switch (s) {
      case 'TEAM_FORMATION':
        return '1. Team Formation';
      case 'PROPOSAL':
        return '2. Proposal';
      case 'PROTOTYPE_BUILD':
        return '3. Prototype Build';
      case 'LAB_TESTING':
        return '4. Lab Testing';
      case 'PILOT_DEPLOYMENT':
        return '5. Pilot Deployed';
      case 'IMPACT_VERIFICATION':
        return '6. Impact Audit';
      case 'COMPLETED':
        return '7. Completed';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* University Portal Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Higher Education &amp; Technical Research Hub
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Connecting State Societal Challenges to Engineering Students, Faculty Mentors, and Multidisciplinary Labs
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'PROJECTS'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Active R&amp;D Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('AVAILABLE_CHALLENGES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'AVAILABLE_CHALLENGES'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Available Challenges ({availableChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab('INSTITUTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'INSTITUTIONS'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Participating HEIs ({universities.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE PROJECTS & WORKSPACE */}
      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Sidebar List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
              Select Project Workspace
            </div>
            {projects.map((proj) => {
              const isSelected = selectedProjectForView?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectForView(proj)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-stone-500">{proj.id}</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {getStageName(proj.currentStage)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900 line-clamp-2">
                    {proj.title}
                  </h3>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>{proj.universityName}</span>
                    <span className="font-medium text-emerald-700">
                      {proj.members.length} Members
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Project Detail Workspace */}
          {selectedProjectForView ? (
            <div className="lg:col-span-2 space-y-5 bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
              {/* Project Header */}
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {selectedProjectForView.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Stage: {getStageName(selectedProjectForView.currentStage)}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-stone-900">
                  {selectedProjectForView.title}
                </h2>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedProjectForView.abstract}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span>
                    <strong>Institution:</strong> {selectedProjectForView.universityName}
                  </span>
                  <span>&bull;</span>
                  <span>
                    <strong>Faculty Lead:</strong> {selectedProjectForView.facultyMentorName}
                  </span>
                  <span>&bull;</span>
                  <button
                    onClick={() => onSelectChallenge(selectedProjectForView.challengeId)}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    View Original Challenge ({selectedProjectForView.challengeId})
                  </button>
                </div>
              </div>

              {/* Lifecycle Stage Progression Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Project R&amp;D Lifecycle Stepper
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Advance stage as lab and field evidence is verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center">
                  {stages.map((stg, idx) => {
                    const currentIdx = stages.indexOf(selectedProjectForView.currentStage);
                    const isPast = idx < currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <button
                        key={stg}
                        onClick={async () => {
                          await updateProjectStage(selectedProjectForView.id, stg);
                          setSelectedProjectForView({
                            ...selectedProjectForView,
                            currentStage: stg
                          });
                        }}
                        className={`p-2 rounded-lg text-[10px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isPast
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        }`}
                      >
                        <div>{idx + 1}</div>
                        <div className="truncate">{stg.replace(/_/g, ' ')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multidisciplinary Team Members */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Multidisciplinary Project Team ({selectedProjectForView.members.length})
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Cross-departmental collaboration (Computer Science, Civil, Electrical, Bio)
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProjectForView.members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                            {m.role.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600">{m.department}</div>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {m.skills.map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-white text-stone-600 border border-stone-200"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones & Deliverables */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Milestones &amp; R&amp;D Deliverables
                </h4>

                <div className="space-y-2">
                  {selectedProjectForView.milestones.map((m) => {
                    const isApproved = m.status === 'APPROVED' || m.status === 'COMPLETED';
                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-lg border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isApproved
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isApproved ? '✓' : '•'}
                            </span>
                            <span className="font-bold text-stone-900">{m.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                              {m.stage}
                            </span>
                          </div>
                          <p className="text-stone-600 text-[11px] pl-6">{m.description}</p>
                          {m.comments && (
                            <div className="text-[11px] text-emerald-800 pl-6 italic">
                              Review: {m.comments}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2 pl-6 sm:pl-0">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.status}
                          </span>

                          {!isApproved && (
                            <button
                              onClick={async () => {
                                await updateMilestoneStatus(
                                  selectedProjectForView.id,
                                  m.id,
                                  { status: 'APPROVED' }
                                );
                                m.status = 'APPROVED';
                                setSelectedProjectForView({ ...selectedProjectForView });
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-500 transition-colors"
                            >
                              Sign-off
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-xl p-12 text-center border border-dashed border-stone-300 text-xs text-stone-500">
              Select a project from the left list to open its active R&amp;D workspace.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: AVAILABLE CHALLENGES FOR UNIVERSITY ADOPTION */}
      {activeTab === 'AVAILABLE_CHALLENGES' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <div>
              <span className="font-bold">Validated Societal Challenges:</span> These challenges have been officially reviewed by the Jharkhand Administration and are ready for university teams to adopt.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChallenges.map((ch) => (
              <div
                key={ch.id}
                className="bg-white rounded-xl p-5 border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-stone-500">{ch.id}</span>
                    <span className="font-semibold text-emerald-800">
                      {ch.location.district} &bull; {ch.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900">{ch.title}</h3>
                  <p className="text-xs text-stone-600 line-clamp-3">{ch.description}</p>

                  {ch.aiAnalysis && (
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                      <div className="font-semibold text-stone-800">Required Disciplines:</div>
                      <div className="flex flex-wrap gap-1">
                        {ch.aiAnalysis.required_expertise.map((exp) => (
                          <span
                            key={exp}
                            className="px-1.5 py-0.2 rounded bg-white text-stone-700 border border-stone-200"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectChallenge(ch.id)}
                    className="text-xs text-stone-600 hover:text-stone-900 font-semibold"
                  >
                    View Problem Details
                  </button>

                  <button
                    onClick={() => handleOpenAdopt(ch)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Adopt Challenge &amp; Form Team</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: PARTICIPATING HEIs & LAB DIRECTORY */}
      {activeTab === 'INSTITUTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {universities.map((uni) => (
            <div
              key={uni.id}
              className="bg-white rounded-xl p-5 border border-stone-200 shadow-2xs space-y-4"
            >
              <div className="space-y-1 border-b border-stone-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-stone-500">
                    {uni.id}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {uni.existingProjectsCount} SETU Projects &bull; {uni.patentsCount} Patents
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900">{uni.name}</h3>
                <p className="text-xs text-stone-500">{uni.location} &bull; {uni.district}</p>
              </div>

              {/* Labs & Research Facilities */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                    Specialized Research Labs:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {uni.labs.map((lab) => (
                      <span
                        key={lab}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700"
                      >
                        {lab}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    Faculty Expertise &amp; Focus:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {uni.facultyExpertise.map((exp) => (
                      <span
                        key={exp}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Incubation Center:</span>{' '}
                  {uni.incubationCentre}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADOPT CHALLENGE MODAL */}
      {isAdoptModalOpen && targetChallengeToAdopt && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-stone-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Adopt Challenge &amp; Initiate Solution Project
                </h3>
                <p className="text-[11px] text-stone-500">
                  Register as an official university R&amp;D initiative
                </p>
              </div>
              <button
                onClick={() => setIsAdoptModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmAdopt} className="space-y-3">
              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Participating University
                </label>
                <select
                  value={selectedUniId}
                  onChange={(e) => setSelectedUniId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Technical Abstract / Methodology
                </label>
                <textarea
                  rows={3}
                  value={projAbstract}
                  onChange={(e) => setProjAbstract(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">
                    Faculty Mentor Name
                  </label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-800 block mb-1">
                    Lead Student Name
                  </label>
                  <input
                    type="text"
                    value={leadStudentName}
                    onChange={(e) => setLeadStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdoptModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  Initiate R&amp;D Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-stone-200 shadow-2xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-stone-900 border-b pb-2">
              Add Multidisciplinary Team Member
            </h3>

            <form onSubmit={handleAddMember} className="space-y-2.5">
              <div>
                <label className="font-semibold text-stone-800 block mb-1">Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Rahul Soren"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="STUDENT_COLLABORATOR">Student Collaborator</option>
                  <option value="FACULTY_MENTOR">Faculty Co-Mentor</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Department</label>
                <select
                  value={newMemberDept}
                  onChange={(e) => setNewMemberDept(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Civil & Environmental Engineering">Civil &amp; Environmental Engineering</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Agronomy & Soil Science">Agronomy &amp; Soil Science</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMemberSkill}
                  onChange={(e) => setNewMemberSkill(e.target.value)}
                  placeholder="e.g. Circuit design, LoRaWAN, 3D printing"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
