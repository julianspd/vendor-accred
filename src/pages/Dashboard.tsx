import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Truck, Receipt, TrendingUp, AlertTriangle,
  CheckCircle, Clock, ArrowUpRight, ShoppingCart, ChevronRight,
  Wallet, FileText, Bell,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { vendors } from '../data/vendors';
import { deployments } from '../data/deployments';
import { invoices } from '../data/billing';
import { auditLogs } from '../data/analytics';
import { requirements } from '../data/requirements';

const RIDER_ROLES = ['Delivery Rider'];
const WAREHOUSE_ROLES = ['Sorter', 'Warehouse Staff', 'Inventory Clerk'];
const DISPATCH_ROLES = ['Dispatch Officer', 'Customer Service', 'Driver'];

const regionData = ['NCR', 'Cebu', 'Davao', 'Laguna', 'Visayas', 'Luzon', 'Mindanao'].map(region => {
  const active = deployments.filter(d => d.region === region && d.status === 'Active');
  return {
    region,
    riders:    active.filter(d => RIDER_ROLES.includes(d.role)).reduce((s, d) => s + d.headcount, 0),
    warehouse: active.filter(d => WAREHOUSE_ROLES.includes(d.role)).reduce((s, d) => s + d.headcount, 0),
    dispatch:  active.filter(d => DISPATCH_ROLES.includes(d.role)).reduce((s, d) => s + d.headcount, 0),
  };
});

const billingTrend = [
  { month: 'Jan', billed: 4.2, collected: 4.0 },
  { month: 'Feb', billed: 4.5, collected: 4.3 },
  { month: 'Mar', billed: 4.9, collected: 4.6 },
  { month: 'Apr', billed: 5.6, collected: 5.1 },
  { month: 'May', billed: 5.8, collected: 4.2 },
];

const kpis = [
  {
    title: 'Active Vendors',
    value: vendors.filter(v => v.status === 'Accredited').length.toString(),
    change: '+2 this month',
    trend: 'up',
    icon: Users,
    color: 'text-asianow-blue',
    bg: 'bg-blue-50',
    link: '/vendors',
    linkLabel: 'Manage vendors',
  },
  {
    title: 'Pending Accreditations',
    value: vendors.filter(v => v.status === 'Pending').length.toString(),
    change: '3 awaiting review',
    trend: 'neutral',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    link: '/vendors',
    linkLabel: 'Review now',
  },
  {
    title: 'Total Deployed Workers',
    value: deployments.filter(d => d.status === 'Active').reduce((s, d) => s + d.headcount, 0).toLocaleString(),
    change: '+215 vs last month',
    trend: 'up',
    icon: Truck,
    color: 'text-green-600',
    bg: 'bg-green-50',
    link: '/operations',
    linkLabel: 'View operations',
  },
  {
    title: 'Monthly Billing (Apr)',
    value: '₱' + (invoices.filter(i => i.period === 'April 2026').reduce((s, i) => s + i.amount, 0) / 1000000).toFixed(1) + 'M',
    change: '+12% vs March',
    trend: 'up',
    icon: Receipt,
    color: 'text-asianow-red',
    bg: 'bg-red-50',
    link: '/billing',
    linkLabel: 'View billing',
  },
];

const actionItems = [
  {
    type: 'warning' as const,
    title: `${vendors.filter(v => v.status === 'Pending').length} vendors pending accreditation`,
    desc: 'Review AI scores and document checklists',
    link: '/vendors',
    linkLabel: 'Review',
  },
  {
    type: 'danger' as const,
    title: `${invoices.filter(i => i.status === 'Overdue').length} overdue invoice${invoices.filter(i => i.status === 'Overdue').length !== 1 ? 's' : ''}`,
    desc: 'Payment escalation notices sent',
    link: '/billing',
    linkLabel: 'View invoices',
  },
  {
    type: 'warning' as const,
    title: `${vendors.filter(v => v.status === 'Flagged').length} vendors flagged for compliance`,
    desc: 'Document expiry or audit issues',
    link: '/compliance',
    linkLabel: 'Check compliance',
  },
  {
    type: 'info' as const,
    title: `${requirements.filter(r => r.status === 'Open').length} open marketplace requirements`,
    desc: `${requirements.filter(r => r.bids.length === 0).length} with no bids yet`,
    link: '/marketplace',
    linkLabel: 'View marketplace',
  },
];

