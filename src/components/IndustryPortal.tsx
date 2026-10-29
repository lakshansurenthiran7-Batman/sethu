/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  HeartHandshake,
  Building2,
  DollarSign,
  Wrench,
  CheckCircle2,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Award,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Project, CollaborationType } from '../types.js';

export const IndustryPortal: React.FC = () => {
  const { projects, currentUser, offerCollaboration } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [partnerType, setPartnerType] = useState<any>('INDUSTRY');
  const [supportTypes, setSupportTypes] = useState<CollaborationType[]>(['EQUIPMENT', 'MENTORSHIP']);
  const [committedAmount, setCommittedAmount] = useState<string>('250000');
  const [contactEmail, setContactEmail] = useState<string>(currentUser.email);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // All active partnerships across projects
  const allCollaborations = projects.flatMap((p) =>
    p.collaborations.map((c) => ({
      ...c,
      projectTitle: p.title,
      universityName: p.universityName
    }))
  );

  const toggleSupportType = (type: CollaborationType) => {
    if (supportTypes.includes(type)) {
      setSupportTypes(supportTypes.filter((t) => t !== type));
    } else {
      setSupportTypes([...supportTypes, type]);
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    setIsSubmitting(true);
    try {
      const ok = await offerCollaboration(selectedProjectId, {
        partnerName: currentUser.organization || currentUser.name,
        partnerType,
        supportTypes,
        committedAmount: Number(committedAmount) || 0,
        contactPerson: currentUser.name,
        contactEmail,
        notes
      });

      if (ok) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 4000);
        setNotes('');
      }
    } catch (err) {
      console.error(err);
      alert('Error offering collaboration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportOptions: { id: CollaborationType; label: string; desc: string }[] = [
    { id: 'MENTORSHIP', label: 'Technical Mentorship', desc: 'Industry domain experts guide student research' },
    { id: 'TESTING_FACILITY', label: 'Testing Lab Access', desc: 'Certify prototypes in advanced industrial testing facilities' },
    { id: 'EQUIPMENT', label: 'Hardware & Materials', desc: 'Sponsor valves, solar panels, microcontrollers, or testbeds' },
    { id: 'FUNDING', label: 'CSR Grant / Funding', desc: 'Financial sponsorship for deployment and scaling' },
    { id: 'PILOT_SITE', label: 'Industrial / Field Pilot Site', desc: 'Provide physical plant or mine void test environment' },
    { id: 'TECH_TRANSFER', label: 'Tech Transfer / Licensing', desc: 'Commercialize student patent for state-wide manufacturing' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Industry Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Briefcase className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Industry, MSME, Startup &amp; CSR Collaboration Hub
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Empower Jharkhand University Prototypes with Corporate Sponsorship, Testing Labs, CSR Grants &amp; Technology Transfer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs hidden sm:block">
            <div className="font-bold text-stone-900">14 Active Industry Partners</div>
            <div className="text-stone-500">Tata Steel &bull; Bokaro Slag MSME &bull; Adityapur Hub</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration Offer Form */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="space-y-1 border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Offer Support to a Student Project</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Partnering as: <strong className="text-stone-800">{currentUser.organization || currentUser.name}</strong>
            </p>
          </div>

          {isSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Collaboration offer successfully submitted to University Dean R&amp;D!</span>
            </div>
          )}

          <form onSubmit={handleOfferSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">Target Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.title.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">Partner Classification</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
              >
                <option value="INDUSTRY">Large Industry (Tata Steel, SAIL, Coal India)</option>
                <option value="CSR_FOUNDATION">CSR Foundation</option>
                <option value="STARTUP">Incubated DeepTech Startup</option>
                <option value="MSME">Local Jharkhand MSME</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1.5">
                Support Modalities (Select all that apply)
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {supportOptions.map((opt) => {
                  const isChecked = supportTypes.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => toggleSupportType(opt.id)}
                      className={`p-2 rounded-lg text-left border flex items-start gap-2 transition-colors ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                      />
                      <div>
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 font-normal">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Committed Value / Grant (₹ INR)
              </label>
              <input
                type="number"
                value={committedAmount}
                onChange={(e) => setCommittedAmount(e.target.value)}
                placeholder="250000"
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Specific Offering Details &amp; Equipment
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Provide SS316 filter housing, solar MPPT controller, or lab spectrometer testing time..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Partnership Pledge</span>
            </button>
          </form>
        </div>

        {/* Active Industry & CSR Commitments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Active Industry &amp; CSR Commitments ({allCollaborations.length})
            </h3>
            <span className="text-[11px] text-stone-500">
              Total Private Capital Mobilized: <strong className="text-emerald-800 font-mono">₹6,30,000</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allCollaborations.map((col) => (
              <div
                key={col.id}
                className="bg-white rounded-xl p-5 border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {col.partnerName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {col.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500">
                    Supporting Project: <strong className="text-stone-800">{col.projectTitle}</strong> ({col.universityName})
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-700">Financial / In-kind Value:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{col.committedAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 italic">
                      "{col.notes || 'Industrial technical mentorship and lab validation support.'}"
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {col.supportTypes.map((st) => (
                      <span
                        key={st}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium"
                      >
                        {st.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Contact: {col.contactPerson}</span>
                  <span className="text-emerald-700 font-semibold">{col.contactEmail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
