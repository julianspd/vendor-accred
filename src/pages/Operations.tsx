import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, CheckCircle, Zap } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { deployments as allDeployments } from '../data/deployments';
import { Deployment, DeploymentStatus } from '../types';
import { autoRoute, VendorMatch } from '../utils/routing';
import { calculatePricing, formatPHP } from '../utils/pricing';

const philippineRegions = [
  { id: 'ncr', name: 'NCR', x: 43, y: 35, active: 0 },
  { id: 'cebu', name: 'Cebu', x: 62, y: 58, active: 0 },
  { id: 'davao', name: 'Davao', x: 68, y: 73, active: 0 },
  { id: 'laguna', name: 'Laguna', x: 47, y: 40, active: 0 },
  { id: 'visayas', name: 'Visayas', x: 55, y: 52, active: 0 },
  { id: 'luzon', name: 'N. Luzon', x: 45, y: 22, active: 0 },
  { id: 'mindanao', name: 'Mindanao', x: 63, y: 80, active: 0 },
];

export const Operations: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [deploymentList, setDeploymentList] = useState<Deployment[]>(allDeployments);
  const [confirmDeployment, setConfirmDeployment] = useState<Deployment | null>(null);
  const [routingTarget, setRoutingTarget] = useState<Deployment | null>(null);
  const [routingResults, setRoutingResults] = useState<VendorMatch[]>([]);
  const [routingLoading, setRoutingLoading] = useState(false);

  const filtered = deploymentList.filter(d => {
    const matchSearch = d.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchRegion = regionFilter === 'All' || d.region === regionFilter;
    return matchSearch && matchStatus && matchRegion;
  });

  const regionSummary = philippineRegions.map(r => ({
    ...r,
    active: deploymentList
      .filter(d => d.region.toLowerCase() === r.name.toLowerCase().replace('n. ', '') && d.status === 'Active')
      .reduce((s, d) => s + d.headcount, 0),
  }));

  const maxActive = Math.max(...regionSummary.map(r => r.active), 1);

  const totalActive = deploymentList.filter(d => d.status === 'Active').reduce((s, d) => s + d.headcount, 0);

  const handleAcceptDeployment = (id: string) => {
    setDeploymentList(prev =>
      prev.map(d => d.id === id ? { ...d, status: 'Active' as DeploymentStatus } : d)
    );
    setConfirmDeployment(null);
  };

  const handleAutoRoute = async (d: Deployment) => {
    setRoutingTarget(d);
    setRoutingLoading(true);
    setRoutingResults([]);
    await new Promise(r => setTimeout(r, 1200));
    setRoutingResults(autoRoute(d.region, d.role, d.headcount));
    setRoutingLoading(false);
  };

  return (
    <div className="space-y-6" aria-label="Operations and Deployment">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operations & Deployment</h1>
        <p className="text-sm text-gray-500 mt-1">Active manpower deployments across all regions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Deployments', value: deploymentList.filter(d => d.status === 'Active').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Workers Deployed', value: totalActive.toLocaleString(), color: 'text-asianow-blue', bg: 'bg-blue-50' },
          { label: 'Pending Start', value: deploymentList.filter(d => d.status === 'Pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Completed/Closed', value: deploymentList.filter(d => ['Completed', 'Suspended'].includes(d.status)).length, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map(s => (
          <Card key={s.label}>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Map + Region Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Deployment Map — Philippines" subtitle="Active headcount by region" />
            <div
              className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden h-56 md:h-[340px]"
              role="img"
              aria-label="Philippines deployment map showing active headcount by region"
            >
              {/* Philippines island silhouette suggestion */}
              <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Luzon */}
                <ellipse cx="45" cy="28" rx="13" ry="18" fill="#d1e8ff" opacity="0.8" />
                {/* Visayas */}
                <ellipse cx="58" cy="55" rx="10" ry="6" fill="#d1e8ff" opacity="0.7" />
                <ellipse cx="48" cy="52" rx="5" ry="5" fill="#d1e8ff" opacity="0.7" />
                {/* Mindanao */}
                <ellipse cx="63" cy="80" rx="15" ry="10" fill="#d1e8ff" opacity="0.8" />
                {/* Palawan */}
                <ellipse cx="35" cy="65" rx="4" ry="14" fill="#d1e8ff" opacity="0.6" transform="rotate(-20,35,65)" />

                {/* Region dots */}
                {regionSummary.map(r => (
                  <g key={r.id} transform={`translate(${r.x},${r.y})`}>
                    <circle
                      r={r.active > 0 ? 2.5 + (r.active / maxActive) * 4.5 : 2}
                      fill={r.active > 0 ? '#E31E24' : '#94a3b8'}
                      opacity={0.9}
                      stroke="white"
                      strokeWidth="1"
                    />
                    <text x="0" y="-8" textAnchor="middle" fontSize="3.5" fill="#1A5FA8" fontWeight="600">{r.name}</text>
                    {r.active > 0 && (
                      <text x="0" y="12" textAnchor="middle" fontSize="3" fill="#E31E24" fontWeight="700">{r.active.toLocaleString()}</text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 text-xs space-y-1.5">
                <p className="font-semibold text-gray-700 mb-1">Active Workers</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-asianow-red inline-block" /> Large deployment (500+)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-asianow-red inline-block" /> Medium (200–499)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-asianow-red inline-block" /> Small ({'<'}200)
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Region breakdown */}
        <Card>
          <CardHeader title="By Region" subtitle="Active workers per region" />
          <div className="space-y-3">
            {[
              { region: 'NCR', count: 703, color: 'bg-asianow-red' },
              { region: 'Cebu', count: 170, color: 'bg-asianow-blue' },
              { region: 'Laguna', count: 210, color: 'bg-green-500' },
              { region: 'Visayas', count: 199, color: 'bg-purple-500' },
              { region: 'Luzon', count: 178, color: 'bg-orange-500' },
              { region: 'Mindanao', count: 100, color: 'bg-yellow-500' },
              { region: 'Davao', count: 90, color: 'bg-teal-500' },
            ].map(r => (
              <div key={r.region}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{r.region}</span>
                  <span className="font-bold text-gray-900">{r.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.color}`}
                    style={{ width: `${Math.min(100, (r.count / 703) * 100)}%` }}
                    role="progressbar"
                    aria-valuenow={r.count}
                    aria-valuemax={703}
                    aria-label={`${r.region}: ${r.count} workers`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search vendor, location, role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search size={14} />}
              aria-label="Search deployments"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Suspended', label: 'Suspended' },
            ]}
            aria-label="Filter by status"
          />
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
      </Card>

      {/* Deployment Table */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> of <strong>{deploymentList.length}</strong> deployments</p>
          <Badge variant="info">{filtered.filter(d => d.status === 'Active').reduce((s, d) => s + d.headcount, 0).toLocaleString()} workers in view</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Deployment list">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Role</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Location</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Region</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">HC</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Start Date</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Monthly Rate</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden xl:table-cell">Supervisor</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 table-row-hover">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{d.vendorName}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <Badge variant="info">{d.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap hidden md:table-cell">
                    <span className="flex items-center gap-1"><MapPin size={12} aria-hidden="true" />{d.location}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{d.region}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1"><Users size={12} aria-hidden="true" /><strong>{d.headcount}</strong></span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap hidden md:table-cell">
                    <span className="flex items-center gap-1"><Calendar size={12} aria-hidden="true" />{d.startDate}</span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={d.status} /></td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap font-medium hidden lg:table-cell">₱{d.monthlyRate.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap hidden xl:table-cell">{d.supervisorName}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex gap-1.5 flex-wrap">
                      {d.status === 'Pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeployment(d)}
                          aria-label={`Confirm schedule for ${d.vendorName}`}
                        >
                          <CheckCircle size={12} /> Confirm
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAutoRoute(d)}
                        aria-label={`Auto-assign vendor for ${d.vendorName}`}
                        className="text-asianow-blue"
                      >
                        <Zap size={12} /> Route
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-gray-400 text-sm">No deployments match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deployment Timeline */}
      <Card>
        <CardHeader title="Deployment Timeline" subtitle="Recent and upcoming deployments" />
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true" />
          <div className="space-y-4">
            {allDeployments.slice(0, 8).map((d) => (
              <div key={d.id} className="flex items-start gap-4 pl-10 relative">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${
                  d.status === 'Active' ? 'bg-green-500' :
                  d.status === 'Pending' ? 'bg-yellow-500' :
                  d.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'
                }`} aria-hidden="true" />
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{d.vendorName}</p>
                      <p className="text-xs text-gray-600">{d.role} · {d.location} · <strong>{d.headcount}</strong> workers</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={d.status} />
                      <p className="text-xs text-gray-400 mt-1">{d.startDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Auto-Routing Modal */}
      <Modal
        isOpen={!!routingTarget}
        onClose={() => { setRoutingTarget(null); setRoutingResults([]); }}
        title="AI Auto-Routing — Vendor Matching"
        size="lg"
      >
        {routingTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Role', value: routingTarget.role },
                { label: 'Region', value: routingTarget.region },
                { label: 'Headcount', value: routingTarget.headcount.toString() },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {(() => {
              const pricing = calculatePricing(routingTarget.role, routingTarget.region, routingTarget.headcount);
              return (
                <div className="bg-asianow-dark/5 rounded-xl p-3 flex items-center gap-4 text-sm">
                  <Zap size={14} className="text-asianow-blue flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-600">Suggested rate:</span>
                  <span className="font-bold text-gray-900">{formatPHP(pricing.monthlyRatePerHead)}/head/mo</span>
                  <span className="text-gray-400">·</span>
                  <span className="font-bold text-asianow-blue">{formatPHP(pricing.totalMonthlyBudget)} total/mo</span>
                </div>
              );
            })()}

            {routingLoading && (
              <div className="flex items-center gap-3 py-4 text-asianow-blue">
                <span className="inline-block w-5 h-5 border-2 border-asianow-blue border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span className="text-sm">Running routing algorithm across {routingResults.length || '...'} accredited vendors...</span>
              </div>
            )}

            {routingResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ranked Vendor Matches</p>
                {routingResults.map((match, i) => (
                  <div
                    key={match.vendorId}
                    className={`rounded-xl border p-3.5 ${match.recommended ? 'border-asianow-blue bg-blue-50/40' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                          <p className="text-sm font-bold text-gray-900">{match.vendorName}</p>
                          {match.recommended && <Badge variant="success" size="sm">Top Match</Badge>}
                          <Badge variant={match.matchTier === 'Excellent' ? 'success' : match.matchTier === 'Good' ? 'info' : 'default'} size="sm">{match.matchTier}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5">{match.region} · {match.workerPool.toLocaleString()} workers</p>
                        <div className="flex flex-wrap gap-1.5">
                          {match.reasons.slice(0, 2).map((r, j) => (
                            <span key={j} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">{r}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xl font-bold text-asianow-blue">{match.totalScore}</div>
                        <div className="text-xs text-gray-400">/ 100</div>
                        <div className="mt-1 grid grid-cols-5 gap-0.5">
                          {Object.values(match.breakdown).map((v, j) => {
                            const maxes = [30, 25, 25, 10, 10];
                            return (
                              <div key={j} className="h-6 w-2 bg-gray-100 rounded-sm overflow-hidden flex flex-col-reverse">
                                <div className="bg-asianow-blue rounded-sm" style={{ height: `${(v / maxes[j]) * 100}%` }} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => { setRoutingTarget(null); setRoutingResults([]); }}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Confirm Deployment Schedule Modal */}
      <Modal
        isOpen={!!confirmDeployment}
        onClose={() => setConfirmDeployment(null)}
        title="Confirm Deployment Schedule"
        size="sm"
      >
        {confirmDeployment && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Vendor', value: confirmDeployment.vendorName },
                  { label: 'Location', value: confirmDeployment.location },
                  { label: 'Role', value: confirmDeployment.role },
                  { label: 'Headcount', value: confirmDeployment.headcount.toString() },
                  { label: 'Start Date', value: confirmDeployment.startDate },
                  { label: 'Monthly Rate', value: `₱${confirmDeployment.monthlyRate.toLocaleString()}` },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-lg p-2.5">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Accepting this schedule will activate the deployment and notify the vendor to proceed.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => handleAcceptDeployment(confirmDeployment.id)}
              >
                <CheckCircle size={16} /> Accept &amp; Activate
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDeployment(null)}
              >
                Request Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
