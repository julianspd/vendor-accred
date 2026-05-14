import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Users, Calendar, DollarSign, Plus, Filter, Search,
  Brain, Calculator, Clock, ChevronRight, TrendingUp, X, CheckCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { requirements as allRequirements } from '../data/requirements';
import { vendors as allVendors } from '../data/vendors';
import { Requirement, RequirementRole } from '../types';
import { useForm, useWatch } from 'react-hook-form';
import { calculatePricing, formatPHP } from '../utils/pricing';
import { autoRoute } from '../utils/routing';

const roleColors: Record<string, string> = {
  'Delivery Rider': 'bg-red-50 border-red-100',
  'Warehouse Staff': 'bg-blue-50 border-blue-100',
  'Dispatch Officer': 'bg-purple-50 border-purple-100',
  'Sorter': 'bg-yellow-50 border-yellow-100',
  'Customer Service': 'bg-green-50 border-green-100',
  'Driver': 'bg-orange-50 border-orange-100',
  'Security': 'bg-gray-50 border-gray-100',
  'Inventory Clerk': 'bg-teal-50 border-teal-100',
  'Hub Coordinator': 'bg-indigo-50 border-indigo-100',
  'Fleet Support': 'bg-cyan-50 border-cyan-100',
};

const RequirementCard: React.FC<{
  req: Requirement;
  onViewDetail: (req: Requirement) => void;
  onViewBids: (req: Requirement) => void;
}> = ({ req, onViewDetail, onViewBids }) => {
  const daysLeft = Math.ceil((new Date(req.deadline).getTime() - new Date().getTime()) / 86400000);

  return (
    <article
      className={`bg-white rounded-xl border ${roleColors[req.role] || 'border-gray-100'} p-5 hover:shadow-md transition-shadow cursor-pointer`}
      aria-labelledby={`req-${req.id}-title`}
      onClick={() => onViewDetail(req)}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onViewDetail(req)}
      role="button"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{req.role}</p>
            {req.category === 'Seasonal' && <Badge variant="warning" size="sm">Seasonal</Badge>}
            {req.category === 'Surge' && <Badge variant="danger" size="sm">Surge</Badge>}
          </div>
          <h3 id={`req-${req.id}-title`} className="text-sm font-bold text-gray-900 leading-snug">{req.title}</h3>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <p className="text-xs text-gray-600 mb-4 line-clamp-2">{req.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPin size={12} className="text-gray-400" aria-hidden="true" />
          <span className="truncate">{req.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Users size={12} className="text-gray-400" aria-hidden="true" />
          <span><strong>{req.headcount}</strong> headcount</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={12} className="text-gray-400" aria-hidden="true" />
          <span>{req.deadline}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <DollarSign size={12} className="text-gray-400" aria-hidden="true" />
          <span>₱{req.budget.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={req.bids.length > 0 ? 'info' : 'default'}>
            {req.bids.length} bid{req.bids.length !== 1 ? 's' : ''}
          </Badge>
          {daysLeft > 0
            ? <span className={`text-xs font-medium ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'}`}>{daysLeft}d left</span>
            : <span className="text-xs font-medium text-gray-400">Closed</span>
          }
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={e => { e.stopPropagation(); onViewBids(req); }}
          >
            View Bids
          </Button>
          <ChevronRight size={14} className="text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
};

// ─── Requirement Detail Drawer ───────────────────────────────────────────────

const RequirementDetail: React.FC<{
  req: Requirement;
  onClose: () => void;
  onViewBids: (req: Requirement) => void;
}> = ({ req, onClose, onViewBids }) => {
  const daysLeft = Math.ceil((new Date(req.deadline).getTime() - new Date().getTime()) / 86400000);
  const pricing = calculatePricing(req.role, req.region, req.headcount);
  const aiMatches = autoRoute(req.region, req.role, req.headcount).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="req-detail-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="ml-auto relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{req.role}</p>
                {req.category === 'Seasonal' && <Badge variant="warning" size="sm">Seasonal</Badge>}
                {req.category === 'Surge' && <Badge variant="danger" size="sm">Surge</Badge>}
              </div>
              <h2 id="req-detail-title" className="text-base md:text-lg font-bold text-gray-900 leading-tight">{req.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={req.status} />
                {daysLeft > 0
                  ? <span className={`text-xs font-medium ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'}`}>{daysLeft} days remaining</span>
                  : <span className="text-xs text-gray-400">Deadline passed</span>
                }
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-gray-100 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5">

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Location', value: req.location, icon: MapPin },
              { label: 'Region', value: req.region, icon: MapPin },
              { label: 'Headcount Required', value: req.headcount.toLocaleString(), icon: Users },
              { label: 'Total Bids', value: req.bids.length.toString(), icon: TrendingUp },
              { label: 'Posted Date', value: req.postedDate, icon: Calendar },
              { label: 'Deadline', value: req.deadline, icon: Clock },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <item.icon size={11} className="text-gray-400" aria-hidden="true" />
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Budget */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Approved Budget</p>
            <p className="text-2xl font-bold text-gray-900">₱{req.budget.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              ≈ ₱{Math.round(req.budget / req.headcount).toLocaleString()} per head
            </p>
          </div>

          {/* AI Pricing */}
          <div className="bg-gradient-to-br from-asianow-dark to-asianow-blue rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={15} aria-hidden="true" />
              <span className="text-sm font-semibold">AI Pricing Engine</span>
              <span className="ml-auto text-xs text-white/60">Market rate estimate</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/10 rounded-lg p-2.5">
                <p className="text-xs text-white/60 mb-0.5">Daily / Head</p>
                <p className="text-sm font-bold">{formatPHP(pricing.dailyBillableRate)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2.5">
                <p className="text-xs text-white/60 mb-0.5">Monthly / Head</p>
                <p className="text-sm font-bold">{formatPHP(pricing.monthlyRatePerHead)}</p>
              </div>
              <div className="bg-asianow-red/30 rounded-lg p-2.5 border border-asianow-red/40">
                <p className="text-xs text-white/70 mb-0.5">Total Monthly</p>
                <p className="text-sm font-bold">{formatPHP(pricing.totalMonthlyBudget)}</p>
              </div>
            </div>
            <div className="text-xs text-white/60 space-y-0.5">
              <p>Base rate ({req.role}): {formatPHP(pricing.baseRate)}/day · Region ({req.region}): {pricing.regionalRate !== pricing.baseRate ? `+${formatPHP(pricing.regionalRate - pricing.baseRate)}` : 'no adj.'}</p>
              <p>Volume discount: {pricing.volumeDiscountPct > 0 ? `-${pricing.volumeDiscountPct}%` : 'none'} · Employer contributions + agency fee included</p>
            </div>
          </div>

          {/* AI Top Matches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-asianow-blue" aria-hidden="true" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">AI-Recommended Vendors</p>
            </div>
            <div className="space-y-2">
              {aiMatches.map((match, i) => (
                <div key={match.vendorId} className={`bg-white rounded-lg px-3 py-2.5 border ${match.recommended ? 'border-asianow-blue/40 bg-blue-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{match.vendorName}</p>
                        {match.recommended && <Badge variant="success" size="sm">Top Match</Badge>}
                        <Badge variant={match.matchTier === 'Excellent' ? 'success' : match.matchTier === 'Good' ? 'info' : 'default'} size="sm">{match.matchTier}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{match.region} · {match.workerPool.toLocaleString()} workers · Score: {match.totalScore}/100</p>
                      {i === 0 && match.reasons[0] && (
                        <p className="text-xs text-asianow-blue mt-1">{match.reasons[0]}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {['AI', 'Reg', 'Cap'].map((lbl, j) => {
                        const vals = [match.breakdown.aiScore * 100 / 30, match.breakdown.regionMatch * 100 / 25, match.breakdown.capacity * 100 / 10];
                        return (
                          <div key={lbl} className="text-center">
                            <div className="h-8 w-3 bg-gray-100 rounded-sm overflow-hidden flex flex-col-reverse">
                              <div className="bg-asianow-blue rounded-sm" style={{ height: `${vals[j]}%` }} />
                            </div>
                            <p className="text-[9px] text-gray-400 mt-0.5">{lbl}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <Button
            className="flex-1 min-h-[44px]"
            onClick={() => { onClose(); onViewBids(req); }}
            disabled={req.status === 'Closed'}
          >
            View All Bids ({req.bids.length})
          </Button>
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Close</Button>
        </div>
      </div>
    </div>
  );
};

interface PostRequirementForm {
  title: string;
  role: RequirementRole;
  location: string;
  region: string;
  headcount: number;
  deadline: string;
  budget: number;
  description: string;
}

export const Marketplace: React.FC = () => {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [bidsReq, setBidsReq] = useState<Requirement | null>(null);
  const [detailReq, setDetailReq] = useState<Requirement | null>(null);
  const [requirements, setRequirements] = useState(allRequirements);
  const [awardBanner, setAwardBanner] = useState<string | null>(null);
  const awardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bid submission form state
  const [bidVendorName, setBidVendorName] = useState('');
  const [bidRate, setBidRate] = useState('');
  const [bidHeadcount, setBidHeadcount] = useState('');
  const [bidNotes, setBidNotes] = useState('');

  // Auto-dismiss award banner after 3 seconds
  useEffect(() => {
    if (awardBanner) {
      if (awardTimerRef.current) clearTimeout(awardTimerRef.current);
      awardTimerRef.current = setTimeout(() => setAwardBanner(null), 3000);
    }
    return () => { if (awardTimerRef.current) clearTimeout(awardTimerRef.current); };
  }, [awardBanner]);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PostRequirementForm>();
  const watchedRole = useWatch({ control, name: 'role' });
  const watchedRegion = useWatch({ control, name: 'region' });
  const watchedHeadcount = useWatch({ control, name: 'headcount' });

  const filtered = requirements.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'All' || r.region === regionFilter;
    const matchRole = roleFilter === 'All' || r.role === roleFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchSearch && matchRegion && matchRole && matchStatus && matchCategory;
  });

  const onPost = (data: PostRequirementForm) => {
    const newReq: Requirement = {
      id: `req${requirements.length + 1}`,
      ...data,
      headcount: Number(data.headcount),
      budget: Number(data.budget),
      status: 'Open',
      postedDate: new Date().toISOString().split('T')[0],
      category: 'Regular',
      bids: [],
    };
    setRequirements(prev => [newReq, ...prev]);
    reset();
    setShowPostModal(false);
  };

  const getAiRecommendations = (req: Requirement) => {
    return autoRoute(req.region, req.role, req.headcount).slice(0, 3);
  };

  const handleSubmitBid = () => {
    if (!bidsReq || !bidVendorName.trim() || !bidRate || !bidHeadcount) return;
    const newBid = {
      vendorId: `vendor-${Date.now()}`,
      vendorName: bidVendorName.trim(),
      proposedRate: Number(bidRate),
      headcount: Number(bidHeadcount),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
    };
    const updatedReq = { ...bidsReq, bids: [...bidsReq.bids, newBid] };
    setRequirements(prev => prev.map(r => r.id === bidsReq.id ? updatedReq : r));
    setBidsReq(updatedReq);
    setBidVendorName('');
    setBidRate('');
    setBidHeadcount('');
    setBidNotes('');
  };

  const handleAcceptBid = (bidIndex: number) => {
    if (!bidsReq) return;
    const acceptedVendor = bidsReq.bids[bidIndex].vendorName;
    const updatedBids = bidsReq.bids.map((b, i) => ({
      ...b,
      status: i === bidIndex ? ('Accepted' as const) : ('Rejected' as const),
    }));
    const updatedReq: Requirement = { ...bidsReq, bids: updatedBids, status: 'Filled' };
    setRequirements(prev => prev.map(r => r.id === bidsReq.id ? updatedReq : r));
    setBidsReq(null);
    setAwardBanner(`Awarded to ${acceptedVendor}`);
  };

  const handleDeclineBid = (bidIndex: number) => {
    if (!bidsReq) return;
    const updatedBids = bidsReq.bids.map((b, i) =>
      i === bidIndex ? { ...b, status: 'Rejected' as const } : b,
    );
    const updatedReq = { ...bidsReq, bids: updatedBids };
    setRequirements(prev => prev.map(r => r.id === bidsReq.id ? updatedReq : r));
    setBidsReq(updatedReq);
  };

  return (
    <div className="space-y-6" aria-label="Requirement Marketplace">
      {/* Award success banner */}
      {awardBanner && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium shadow-sm"
        >
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" aria-hidden="true" />
          <span>{awardBanner}</span>
          <button
            onClick={() => setAwardBanner(null)}
            className="ml-auto text-green-600 hover:text-green-800"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirement Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Open manpower requirements — vendor bidding board</p>
        </div>
        <Button onClick={() => setShowPostModal(true)}>
          <Plus size={16} /> Post Requirement
        </Button>
      </div>

      {/* Stats — clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: requirements.filter(r => r.status === 'Open').length },
          { label: 'In Progress', count: requirements.filter(r => r.status === 'In Progress').length },
          { label: 'Filled', count: requirements.filter(r => r.status === 'Filled').length },
          { label: 'Closed', count: requirements.filter(r => r.status === 'Closed').length },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(statusFilter === s.label ? 'All' : s.label)}
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md min-h-[80px] ${statusFilter === s.label ? 'border-asianow-blue ring-2 ring-asianow-blue/20' : 'border-gray-100'}`}
            aria-pressed={statusFilter === s.label}
          >
            <p className="text-2xl font-bold text-gray-900">{s.count}</p>
            <StatusBadge status={s.label} size="md" />
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search requirements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search size={14} />}
              aria-label="Search requirements"
            />
          </div>
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
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Delivery Rider', label: 'Delivery Rider' },
              { value: 'Warehouse Staff', label: 'Warehouse Staff' },
              { value: 'Dispatch Officer', label: 'Dispatch Officer' },
              { value: 'Sorter', label: 'Sorter' },
              { value: 'Customer Service', label: 'Customer Service' },
              { value: 'Driver', label: 'Driver' },
              { value: 'Security', label: 'Security' },
              { value: 'Inventory Clerk', label: 'Inventory Clerk' },
              { value: 'Hub Coordinator', label: 'Hub Coordinator' },
              { value: 'Fleet Support', label: 'Fleet Support' },
            ]}
            aria-label="Filter by role"
          />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Open', label: 'Open' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Filled', label: 'Filled' },
              { value: 'Closed', label: 'Closed' },
            ]}
            aria-label="Filter by status"
          />
          <Select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Regular', label: 'Regular' },
              { value: 'Seasonal', label: 'Seasonal' },
              { value: 'Surge', label: 'Surge' },
            ]}
            aria-label="Filter by category"
          />
          {(search || regionFilter !== 'All' || roleFilter !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setRegionFilter('All'); setRoleFilter('All'); setStatusFilter('All'); setCategoryFilter('All'); }}
            >
              <Filter size={14} /> Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Cards grid */}
      <div>
        <p className="text-sm text-gray-500 mb-4">
          Showing <strong>{filtered.length}</strong> requirements · Click any card to view full details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Requirements list">
          {filtered.map(req => (
            <div key={req.id} role="listitem">
              <RequirementCard
                req={req}
                onViewDetail={setDetailReq}
                onViewBids={setBidsReq}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-16 text-center text-gray-400">
              No requirements match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Requirement Detail Drawer */}
      {detailReq && (
        <RequirementDetail
          req={detailReq}
          onClose={() => setDetailReq(null)}
          onViewBids={req => { setDetailReq(null); setBidsReq(req); }}
        />
      )}

      {/* Bids Modal */}
      {bidsReq && (
        <Modal isOpen={!!bidsReq} onClose={() => setBidsReq(null)} title={`Bids — ${bidsReq.title}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Budget</p>
                <p className="font-bold text-gray-900">₱{bidsReq.budget.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Headcount</p>
                <p className="font-bold text-gray-900">{bidsReq.headcount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Bids</p>
                <p className="font-bold text-gray-900">{bidsReq.bids.length}</p>
              </div>
            </div>

            {/* AI Auto-Routing Recommendations */}
            <div className="bg-gradient-to-br from-asianow-dark/5 to-asianow-blue/5 border border-asianow-blue/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-asianow-blue" aria-hidden="true" />
                <span className="text-sm font-semibold text-asianow-blue">AI Auto-Routing Engine</span>
                <span className="text-xs text-blue-400 ml-auto">Scored by region · compliance · capacity</span>
              </div>
              <div className="space-y-2">
                {getAiRecommendations(bidsReq).map((match, i) => (
                  <div key={match.vendorId} className={`bg-white rounded-lg px-3 py-2.5 border ${match.recommended ? 'border-asianow-blue/40' : 'border-blue-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 truncate">{match.vendorName}</p>
                          {match.recommended && <Badge variant="success" size="sm">Top Match</Badge>}
                          <Badge variant={match.matchTier === 'Excellent' ? 'success' : match.matchTier === 'Good' ? 'info' : 'default'} size="sm">{match.matchTier}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{match.region} · {match.workerPool.toLocaleString()} workers · Score: {match.totalScore}/100</p>
                        {i === 0 && match.reasons[0] && (
                          <p className="text-xs text-asianow-blue mt-1">{match.reasons[0]}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          {['AI', 'Reg', 'Cap'].map((lbl, j) => {
                            const vals = [match.breakdown.aiScore * 100 / 30, match.breakdown.regionMatch * 100 / 25, match.breakdown.capacity * 100 / 10];
                            return (
                              <div key={lbl} className="text-center">
                                <div className="h-8 w-3 bg-gray-100 rounded-sm overflow-hidden flex flex-col-reverse">
                                  <div className="bg-asianow-blue rounded-sm" style={{ height: `${vals[j]}%` }} />
                                </div>
                                <p className="text-[9px] text-gray-400 mt-0.5">{lbl}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {bidsReq.bids.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No bids submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Vendor bids">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Vendor', 'Proposed Rate', 'Headcount', 'Submitted', 'Status', 'Actions'].map(h => (
                        <th key={h} scope="col" className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bidsReq.bids.map((bid, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium text-gray-900">{bid.vendorName}</td>
                        <td className="py-3 px-3 text-gray-700">₱{bid.proposedRate.toLocaleString()}</td>
                        <td className="py-3 px-3 text-gray-700">{bid.headcount}</td>
                        <td className="py-3 px-3 text-gray-500 text-xs">{bid.submittedDate}</td>
                        <td className="py-3 px-3"><StatusBadge status={bid.status} /></td>
                        <td className="py-3 px-3">
                          {bid.status === 'Pending' && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcceptBid(i)}
                                aria-label={`Accept bid from ${bid.vendorName}`}
                                className="border-green-500 text-green-700 hover:bg-green-50"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeclineBid(i)}
                                aria-label={`Decline bid from ${bid.vendorName}`}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submit Bid section */}
            {(bidsReq.status === 'Open' || bidsReq.status === 'In Progress') && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Submit a Bid</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="bid-vendor-name">
                      Vendor Name
                    </label>
                    <input
                      id="bid-vendor-name"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg text-sm text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                      placeholder="Company name"
                      value={bidVendorName}
                      onChange={e => setBidVendorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="bid-rate">
                      Proposed Rate (₱)
                    </label>
                    <input
                      id="bid-rate"
                      type="number"
                      min={1}
                      className="w-full border border-gray-300 rounded-lg text-sm text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                      placeholder="e.g. 25000"
                      value={bidRate}
                      onChange={e => setBidRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="bid-headcount">
                      Headcount
                    </label>
                    <input
                      id="bid-headcount"
                      type="number"
                      min={1}
                      className="w-full border border-gray-300 rounded-lg text-sm text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                      placeholder="e.g. 50"
                      value={bidHeadcount}
                      onChange={e => setBidHeadcount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="bid-notes">
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="bid-notes"
                      className="w-full border border-gray-300 rounded-lg text-sm text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue resize-none"
                      rows={2}
                      placeholder="Any additional notes..."
                      value={bidNotes}
                      onChange={e => setBidNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={handleSubmitBid}
                    disabled={!bidVendorName.trim() || !bidRate || !bidHeadcount}
                  >
                    Submit Bid
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Post Requirement Modal */}
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post New Requirement" size="lg">
        <form onSubmit={handleSubmit(onPost)} className="space-y-4">
          <Input
            label="Requirement Title"
            placeholder="e.g., 100 Delivery Riders – NCR"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              options={[
                { value: 'Delivery Rider', label: 'Delivery Rider' },
                { value: 'Warehouse Staff', label: 'Warehouse Staff' },
                { value: 'Dispatch Officer', label: 'Dispatch Officer' },
                { value: 'Sorter', label: 'Sorter' },
                { value: 'Customer Service', label: 'Customer Service' },
                { value: 'Driver', label: 'Driver' },
                { value: 'Security', label: 'Security' },
                { value: 'Inventory Clerk', label: 'Inventory Clerk' },
                { value: 'Hub Coordinator', label: 'Hub Coordinator' },
                { value: 'Fleet Support', label: 'Fleet Support' },
              ]}
              {...register('role', { required: true })}
            />
            <Select
              label="Region"
              options={[
                { value: 'NCR', label: 'NCR' },
                { value: 'Cebu', label: 'Cebu' },
                { value: 'Davao', label: 'Davao' },
                { value: 'Laguna', label: 'Laguna' },
                { value: 'Visayas', label: 'Visayas' },
                { value: 'Luzon', label: 'Luzon' },
                { value: 'Mindanao', label: 'Mindanao' },
              ]}
              {...register('region', { required: true })}
            />
          </div>
          <Input
            label="Location"
            placeholder="e.g., Makati City / BGC, Taguig"
            {...register('location', { required: 'Location is required' })}
            error={errors.location?.message}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Headcount"
              type="number"
              min={1}
              placeholder="50"
              {...register('headcount', { required: 'Required', min: 1 })}
              error={errors.headcount?.message}
            />
            <Input
              label="Budget (₱)"
              type="number"
              min={1}
              placeholder="250000"
              {...register('budget', { required: 'Required', min: 1 })}
              error={errors.budget?.message}
            />
          </div>
          <Input
            label="Deadline"
            type="date"
            {...register('deadline', { required: 'Required' })}
            error={errors.deadline?.message}
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-lg text-sm text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue"
              rows={3}
              placeholder="Describe the requirement..."
              {...register('description')}
            />
          </div>

          {/* AI Pricing Engine Panel */}
          {watchedRole && watchedRegion && watchedHeadcount && Number(watchedHeadcount) > 0 && (() => {
            const pricing = calculatePricing(watchedRole, watchedRegion, Number(watchedHeadcount));
            return (
              <div className="bg-gradient-to-br from-asianow-dark to-asianow-blue rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator size={15} aria-hidden="true" />
                  <span className="text-sm font-semibold">AI Pricing Engine</span>
                  <span className="ml-auto text-xs text-white/60">Live calculation</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-white/10 rounded-lg p-2.5">
                    <p className="text-xs text-white/60 mb-0.5">Daily Rate / Head</p>
                    <p className="text-sm font-bold">{formatPHP(pricing.dailyBillableRate)}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5">
                    <p className="text-xs text-white/60 mb-0.5">Monthly / Head</p>
                    <p className="text-sm font-bold">{formatPHP(pricing.monthlyRatePerHead)}</p>
                  </div>
                  <div className="bg-asianow-red/30 rounded-lg p-2.5 border border-asianow-red/40">
                    <p className="text-xs text-white/70 mb-0.5">Total Monthly Budget</p>
                    <p className="text-sm font-bold">{formatPHP(pricing.totalMonthlyBudget)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                  <span>Base rate ({watchedRole}): {formatPHP(pricing.baseRate)}/day</span>
                  <span>Regional multiplier ({watchedRegion}): {pricing.regionalRate !== pricing.baseRate ? `+${formatPHP(pricing.regionalRate - pricing.baseRate)}` : 'no adjustment'}</span>
                  <span>Volume discount ({Number(watchedHeadcount)} heads): {pricing.volumeDiscountPct > 0 ? `-${pricing.volumeDiscountPct}%` : 'none'}</span>
                  <span>Employer contributions + agency fee: included</span>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Post Requirement</Button>
            <Button type="button" variant="outline" onClick={() => setShowPostModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
