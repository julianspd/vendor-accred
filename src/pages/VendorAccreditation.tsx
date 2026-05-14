import React, { useState } from 'react';
import {
  Search, Filter, X, CheckCircle, XCircle, FileText, Brain,
  Phone, Mail, MapPin, Users, TrendingUp, Calendar, Award, Clock,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { vendors as allVendors } from '../data/vendors';
import { Vendor, VendorStatus } from '../types';

const docStatusIcon: Record<string, React.ReactNode> = {
  Verified: <CheckCircle size={14} className="text-green-500" />,
  Submitted: <FileText size={14} className="text-blue-500" />,
  Missing: <XCircle size={14} className="text-red-500" />,
  Expired: <XCircle size={14} className="text-red-500" />,
};

const performanceHistory = [
  { month: 'Feb', deployed: 180, target: 200, onTime: 94 },
  { month: 'Mar', deployed: 195, target: 200, onTime: 97 },
  { month: 'Apr', deployed: 210, target: 200, onTime: 98 },
  { month: 'May', deployed: 205, target: 210, onTime: 96 },
];

const VendorDrawer: React.FC<{
  vendor: Vendor;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ vendor, onClose, onApprove, onReject }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'documents' | 'performance'>('overview');

  const avgOnTime = Math.round(performanceHistory.reduce((s, r) => s + r.onTime, 0) / performanceHistory.length);
  const totalDeployed = performanceHistory.reduce((s, r) => s + r.deployed, 0);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="vendor-drawer-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="ml-auto relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex-1 min-w-0 pr-3">
            <h2 id="vendor-drawer-title" className="text-base md:text-lg font-bold text-gray-900 leading-tight">{vendor.companyName}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={vendor.status} size="md" />
              <span className="text-xs text-gray-500">{vendor.region}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-gray-100 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close vendor detail"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick contact bar */}
        <div className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{vendor.contactPerson}</p>
            <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
          </div>
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
            aria-label={`Call ${vendor.contactPerson}`}
          >
            <Phone size={13} />
            <span className="hidden sm:inline">Call</span>
          </a>
          <a
            href={`mailto:${vendor.email}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-asianow-blue text-white rounded-lg text-xs font-medium hover:bg-asianow-dark min-h-[44px]"
            aria-label={`Email ${vendor.contactPerson}`}
          >
            <Mail size={13} />
            <span className="hidden sm:inline">Email</span>
          </a>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-4 md:px-6 pt-4 border-b border-gray-100 pb-0">
          {(['overview', 'documents', 'performance'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-3 py-2 text-xs font-semibold capitalize border-b-2 transition-colors ${
                activeSection === tab
                  ? 'border-asianow-blue text-asianow-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5 overflow-y-auto">

          {/* ── OVERVIEW TAB ── */}
          {activeSection === 'overview' && (
            <>
              {/* KPI strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Workers', value: vendor.workerCount.toLocaleString(), icon: Users, color: 'text-asianow-blue', bg: 'bg-blue-50' },
                  { label: 'AI Score', value: `${vendor.aiScore}/100`, icon: Brain, color: vendor.aiScore >= 80 ? 'text-green-600' : vendor.aiScore >= 60 ? 'text-yellow-600' : 'text-red-600', bg: vendor.aiScore >= 80 ? 'bg-green-50' : vendor.aiScore >= 60 ? 'bg-yellow-50' : 'bg-red-50' },
                  { label: 'On-Time', value: `${avgOnTime}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                ].map(k => (
                  <div key={k.label} className={`${k.bg} rounded-xl p-3 text-center`}>
                    <k.icon size={16} className={`${k.color} mx-auto mb-1`} aria-hidden="true" />
                    <p className="text-sm font-bold text-gray-900">{k.value}</p>
                    <p className="text-xs text-gray-500">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Company details */}
              <section aria-labelledby="company-info-heading">
                <h3 id="company-info-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Company Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Contact Person', value: vendor.contactPerson },
                    { label: 'Phone', value: vendor.phone },
                    { label: 'Region', value: vendor.region },
                    { label: 'Submitted', value: vendor.submittedDate },
                    { label: 'Last Audit', value: vendor.lastAudit },
                    { label: 'Compliance Score', value: `${vendor.complianceScore}/100` },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mt-2 flex items-start gap-2">
                  <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{vendor.address}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-gray-500 mb-1.5">Specialization</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.specialization.map(s => (
                      <Badge key={s} variant="info">{s}</Badge>
                    ))}
                  </div>
                </div>
              </section>

              {/* AI Score */}
              <section aria-labelledby="ai-score-heading">
                <h3 id="ai-score-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Accreditation Score</h3>
                <div className="bg-gradient-to-br from-asianow-dark to-asianow-blue rounded-xl p-4 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain size={18} aria-hidden="true" />
                    <span className="font-semibold text-sm">AI Risk Analysis</span>
                    <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${
                      vendor.aiScore >= 80 ? 'bg-green-500/20 text-green-300' :
                      vendor.aiScore >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {vendor.aiScore >= 80 ? 'Low Risk' : vendor.aiScore >= 60 ? 'Medium Risk' : 'High Risk'}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-bold">{vendor.aiScore}</span>
                    <span className="text-lg text-white/60 pb-1">/100</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full ${vendor.aiScore >= 80 ? 'bg-green-400' : vendor.aiScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${vendor.aiScore}%` }}
                      role="progressbar"
                      aria-valuenow={vendor.aiScore}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Compliance', value: vendor.complianceScore },
                      { label: 'Document', value: Math.round(vendor.documents.filter(d => d.status === 'Verified').length / vendor.documents.length * 100) },
                      { label: 'Track Record', value: avgOnTime },
                    ].map(item => (
                      <div key={item.label} className="bg-white/10 rounded-lg p-2 text-center">
                        <p className="text-xs text-white/60">{item.label}</p>
                        <p className="text-sm font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeSection === 'documents' && (
            <section aria-labelledby="docs-heading">
              <div className="flex items-center justify-between mb-3">
                <h3 id="docs-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Document Checklist</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">
                    {vendor.documents.filter(d => d.status === 'Verified').length} / {vendor.documents.length} verified
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {vendor.documents.map((doc) => (
                  <div key={doc.name} className={`flex items-center justify-between p-3 rounded-lg border ${
                    doc.status === 'Verified' ? 'bg-green-50 border-green-100' :
                    doc.status === 'Submitted' ? 'bg-blue-50 border-blue-100' :
                    'bg-red-50 border-red-100'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {docStatusIcon[doc.status]}
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{doc.name}</p>
                        {doc.expiryDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} aria-hidden="true" />
                            Expires: {doc.expiryDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
                {(['Business Permit (BPO/BOI)', 'Bank Account Details'] as const).map(docName => {
                  if (vendor.documents.some(d => d.name === docName)) return null;
                  return (
                    <div key={docName} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        {docStatusIcon['Missing']}
                        <p className="text-sm text-gray-800 font-medium">{docName}</p>
                      </div>
                      <StatusBadge status="Missing" />
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  All documents are verified against DTI/SEC, BIR, SSS, PhilHealth, and DOLE records. Expired or missing documents trigger automatic re-submission requests.
                </p>
              </div>
            </section>
          )}

          {/* ── PERFORMANCE TAB ── */}
          {activeSection === 'performance' && (
            <section aria-labelledby="perf-heading">
              <h3 id="perf-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Deployment Performance</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Total Deployed (4mo)', value: totalDeployed.toLocaleString(), icon: Users, color: 'text-asianow-blue' },
                  { label: 'Avg On-Time Rate', value: `${avgOnTime}%`, icon: Clock, color: avgOnTime >= 95 ? 'text-green-600' : 'text-yellow-600' },
                  { label: 'Active Contracts', value: '3', icon: FileText, color: 'text-purple-600' },
                  { label: 'Accredited Since', value: '2024', icon: Award, color: 'text-asianow-red' },
                ].map(k => (
                  <div key={k.label} className="bg-gray-50 rounded-xl p-3">
                    <k.icon size={14} className={`${k.color} mb-1`} aria-hidden="true" />
                    <p className="text-lg font-bold text-gray-900">{k.value}</p>
                    <p className="text-xs text-gray-500">{k.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-700">Monthly Deployment vs Target</p>
                </div>
                <div className="p-4 space-y-3">
                  {performanceHistory.map(row => (
                    <div key={row.month}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{row.month} 2026</span>
                        <span className="text-gray-500">{row.deployed} / {row.target} deployed · {row.onTime}% on-time</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${row.deployed >= row.target ? 'bg-green-500' : 'bg-asianow-blue'}`}
                          style={{ width: `${Math.min((row.deployed / row.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-700 mb-2">Billing Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Total Paid (All Time)', value: '₱3.48M' },
                    { label: 'Pending Payout', value: '₱523,000' },
                    { label: 'Avg Monthly Billing', value: '₱870,000' },
                    { label: 'Payment On-Time', value: '100%' },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-lg p-2.5">
                      <p className="text-gray-500">{item.label}</p>
                      <p className="font-bold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Actions */}
        {(vendor.status === 'Pending' || vendor.status === 'Flagged') && (
          <div className="p-4 md:p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
            <Button
              variant="secondary"
              className="flex-1 min-h-[44px]"
              onClick={() => { onApprove(vendor.id); onClose(); }}
            >
              <CheckCircle size={16} /> Approve & Accredit
            </Button>
            <Button
              variant="danger"
              className="flex-1 min-h-[44px]"
              onClick={() => { onReject(vendor.id); onClose(); }}
            >
              <XCircle size={16} /> Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const VendorAccreditation: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState(allVendors);

  const handleApprove = (id: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Accredited' as VendorStatus } : v));
  };
  const handleReject = (id: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Rejected' as VendorStatus } : v));
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.region.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchRegion = regionFilter === 'All' || v.region === regionFilter;
    return matchSearch && matchStatus && matchRegion;
  });

  const statusCounts = {
    Accredited: vendors.filter(v => v.status === 'Accredited').length,
    Pending: vendors.filter(v => v.status === 'Pending').length,
    Flagged: vendors.filter(v => v.status === 'Flagged').length,
    Rejected: vendors.filter(v => v.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6" aria-label="Vendor Accreditation">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Accreditation</h1>
        <p className="text-sm text-gray-500 mt-1">Manage vendor applications and accreditation status</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Vendor status summary">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md min-h-[80px] ${statusFilter === status ? 'border-asianow-blue ring-2 ring-asianow-blue/20' : 'border-gray-100'}`}
            aria-pressed={statusFilter === status}
          >
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{count}</p>
            <StatusBadge status={status} size="md" />
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search size={14} />}
              aria-label="Search vendors"
            />
          </div>
          <div className="min-w-36">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Accredited', label: 'Accredited' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Flagged', label: 'Flagged' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
              aria-label="Filter by status"
            />
          </div>
          <div className="min-w-36">
            <Select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Regions' },
                { value: 'NCR', label: 'NCR' },
                { value: 'Cebu', label: 'Cebu' },
                { value: 'Davao', label: 'Davao' },
                { value: 'Laguna', label: 'Laguna' },
                { value: 'Visayas', label: 'Visayas' },
                { value: 'Luzon', label: 'Luzon' },
                { value: 'Mindanao', label: 'Mindanao' },
              ]}
              aria-label="Filter by region"
            />
          </div>
          {(search || statusFilter !== 'All' || regionFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setStatusFilter('All'); setRegionFilter('All'); }}
            >
              <Filter size={14} /> Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Vendor cards on mobile, table on desktop */}
      <div className="block md:hidden space-y-3">
        {filtered.map(vendor => {
          const missingDocs = vendor.documents.filter(d => d.status === 'Missing' || d.status === 'Expired').length;
          return (
            <button
              key={vendor.id}
              className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow active:bg-gray-50"
              onClick={() => setSelectedVendor(vendor)}
              aria-label={`View details for ${vendor.companyName}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{vendor.companyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{vendor.region} · {vendor.contactPerson}</p>
                </div>
                <StatusBadge status={vendor.status} />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${vendor.aiScore >= 70 ? 'bg-green-500' : vendor.aiScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${vendor.aiScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{vendor.aiScore}</span>
                </div>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-600">{vendor.workerCount} workers</span>
                <span className="text-xs text-gray-400">·</span>
                {missingDocs > 0
                  ? <Badge variant="danger" size="sm">{missingDocs} doc issue{missingDocs > 1 ? 's' : ''}</Badge>
                  : <Badge variant="success" size="sm">Docs OK</Badge>
                }
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">No vendors match your filters.</div>
        )}
      </div>

      {/* Vendor Table — desktop */}
      <Card padding={false} className="hidden md:block">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> of <strong>{vendors.length}</strong> vendors</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Vendor list">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Region</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Specialization</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">AI Score</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Docs</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => {
                const missingDocs = vendor.documents.filter(d => d.status === 'Missing' || d.status === 'Expired').length;
                return (
                  <tr
                    key={vendor.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedVendor(vendor)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelectedVendor(vendor)}
                    role="button"
                    aria-label={`View details for ${vendor.companyName}`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{vendor.companyName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{vendor.submittedDate}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-gray-800">{vendor.contactPerson}</p>
                      <p className="text-xs text-gray-500">{vendor.email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{vendor.region}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {vendor.specialization.slice(0, 2).map(s => (
                          <Badge key={s} variant="info" size="sm">{s}</Badge>
                        ))}
                        {vendor.specialization.length > 2 && (
                          <Badge variant="default" size="sm">+{vendor.specialization.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={vendor.status} /></td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-gray-100 rounded-full h-1.5" aria-hidden="true">
                          <div
                            className={`h-1.5 rounded-full ${vendor.aiScore >= 70 ? 'bg-green-500' : vendor.aiScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${vendor.aiScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{vendor.aiScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {missingDocs > 0
                        ? <Badge variant="danger">{missingDocs} issue{missingDocs > 1 ? 's' : ''}</Badge>
                        : <Badge variant="success">Complete</Badge>
                      }
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedVendor(vendor); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">No vendors match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedVendor && (
        <VendorDrawer
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
