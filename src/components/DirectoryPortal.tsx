/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Building,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Layers,
  Phone,
  Mail,
  HelpCircle,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { JharkhandDepartment } from '../types.js';

export const DirectoryPortal: React.FC = () => {
  const { departments, challenges } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Interactive Classification Match Tester State
  const [testDomain, setTestDomain] = useState('Drinking Water');
  const [testSubDomain, setTestSubDomain] = useState('Rural Piped Water Supply');
  const [testMatchResult, setTestMatchResult] = useState<any>(null);
  const [isQueryingDb, setIsQueryingDb] = useState(false);

  const filtered = departments.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const str = `${d.department_code} ${d.department} ${d.domains.join(' ')} ${d.sub_domains.join(' ')} ${d.address} ${d.officer_name || ''} ${d.designation || ''}`.toLowerCase();
    return str.includes(q);
  });

  const activeDepartment = departments.find((d) => d.id === selectedDeptId) || filtered[0] || null;

  // Challenges routed to this department
  const routedChallenges = challenges.filter(
    (c) => c.assignedDepartmentId === activeDepartment?.id || c.aiAnalysis?.domain === activeDepartment?.department
  );

  // Test retrieval from the 'jharkhand_department_directory' database table
  const handleTestClassificationLookup = async () => {
    setIsQueryingDb(true);
    try {
      const res = await fetch('/api/department-directory/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: testDomain, sub_domain: testSubDomain })
      });
      const data = await res.json();
      setTestMatchResult(data);
      if (data.matched_department) {
        setSelectedDeptId(data.matched_department.id);
      }
    } catch (err) {
      console.error('Failed to query department directory by classification:', err);
    } finally {
      setIsQueryingDb(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Directory Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Jharkhand Official Department Directory
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Database Table: <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-semibold">jharkhand_department_directory</code> &bull; 27 State Government Departments &bull; Authoritative Administrative Hierarchy
          </p>
        </div>

        {/* Directory Schema & Rule 5 Notice */}
        <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 max-w-md space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Database-Grounded Routing Guarantee</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            All department designations, officer credentials, and nodal contact endpoints are strictly queried from the official SQLite table. The AI never invents or hardcodes government contacts.
          </p>
        </div>
      </div>

      {/* Interactive Domain / Sub-Domain Classification Lookup Tool */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white rounded-xl p-5 border border-indigo-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-indigo-950">
                AI Classification &bull; Dynamic Department Lookup Test Tool
              </h3>
              <p className="text-xs text-indigo-700">
                Simulate domain &amp; sub-domain classification routing to query the <code className="font-mono">jharkhand_department_directory</code> table in real time.
              </p>
            </div>
          </div>
          <button
            onClick={handleTestClassificationLookup}
            disabled={isQueryingDb}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isQueryingDb ? (
              <span>Querying Database...</span>
            ) : (
              <>
                <span>Execute Database Query</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Sample Domain:
            </label>
            <select
              value={testDomain}
              onChange={(e) => setTestDomain(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Drinking Water">Drinking Water &amp; Sanitation</option>
              <option value="Agriculture">Agriculture &amp; Animal Husbandry</option>
              <option value="Road Construction">Road Construction &amp; Highways</option>
              <option value="Energy">Energy &amp; Renewable Power</option>
              <option value="Healthcare">Health &amp; Family Welfare</option>
              <option value="Disaster Management">Home &amp; Disaster Management</option>
              <option value="Higher Education">Higher and Technical Education</option>
              <option value="Mines & Geology">Mines &amp; Geology</option>
              <option value="Urban Development">Urban Development &amp; Housing</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Sample Sub-Domain:
            </label>
            <input
              type="text"
              value={testSubDomain}
              onChange={(e) => setTestSubDomain(e.target.value)}
              placeholder="e.g. Rural Piped Water Supply, Solar Mini-grids..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <div className="w-full flex flex-wrap gap-1.5">
              <span className="text-[10px] text-stone-500 self-center mr-1">Quick presets:</span>
              <button
                type="button"
                onClick={() => { setTestDomain('Drinking Water'); setTestSubDomain('Rural Piped Water Supply'); }}
                className="text-[10px] px-2 py-1 rounded bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 font-medium"
              >
                Water Supply
              </button>
              <button
                type="button"
                onClick={() => { setTestDomain('Agriculture'); setTestSubDomain('Crop Production'); }}
                className="text-[10px] px-2 py-1 rounded bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 font-medium"
              >
                Agriculture
              </button>
              <button
                type="button"
                onClick={() => { setTestDomain('Road Construction'); setTestSubDomain('State Highways'); }}
                className="text-[10px] px-2 py-1 rounded bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 font-medium"
              >
                Roads &amp; Culverts
              </button>
              <button
                type="button"
                onClick={() => { setTestDomain('Energy'); setTestSubDomain('Solar Mini-grids'); }}
                className="text-[10px] px-2 py-1 rounded bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 font-medium"
              >
                Solar Grids
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Query Results Box */}
        {testMatchResult?.matched_department && (
          <div className="p-3.5 rounded-lg bg-white border border-indigo-200 shadow-2xs space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-indigo-950">
                  Database Query Match: {testMatchResult.matched_department.department}
                </span>
                <span className="font-mono text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-bold">
                  {testMatchResult.matched_department.department_code}
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                Verified: {testMatchResult.matched_department.last_verified}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-stone-500 block">Nodal Officer:</span>
                <span className="font-semibold text-stone-900">
                  {testMatchResult.matched_department.officer_name || 'Designated Secretary'}
                </span>
                <span className="text-stone-600 block text-[10px]">{testMatchResult.matched_department.designation}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Contact Endpoint:</span>
                <span className="font-mono text-emerald-800 font-medium">
                  {testMatchResult.matched_department.emails?.[0]}
                </span>
                <span className="text-stone-600 block text-[10px]">
                  Phone: {testMatchResult.matched_department.phone_numbers?.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Official Secretariat:</span>
                <span className="text-stone-800 leading-tight block">
                  {testMatchResult.matched_department.address}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by department, code (e.g. DWSD, HTED), domain, officer name, or address..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department List */}
        <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filtered.map((dept) => {
            const isSelected = activeDepartment?.id === dept.id;
            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-stone-500">{dept.department_code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                    {dept.id}
                  </span>
                </div>

                <div className="text-xs font-bold text-stone-900 line-clamp-1">
                  {dept.department}
                </div>

                {dept.officer_name && (
                  <div className="text-[11px] text-stone-600 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{dept.officer_name}</span>
                  </div>
                )}

                <div className="text-[11px] text-stone-500 truncate">
                  Domain: {dept.domains.join(', ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Department Details */}
        {activeDepartment ? (
          <div className="lg:col-span-2 space-y-5 bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded">
                  {activeDepartment.department_code} &bull; {activeDepartment.id}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {activeDepartment.is_active ? 'Active State Directory Record' : 'Archived'}
                </span>
              </div>

              <h2 className="text-lg font-bold text-stone-900">
                {activeDepartment.department}
              </h2>

              <p className="text-xs text-stone-600">
                <strong>Primary Domains:</strong> {activeDepartment.domains.join(', ')}
              </p>
            </div>

            {/* Officer & Secretariat Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-bold text-stone-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Designated Administrative Head</span>
                </div>
                <div className="text-stone-900 font-semibold">{activeDepartment.officer_name || 'Designated Secretary / HOD'}</div>
                <div className="text-stone-500 text-[11px]">{activeDepartment.designation || 'Principal Secretary / Director'}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-stone-500" />
                  <span>Administrative Secretariat Address</span>
                </div>
                <div className="text-stone-900 font-medium">{activeDepartment.address}</div>
                <div className="text-stone-500 text-[11px]">{activeDepartment.district ? `${activeDepartment.district}, Jharkhand` : 'State Secretariat, Ranchi, Jharkhand'}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span>Official Emails</span>
                </div>
                <div className="text-emerald-800 font-mono text-[11px] space-y-0.5">
                  {activeDepartment.emails.map((em) => (
                    <div key={em}>{em}</div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>Contact Phone Numbers</span>
                </div>
                <div className="text-stone-800 font-mono text-[11px] space-y-0.5">
                  {activeDepartment.phone_numbers.map((ph) => (
                    <div key={ph}>{ph}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-domains */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Functional Sub-Domains Under Purview
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeDepartment.sub_domains.map((sd) => (
                  <span
                    key={sd}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                  >
                    {sd}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="space-y-1 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <div>
                <span className="font-semibold text-stone-700">Database Table:</span>{' '}
                <code className="font-mono text-stone-700">jharkhand_department_directory</code> (id: {activeDepartment.id})
              </div>
              <div>
                <span className="font-semibold text-stone-700">Official Source:</span>{' '}
                <a
                  href={activeDepartment.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>{activeDepartment.source}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <span className="font-semibold text-stone-700">Last Verified:</span>{' '}
                {activeDepartment.last_verified}
              </div>
            </div>

            {/* Routed Challenges */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 uppercase tracking-wider">
                  Active SETU Challenges Routed to this Department ({routedChallenges.length})
                </span>
              </div>

              <div className="space-y-1.5">
                {routedChallenges.map((rc) => (
                  <div
                    key={rc.id}
                    className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-stone-900">{rc.title}</div>
                      <div className="text-[11px] text-stone-500">
                        {rc.id} &bull; {rc.location.district} &bull; Status: {rc.status.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Validated
                    </span>
                  </div>
                ))}

                {routedChallenges.length === 0 && (
                  <div className="text-[11px] text-stone-500 italic py-2">
                    No active challenges currently routed to this department.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
