/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Info,
  PlayCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface ScenarioStep {
  stepNumber: number;
  title: string;
  role: string;
  targetView: 'CITIZEN' | 'GOVERNMENT' | 'UNIVERSITY' | 'INDUSTRY' | 'DIRECTORY' | 'ANALYTICS';
  summary: string;
  actionHint: string;
}

const DEMO_STEPS: ScenarioStep[] = [
  {
    stepNumber: 1,
    title: 'Citizen Reports Challenge',
    role: 'CITIZEN (Rameshwar Munda)',
    targetView: 'CITIZEN',
    summary: 'Citizen reports drinking water crisis in Dorma village, Khunti district where women walk 3 km daily.',
    actionHint: 'Review submitted challenge or click "Report New Challenge" to simulate input.'
  },
  {
    stepNumber: 2,
    title: 'AI Analysis & Innovation Gate',
    role: 'SETU AI Core (gemini-3.8-flash)',
    targetView: 'CITIZEN',
    summary: 'AI extracts domain (Drinking Water), classifies as INNOVATION GAP (rocky plateau requires solar telemetry).',
    actionHint: 'Inspect the AI Analysis card and Innovation Necessity Gate recommendation.'
  },
  {
    stepNumber: 3,
    title: 'Government Officer Validation',
    role: 'GOVERNMENT_OFFICER (Dr. Alok Kumar Verma, IAS)',
    targetView: 'GOVERNMENT',
    summary: 'Officer validates AI domain classification and confirms routing to Dept of Drinking Water & Sanitation.',
    actionHint: 'Switch to Govt Validation tab and review officer decision workflow.'
  },
  {
    stepNumber: 4,
    title: 'Department Directory Retrieval',
    role: 'PLATFORM AUTOMATION',
    targetView: 'DIRECTORY',
    summary: 'Authoritative secretariat contact points retrieved from official Jharkhand directory (Rule 5 compliance).',
    actionHint: 'Search through the 31 official departments and domain mapping.'
  },
  {
    stepNumber: 5,
    title: 'University Capability Matching',
    role: 'PLATFORM MATCHING ENGINE',
    targetView: 'UNIVERSITY',
    summary: 'BIT Mesra matched with 96% score based on Water Resources Lab, IoT Center, and Solar Telemetry capabilities.',
    actionHint: 'View University & R&D tab to see match score breakdown and labs.'
  },
  {
    stepNumber: 6,
    title: 'University Adopts Challenge',
    role: 'UNIVERSITY_ADMIN (Prof. S. N. Sinha)',
    targetView: 'UNIVERSITY',
    summary: 'Dean R&D at BIT Mesra approves project "Jal-Setu: Solar-Powered IoT Water Purification".',
    actionHint: 'Review the active project charter and faculty assignment.'
  },
  {
    stepNumber: 7,
    title: 'Multidisciplinary Team Formation',
    role: 'STUDENTS & FACULTY',
    targetView: 'UNIVERSITY',
    summary: 'Pooja Kumari (CS), Amit Hansda (Civil), and Rahul Soren (ECE) form cross-disciplinary student team.',
    actionHint: 'Inspect the Multidisciplinary Team tab inside project workspace.'
  },
  {
    stepNumber: 8,
    title: 'Faculty Mentorship & Lab Guidance',
    role: 'FACULTY_MENTOR (Dr. Ananya Roy)',
    targetView: 'UNIVERSITY',
    summary: 'Dr. Ananya Roy guides hydraulic flow calculations and water quality testing protocols.',
    actionHint: 'View milestone reviews and technical guidance logs.'
  },
  {
    stepNumber: 9,
    title: 'Solution Proposal Submission',
    role: 'FACULTY & STUDENT LEAD',
    targetView: 'UNIVERSITY',
    summary: 'Team submits 500 LPH multi-stage filtration schematic with LoRaWAN telemetry.',
    actionHint: 'Milestone Stage 2 approved with engineering schematics.'
  },
  {
    stepNumber: 10,
    title: 'Working Prototype Assembly',
    role: 'STUDENT TEAM',
    targetView: 'UNIVERSITY',
    summary: 'Skid-mounted filtration bench prototype assembled with ESP32 sensor rig.',
    actionHint: 'Lab testing milestone marked completed with verified test reports.'
  },
  {
    stepNumber: 11,
    title: 'Industry Mentorship & Equipment',
    role: 'INDUSTRY_PARTNER (Tata Steel Innovation)',
    targetView: 'INDUSTRY',
    summary: 'Tata Steel contributes stainless steel filter housings & Rs. 2.5L equipment sponsorship.',
    actionHint: 'View Industry & CSR tab to see active partnership commitments.'
  },
  {
    stepNumber: 12,
    title: 'CSR Foundation Funding Grant',
    role: 'CSR_ORGANIZATION (Jharkhand Sustainable Futures)',
    targetView: 'INDUSTRY',
    summary: 'CSR Foundation commits Rs. 3.8L grant for solar panels, deep borewell pump, and operator training.',
    actionHint: 'Inspect CSR funding deployment tracking.'
  },
  {
    stepNumber: 13,
    title: 'Field Pilot in Dorma Panchayat',
    role: 'COMMUNITY & STUDENT TEAM',
    targetView: 'UNIVERSITY',
    summary: 'Solar-powered community kiosk installed and commissioned at Dorma Panchayat, Khunti.',
    actionHint: 'Field installation signed off jointly with Block Development Officer.'
  },
  {
    stepNumber: 14,
    title: 'Real-time Water Telemetry Monitoring',
    role: 'STUDENT & FACULTY',
    targetView: 'UNIVERSITY',
    summary: 'Ultrasonic water depth and daily dispensed flow transmitted wirelessly to village dashboard.',
    actionHint: 'Telemetry confirms 4,800 Litres/day dispensed safely.'
  },
  {
    stepNumber: 15,
    title: 'Measurable Social Impact Verification',
    role: 'GOVERNMENT OFFICER & AUDITOR',
    targetView: 'ANALYTICS',
    summary: 'Official audit verifies 1,750 villagers benefited, 350 households covered, and 525 hours saved daily.',
    actionHint: 'View Impact & Analytics tab to see verified social metrics and charts.'
  }
];