const recentVendors = vendors.filter(v => ['Pending', 'Flagged'].includes(v.status)).slice(0, 5);

export const Dashboard: React.FC = () => {
  const openReqs = requirements.filter(r => r.status === 'Open');
  const urgentReqs = openReqs.filter(r => {
    const days = Math.ceil((new Date(r.deadline).getTime() - new Date().getTime()) / 86400000);
    return days <= 7 && days > 0;
  });

  return (
    <div className="space-y-6" aria-label="Dashboard">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">AsiaNow Vendor & Workforce Management — May 14, 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {actionItems.filter(a => a.type === 'danger').length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-full">
              <Bell size={12} aria-hidden="true" />
              {actionItems.filter(a => a.type !== 'info').length} items need attention
            </span>
          )}
          <span
            className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full"
            aria-live="polite"
            aria-label="System status: live data"
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
            Live Data
          </span>
        </div>
      </div>

      {/* Action Required Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Action required">
        {actionItems.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${
              item.type === 'danger' ? 'bg-red-50 border-red-100' :
              item.type === 'warning' ? 'bg-yellow-50 border-yellow-100' :
              'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex items-start gap-2">
              {item.type === 'danger' && <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />}
              {item.type === 'warning' && <Clock size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" aria-hidden="true" />}
              {item.type === 'info' && <ShoppingCart size={14} className="text-asianow-blue mt-0.5 flex-shrink-0" aria-hidden="true" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 leading-snug">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
            <Link
              to={item.link}
              className={`text-xs font-semibold flex items-center gap-1 ${
                item.type === 'danger' ? 'text-red-600' :
                item.type === 'warning' ? 'text-yellow-700' :
                'text-asianow-blue'
              }`}
            >
              {item.linkLabel} <ChevronRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      {/* KPI Cards — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key performance indicators">
        {kpis.map((kpi) => (
          <Link key={kpi.title} to={kpi.link} className="block group">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.title}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === 'up' && <TrendingUp size={13} className="text-green-500" aria-hidden="true" />}
                    <span className="text-xs text-gray-500">{kpi.change}</span>
                  </div>
                  <p className="text-xs text-asianow-blue font-medium mt-2 flex items-center gap-1 group-hover:underline">
                    {kpi.linkLabel} <ArrowUpRight size={11} />
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                  <kpi.icon size={20} className={kpi.color} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deployments bar chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Deployments by Region" subtitle="Active headcount across all regions" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={regionData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} workers`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="riders" name="Delivery Riders" fill="#E31E24" radius={[3, 3, 0, 0]} />
                <Bar dataKey="warehouse" name="Warehouse" fill="#1A5FA8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="dispatch" name="Dispatch" fill="#0D3B73" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card padding={false}>
            <div className="p-4 md:p-6 pb-3 flex items-center justify-between">
              <CardHeader title="Recent Activity" />
              <Link to="/compliance" className="text-xs text-asianow-blue font-medium flex items-center gap-1 hover:underline">
                All logs <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {auditLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="px-4 md:px-6 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      log.action.includes('Alert') || log.action.includes('Fraud') ? 'bg-red-500' :
                      log.action.includes('Approved') || log.action.includes('Activated') ? 'bg-green-500' :
                      log.action.includes('Disputed') || log.action.includes('Flagged') ? 'bg-yellow-500' :
                      'bg-blue-400'
                    }`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{log.action}</p>
                      {log.vendorName && (
                        <p className="text-xs text-gray-500 truncate">{log.vendorName}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Billing trend + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing trend */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <CardHeader title="Billing Trend" subtitle="Monthly billed vs collected (₱M)" />
              <Link to="/billing" className="text-xs text-asianow-blue font-medium flex items-center gap-1 hover:underline flex-shrink-0 mt-1">
                View billing <ArrowUpRight size={11} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={billingTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A5FA8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A5FA8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${v}M`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value: number, name: string) => [`₱${value}M`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="billed" name="Billed" stroke="#1A5FA8" fill="url(#billedGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#22c55e" fill="url(#collectedGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick stats */}
        <div className="space-y-3">
          {[
            { icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', value: invoices.filter(i => i.status === 'Paid').length, label: 'Paid Invoices', link: '/billing' },
            { icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600', value: invoices.filter(i => i.status === 'Pending').length, label: 'Pending Invoices', link: '/billing' },
            { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-asianow-red', value: vendors.filter(v => v.status === 'Flagged').length, label: 'Flagged Vendors', link: '/vendors' },
            { icon: Truck, bg: 'bg-blue-50', color: 'text-asianow-blue', value: deployments.filter(d => d.status === 'Active').length, label: 'Active Deployments', link: '/operations' },
            { icon: ShoppingCart, bg: 'bg-purple-50', color: 'text-purple-600', value: openReqs.length, label: 'Open Requirements', link: '/marketplace' },
            { icon: Wallet, bg: 'bg-teal-50', color: 'text-teal-600', value: '₱8.42M', label: 'Wallet Balance', link: '/billing' },
          ].map(stat => (
            <Link key={stat.label} to={stat.link} className="block group">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stat.icon size={16} className={stat.color} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-asianow-blue transition-colors" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Urgent requirements */}
      {urgentReqs.length > 0 && (
        <Card padding={false}>
          <div className="p-4 md:p-6 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Urgent Open Requirements</h3>
              <p className="text-sm text-gray-500 mt-0.5">Closing within 7 days — need vendor bids</p>
            </div>
            <Link to="/marketplace" className="flex items-center gap-1 text-sm text-asianow-blue hover:underline font-medium">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Urgent requirements">
              <thead>
                <tr className="border-y border-gray-100">
                  <th scope="col" className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Requirement</th>
                  <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Region</th>
                  <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Headcount</th>
                  <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Budget</th>
                  <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                  <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bids</th>
                </tr>
              </thead>
              <tbody>
                {urgentReqs.slice(0, 5).map(req => {
                  const daysLeft = Math.ceil((new Date(req.deadline).getTime() - new Date().getTime()) / 86400000);
                  return (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 md:px-6">
                        <p className="font-medium text-gray-900 text-sm">{req.title}</p>
                        <p className="text-xs text-gray-500">{req.role}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs hidden sm:table-cell">{req.region}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{req.headcount}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs hidden md:table-cell">₱{req.budget.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-red-600">{daysLeft}d left</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={req.bids.length > 0 ? 'info' : 'danger'} size="sm">
                          {req.bids.length} bid{req.bids.length !== 1 ? 's' : ''}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Vendor Applications */}
      <Card padding={false}>
        <div className="p-4 md:p-6 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Vendor Applications</h3>
            <p className="text-sm text-gray-500 mt-0.5">Vendors requiring attention</p>
          </div>
          <Link to="/vendors" className="flex items-center gap-1 text-sm text-asianow-blue hover:underline font-medium">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Recent vendor applications">
            <thead>
              <tr className="border-y border-gray-100">
                <th scope="col" className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Region</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">AI Score</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Workers</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {recentVendors.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 md:px-6">
                    <div>
                      <p className="font-medium text-gray-900">{v.companyName}</p>
                      <p className="text-xs text-gray-500">{v.contactPerson}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{v.region}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5" aria-hidden="true">
                        <div
                          className={`h-1.5 rounded-full ${v.aiScore >= 70 ? 'bg-green-500' : v.aiScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${v.aiScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{v.aiScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 hidden md:table-cell">{v.workerCount}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">{v.submittedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
