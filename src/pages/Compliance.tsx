import React, { useState, useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { complianceDocs, auditLogs } from '../data/analytics';
import { vendors } from '../data/vendors';

const statutoryChecklist = [
  { item: 'SSS Coverage — All deployed workers', status: true, note: '2,847 workers registered' },
  { item: 'PhilHealth Coverage — All deployed workers', status: true, note: '2,847 workers enrolled' },
  { item: 'Pag-IBIG Fund Remittance', status: true, note: 'Up to date — April 2026' },
  { item: 'DOLE Registration — All vendors', status: false, note: '3 vendors pending DOLE registration' },
  { item: 'BIR Withholding Tax Compliance', status: true, note: 'April 2026 filed and paid' },
  { item: 'POEA Clearance (where applicable)', status: true, note: 'All applicable vendors cleared' },
  { item: 'DOLE Establishment Report', status: false, note: 'Annual report due June 30, 2026' },
  { item: 'OSH Compliance — Work safety standards', status: true, note: 'Last inspection: March 2026' },
  { item: 'Data Privacy Act (RA 10173) compliance', status: true, note: 'DPO registered, privacy policy updated' },
  { item: 'Anti-Red Tape Act compliance', status: true, note: 'Online accreditation portal active' },
];

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

interface ComplianceAlert {
  vendorId: string;
  vendorName: string;
  docName: string;
  expiryDate: string;
  daysLeft: number;
  severity: AlertSeverity;
}

const ALERT_VISIBLE_COUNT = 5;

const severityConfig: Record<AlertSeverity, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200' },
  high:     { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  low:      { label: 'Low',      bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' },
};

const severityOrder: AlertSeverity[] = ['critical', 'high', 'medium', 'low'];

function buildAlerts(): ComplianceAlert[] {
  const now = new Date();
  const alerts: ComplianceAlert[] = [];

  for (const vendor of vendors) {
    if (vendor.status !== 'Accredited' && vendor.status !== 'Pending') continue;
    for (const doc of vendor.documents) {
      if (!doc.expiryDate) continue;
      const daysLeft = Math.ceil((new Date(doc.expiryDate).getTime() - now.getTime()) / 86400000);
      let severity: AlertSeverity | null = null;
      if (daysLeft < 0)        severity = 'critical';
      else if (daysLeft <= 30) severity = 'high';
      else if (daysLeft <= 60) severity = 'medium';
      else if (daysLeft <= 90) severity = 'low';
      if (severity) {
        alerts.push({ vendorId: vendor.id, vendorName: vendor.companyName, docName: doc.name, expiryDate: doc.expiryDate, daysLeft, severity });
      }
    }
  }

  alerts.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity) || a.daysLeft - b.daysLeft);
  return alerts;
}