export const DemoScenarioBar: React.FC = () => {
  const { setCurrentView, availableUsers, setCurrentUser } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const step = DEMO_STEPS[currentStepIndex];

  const goToStep = (index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStepIndex(index);
      const target = DEMO_STEPS[index];
      setCurrentView(target.targetView);

      // Auto-switch user persona if step specifies
      if (target.role.includes('CITIZEN')) {
        const u = availableUsers.find((x) => x.role === 'CITIZEN');
        if (u) setCurrentUser(u);
      } else if (target.role.includes('GOVERNMENT_OFFICER')) {
        const u = availableUsers.find((x) => x.role === 'GOVERNMENT_OFFICER');
        if (u) setCurrentUser(u);
      } else if (target.role.includes('UNIVERSITY_ADMIN')) {
        const u = availableUsers.find((x) => x.role === 'UNIVERSITY_ADMIN');
        if (u) setCurrentUser(u);
      } else if (target.role.includes('STUDENT')) {
        const u = availableUsers.find((x) => x.role === 'STUDENT');
        if (u) setCurrentUser(u);
      } else if (target.role.includes('INDUSTRY')) {
        const u = availableUsers.find((x) => x.role === 'INDUSTRY_PARTNER');
        if (u) setCurrentUser(u);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Step Counter */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200 font-mono">
                  Step {step.stepNumber} of {DEMO_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                {step.title} &bull; <span className="text-emerald-400">{step.role}</span>
              </p>
            </div>
          </div>

          {/* Quick Step Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToStep(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => goToStep(currentStepIndex + 1)}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-stone-400 hover:text-white px-2 py-1 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Details'}
            </button>
          </div>
        </div>

        {/* Expanded Description & Direct Navigation Bar */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="text-stone-300">
              <span className="font-semibold text-white">Scenario Narrative:</span> {step.summary}{' '}
              <span className="text-emerald-300 ml-1 font-medium">({step.actionHint})</span>
            </div>

            {/* Quick Step Indicators */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  onClick={() => goToStep(idx)}
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-all ${
                    idx === currentStepIndex
                      ? 'bg-emerald-400 text-stone-900 ring-2 ring-emerald-300 ring-offset-1 ring-offset-stone-900'
                      : idx < currentStepIndex
                      ? 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                  title={`Step ${s.stepNumber}: ${s.title}`}
                >
                  {s.stepNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
