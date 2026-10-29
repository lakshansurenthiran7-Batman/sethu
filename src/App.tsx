/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Header } from './components/Header.js';
import { DemoScenarioBar } from './components/DemoScenarioBar.js';
import { CitizenPortal } from './components/CitizenPortal.js';
import { GovernmentPortal } from './components/GovernmentPortal.js';
import { UniversityPortal } from './components/UniversityPortal.js';
import { IndustryPortal } from './components/IndustryPortal.js';
import { DirectoryPortal } from './components/DirectoryPortal.js';
import { ImpactAnalyticsPortal } from './components/ImpactAnalyticsPortal.js';
import { ChallengeDetailModal } from './components/ChallengeDetailModal.js';
import { NotificationsModal } from './components/NotificationsModal.js';
import { AuditTrailModal } from './components/AuditTrailModal.js';
import { GeminiChatbotModal } from './components/GeminiChatbotModal.js';
import { MapsGroundingModal } from './components/MapsGroundingModal.js';
import { LiveCameraCapture } from './components/LiveCameraCapture.js';
import { APIProvider } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

function MainApp() {
  const {
    dataError,
    refreshData,
    isLoading,
    currentView,
    selectedChallengeId,
    setSelectedChallengeId,
    selectedProjectId,
    setSelectedProjectId
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMapsOpen, setIsMapsOpen] = useState(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Official Top Bar & Navigation */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenMaps={() => setIsMapsOpen(true)}
        onOpenLiveCamera={() => setIsLiveCameraOpen(true)}
      />

      {/* SIH 2026 17-Step Demo Scenario Walkthrough Bar */}
      <DemoScenarioBar />

      {dataError && (
        <div role="alert" className="mx-4 my-4 flex items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <span>{dataError}</span>
          <button type="button" onClick={() => refreshData()} disabled={isLoading} className="font-semibold underline disabled:opacity-50">
            {isLoading ? 'Loading…' : 'Try again'}
          </button>
        </div>
      )}

      {/* Active Main Portal View */}
      <main className="flex-1 pb-12">
        {currentView === 'CITIZEN' && (
          <CitizenPortal onSelectChallenge={(id) => setSelectedChallengeId(id)} />
        )}
        {currentView === 'GOVERNMENT' && (
          <GovernmentPortal onSelectChallenge={(id) => setSelectedChallengeId(id)} />
        )}
        {currentView === 'UNIVERSITY' && (
          <UniversityPortal
            onSelectChallenge={(id) => setSelectedChallengeId(id)}
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        )}
        {currentView === 'INDUSTRY' && <IndustryPortal />}
        {currentView === 'DIRECTORY' && <DirectoryPortal />}
        {currentView === 'ANALYTICS' && <ImpactAnalyticsPortal />}
      </main>

      {/* Modals */}
      {selectedChallengeId && (
        <ChallengeDetailModal
          challengeId={selectedChallengeId}
          onClose={() => setSelectedChallengeId(null)}
          onOpenProject={(projId) => {
            setSelectedChallengeId(null);
            setSelectedProjectId(projId);
          }}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          onClose={() => setIsNotificationsOpen(false)}
          onSelectChallenge={(id) => {
            setIsNotificationsOpen(false);
            setSelectedChallengeId(id);
          }}
        />
      )}

      {isAuditLogsOpen && (
        <AuditTrailModal
          onClose={() => setIsAuditLogsOpen(false)}
          onSelectChallenge={(id) => {
            setIsAuditLogsOpen(false);
            setSelectedChallengeId(id);
          }}
        />
      )}

      {/* Global SETU AI Chatbot Modal */}
      {isChatbotOpen && (
        <GeminiChatbotModal onClose={() => setIsChatbotOpen(false)} />
      )}

      {/* Global Google Maps Grounding Modal */}
      {isMapsOpen && (
        <MapsGroundingModal onClose={() => setIsMapsOpen(false)} />
      )}

      {/* Global Live Camera Viewfinder Modal */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <LiveCameraCapture
              districtHint="Ranchi"
              onCapture={(res) => {
                alert(
                  `Live Camera Evidence frame captured successfully!\nTimestamp: ${res.capturedAt}\nGPS: ${res.lat || '23.344'}° N, ${res.lng || '85.309'}° E\nDiagnosis: ${res.analysis?.observations || 'Field frame verified'}`
                );
                setIsLiveCameraOpen(false);
              }}
              onCancel={() => setIsLiveCameraOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Official Government Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
              सेतु
            </div>
            <div>
              <div className="text-white font-semibold">
                SETU: Societal Innovation Collaboration Portal
              </div>
              <div className="text-stone-400 text-[11px]">
                Department of Higher &amp; Technical Education, Government of Jharkhand
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-stone-400 space-y-0.5">
            <div>Theme: Smart Education &bull; Category: Software &bull; State Innovation Council</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      language="en"
      region="IN"
      libraries={['places', 'geometry', 'marker']}
    >
      <AppProvider>
        <MainApp />
      </AppProvider>
    </APIProvider>
  );
}