function ActiveAlertsPanel() {
  const alerts = useMemo(() => buildAlerts(), []);
  const [expanded, setExpanded] = useState(false);
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const visible = expanded ? alerts : alerts.slice(0, ALERT_VISIBLE_COUNT);
  const hiddenCount = alerts.length - ALERT_VISIBLE_COUNT;

  function handleNotify(key: string) {
    setNotified(prev => new Set(prev).add(key));
    setTimeout(() => {
      setNotified(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 3000);
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <CheckCircle size={20} className="text-green-600 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium text-green-800">All documents current — no alerts</p>
      </div>
    );
  }

  return (
    <Card padding={false}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Bell size={18} className="text-asianow-red flex-shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Active Alerts</h2>
            <p className="text-xs text-gray-500">Document expiry alerts across accredited and pending vendors</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Alert rows */}
      <div className="divide-y divide-gray-50" role="list" aria-label="Compliance alerts">
        {visible.map((alert) => {
          const key = `${alert.vendorId}-${alert.docName}`;
          const cfg = severityConfig[alert.severity];
          const isSent = notified.has(key);
          return (
            <div
              key={key}
              role="listitem"
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3.5 hover:bg-gray-50 transition-colors"
            >
              {/* Severity badge */}
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border} w-[72px] justify-center flex-shrink-0`}>
                {cfg.label}
              </span>

              {/* Vendor & document */}
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{alert.vendorName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <FileText size={11} aria-hidden="true" />
                  {alert.docName}
                </p>
              </div>

              {/* Expiry info */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">Expiry: {alert.expiryDate}</p>
                <p className={`text-xs font-semibold mt-0.5 ${alert.daysLeft < 0 ? 'text-red-600' : cfg.text}`}>
                  {alert.daysLeft < 0 ? 'EXPIRED' : `${alert.daysLeft} day${alert.daysLeft !== 1 ? 's' : ''} remaining`}
                </p>
              </div>

              {/* Notify button */}
              {isSent ? (
                <span className="text-xs font-semibold text-green-600 w-28 text-center flex-shrink-0">
                  Sent ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNotify(key)}
                  className="w-28 flex-shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-asianow-blue focus:ring-offset-1"
                  aria-label={`Notify ${alert.vendorName} about ${alert.docName}`}
                >
                  Notify Vendor
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more / show less toggle */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-gray-100 text-xs font-medium text-asianow-blue hover:bg-blue-50 transition-colors rounded-b-xl focus:outline-none focus:ring-2 focus:ring-asianow-blue focus:ring-offset-1"
          aria-expanded={expanded}
        >
          {expanded ? (
            <><ChevronUp size={14} aria-hidden="true" /> Show less</>
          ) : (
            <><ChevronDown size={14} aria-hidden="true" /> Show {hiddenCount} more</>
          )}
        </button>
      )}
    </Card>
  );
}

export const Compliance: React.FC = () => {
  const [docFilter, setDocFilter] = useState('All');

  const filteredDocs = complianceDocs
    .filter(d => docFilter === 'All' || d.status === docFilter)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const complianceScores = vendors
    .filter(v => v.status === 'Accredited')
    .map(v => ({ name: v.companyName, score: v.complianceScore, region: v.region }))
    .sort((a, b) => b.score - a.score);

  const expiringSoon = complianceDocs.filter(d => d.status === 'Expiring Soon').length;
  const expired = complianceDocs.filter(d => d.status === 'Expired').length;
  const valid = complianceDocs.filter(d => d.status === 'Valid').length;

  return (
    <div className="space-y-6" aria-label="Compliance">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">Document expiry tracking, compliance scores, and audit logs</p>
      </div>

      {/* Active Alerts — item 8.6 */}
      <ActiveAlertsPanel />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Valid Documents', value: valid, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Expiring Soon', value: expiringSoon, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Expired Documents', value: expired, icon: AlertTriangle, color: 'text-asianow-red', bg: 'bg-red-50' },
          { label: 'Avg Compliance Score', value: `${Math.round(complianceScores.reduce((s, v) => s + v.score, 0) / complianceScores.length)}%`, icon: Shield, color: 'text-asianow-blue', bg: 'bg-blue-50' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`} aria-hidden="true">
                <s.icon size={20} className={s.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Document Expiry Tracker */}
      <Card padding={false}>
        <div className="p-6 pb-3 flex items-center justify-between">
          <CardHeader title="Document Expiry Tracker" subtitle="Compliance documents across all vendors" />
          <Select
            value={docFilter}
            onChange={e => setDocFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Documents' },
              { value: 'Valid', label: 'Valid' },
              { value: 'Expiring Soon', label: 'Expiring Soon' },
              { value: 'Expired', label: 'Expired' },
            ]}
            aria-label="Filter documents by status"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Document expiry tracker">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Document Type</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Expiry Date</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Days Until Expiry</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    doc.status === 'Expired' ? 'bg-red-50/40' :
                    doc.status === 'Expiring Soon' ? 'bg-yellow-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-[120px] md:max-w-none truncate">{doc.vendorName}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-700">{doc.docType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{doc.expiryDate}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`font-semibold ${
                      doc.daysUntilExpiry < 0 ? 'text-red-600' :
                      doc.daysUntilExpiry <= 60 ? 'text-yellow-600' : 'text-gray-700'
                    }`}>
                      {doc.daysUntilExpiry < 0
                        ? `${Math.abs(doc.daysUntilExpiry)} days ago`
                        : `${doc.daysUntilExpiry} days`
                      }
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={doc.status} /></td>
                  <td className="py-3 px-4 text-xs hidden lg:table-cell">
                    {doc.status === 'Expired'
                      ? <span className="text-red-600 font-semibold">Immediate renewal required</span>
                      : doc.status === 'Expiring Soon'
                      ? <span className="text-yellow-600 font-semibold">Send renewal notice</span>
                      : <span className="text-green-600">No action needed</span>
                    }
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">No documents match your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Compliance Scores */}
      <Card>
        <CardHeader title="Vendor Compliance Scores" subtitle="Accredited vendors ranked by compliance score" />
        <div className="space-y-3">
          {complianceScores.map((v) => (
            <div key={v.name} className="flex items-center gap-4">
              <div className="w-32 md:w-48 min-w-0 flex-shrink-0">
                <p className="text-sm font-medium text-gray-800 truncate">{v.name}</p>
                <p className="text-xs text-gray-500">{v.region}</p>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      v.score >= 90 ? 'bg-green-500' :
                      v.score >= 80 ? 'bg-asianow-blue' :
                      v.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${v.score}%` }}
                    role="progressbar"
                    aria-valuenow={v.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${v.name} compliance score: ${v.score}%`}
                  />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${
                  v.score >= 90 ? 'text-green-600' :
                  v.score >= 80 ? 'text-asianow-blue' :
                  v.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>{v.score}%</span>
                <Badge variant={v.score >= 90 ? 'success' : v.score >= 80 ? 'info' : v.score >= 70 ? 'warning' : 'danger'}>
                  {v.score >= 90 ? 'Excellent' : v.score >= 80 ? 'Good' : v.score >= 70 ? 'Fair' : 'Poor'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Statutory Requirements Checklist */}
      <Card>
        <CardHeader title="Statutory Requirements Checklist" subtitle="Philippine labor law & regulatory compliance" />
        <div className="space-y-2">
          {statutoryChecklist.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg ${item.status ? 'bg-green-50' : 'bg-red-50'}`}
            >
              {item.status
                ? <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                : <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              }
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.status ? 'text-green-800' : 'text-red-800'}`}>{item.item}</p>
                <p className={`text-xs mt-0.5 ${item.status ? 'text-green-600' : 'text-red-600'}`}>{item.note}</p>
              </div>
              <Badge variant={item.status ? 'success' : 'danger'}>{item.status ? 'Compliant' : 'Action Needed'}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Log */}
      <Card padding={false}>
        <div className="p-6 pb-3">
          <CardHeader title="Audit Log" subtitle="System and user activity trail" />
        </div>
        <div className="divide-y divide-gray-50">
          {auditLogs.map((log) => (
            <div key={log.id} className="px-6 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-xs text-gray-400 font-mono whitespace-nowrap pt-0.5 w-36 flex-shrink-0">
                  {log.timestamp}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{log.action}</span>
                    {log.vendorName && (
                      <Badge variant="info">{log.vendorName}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-0.5">By: {log.user}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
