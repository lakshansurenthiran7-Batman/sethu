/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Search, Filter, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface AuditTrailModalProps {
  onClose: () => void;
  onSelectChallenge: (id: string) => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  onClose,
  onSelectChallenge
}) => {
  const { auditLogs } = useApp();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredLogs = auditLogs.filter((l) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const str = `${l.action} ${l.actorName} ${l.actorRole} ${l.entityId} ${JSON.stringify(l.details)}`.toLowerCase();
    return str.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                SETU Immutable Governance Audit Trail
              </h3>
              <p className="text-[11px] text-stone-500">
                Transparent verification log of citizen submissions, AI assessments &amp; officer directives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-stone-50 border-b border-stone-100">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by action, actor, entity ID, or details..."
            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
          />
        </div>

        {/* Logs Timeline */}
        <div className="divide-y divide-stone-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-stone-50/70 transition-colors space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                    {log.action}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-800 font-semibold">
                    {log.entityId}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="text-stone-700">
                Actor: <strong className="text-stone-900">{log.actorName}</strong> (
                <span className="text-stone-500">{log.actorRole}</span>)
              </div>

              {log.details && (
                <div className="p-2 rounded bg-stone-50 border border-stone-200/80 font-mono text-[10px] text-stone-600 overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </div>
              )}

              {log.entityType === 'CHALLENGE' && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectChallenge(log.entityId);
                  }}
                  className="text-[11px] text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Inspect Associated Challenge</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-10 text-center text-stone-400">
              No audit records found matching your filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
