import React, { useState } from 'react';
import { Search, Filter, X, CheckCircle, XCircle, FileText, Brain } from 'lucide-react';
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

const VendorDrawer: React.FC<{ vendor: Vendor; onClose: () => void; onApprove: (id: string) => void; onReject: (id: string) => void }> = ({
  vendor, onClose, onApprove, onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="vendor-drawer-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="ml-auto relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 id="vendor-drawer-title" className="text-lg font-bold text-gray-900">{vendor.companyName}</h2>
            <StatusBadge status={vendor.status} size="md" />
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close vendor detail">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Company Info */}
          <section aria-labelledby="company-info-heading">
            <h3 id="company-info-heading" className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Company Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Contact Person', value: vendor.contactPerson },
                { label: 'Email', value: vendor.email },
                { label: 'Phone', value: vendor.phone },
                { label: 'Region', value: vendor.region },
                { label: 'Workers Deployed', value: vendor.workerCount.toString() },
                { label: 'Submitted Date', value: vendor.submittedDate },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{vendor.address}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-xs text-gray-500">Specialization</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {vendor.specialization.map(s => (
                  <Badge key={s} variant="info">{s}</Badge>
                ))}
              </div>
            </div>
          </section>

          {/* AI Review Score */}
          <section aria-labelledby="ai-score-heading">
            <h3 id="ai-score-heading" className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">AI Review Score</h3>
            <div className="bg-gradient-to-br from-asianow-dark to-asianow-blue rounded-xl p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Brain size={20} aria-hidden="true" />
                <span className="font-semibold">AI Accreditation Analysis</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold">{vendor.aiScore}</span>
                <span className="text-xl text-white/60">/100</span>
                <span className={`ml-auto text-sm font-medium px-3 py-1 rounded-full ${
                  vendor.aiScore >= 80 ? 'bg-green-500/20 text-green-300' :
                  vendor.aiScore >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {vendor.aiScore >= 80 ? 'Low Risk' : vendor.aiScore >= 60 ? 'Medium Risk' : 'High Risk'}
                </span>
              </div>
              <div className="mt-3 bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${vendor.aiScore >= 80 ? 'bg-green-400' : vendor.aiScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${vendor.aiScore}%` }}
                  role="progressbar"
                  aria-valuenow={vendor.aiScore}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xs text-white/60">Compliance Score</p>
                  <p className="text-lg font-bold">{vendor.complianceScore}/100</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xs text-white/60">Last Audit</p>
                  <p className="text-sm font-bold">{vendor.lastAudit}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Document Checklist */}
          <section aria-labelledby="docs-heading">
            <h3 id="docs-heading" className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Document Checklist</h3>
            <div className="space-y-2">
              {vendor.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {docStatusIcon[doc.status]}
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{doc.name}</p>
                      {doc.expiryDate && (
                        <p className="text-xs text-gray-500">Expires: {doc.expiryDate}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
              {/* Additional required document items */}
              {(['Business Permit (BPO/BOI)', 'Bank Account Details'] as const).map(docName => {
                const alreadyPresent = vendor.documents.some(d => d.name === docName);
                if (alreadyPresent) return null;
                return (
                  <div key={docName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {docStatusIcon['Missing']}
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{docName}</p>
                      </div>
                    </div>
                    <StatusBadge status="Missing" />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Actions */}
        {(vendor.status === 'Pending' || vendor.status === 'Flagged') && (
          <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { onApprove(vendor.id); onClose(); }}
            >
              <CheckCircle size={16} /> Approve & Accredit
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => { onReject(vendor.id); onClose(); }}
            >
              <XCircle size={16} /> Reject Application
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
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${statusFilter === status ? 'border-asianow-blue ring-2 ring-asianow-blue/20' : 'border-gray-100'}`}
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

      {/* Vendor Table */}
      <Card padding={false}>
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
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Doc Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => {
                const missingDocs = vendor.documents.filter(d => d.status === 'Missing' || d.status === 'Expired').length;
                return (
                  <tr
                    key={vendor.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors table-row-hover"
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
