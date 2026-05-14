import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Truck, Receipt, TrendingUp, AlertTriangle,
  CheckCircle, Clock, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { vendors } from '../data/vendors';
import { deployments } from '../data/deployments';
import { invoices } from '../data/billing';
import { auditLogs } from '../data/analytics';

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

const kpis = [
  {
    title: 'Active Vendors',
    value: vendors.filter(v => v.status === 'Accredited').length.toString(),
    change: '+2 this month',
    trend: 'up',
    icon: Users,
    color: 'text-asianow-blue',
    bg: 'bg-blue-50',
  },
  {
    title: 'Pending Accreditations',
    value: vendors.filter(v => v.status === 'Pending').length.toString(),
    change: '3 awaiting review',
    trend: 'neutral',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  {
    title: 'Total Deployed Workers',
    value: deployments.filter(d => d.status === 'Active').reduce((s, d) => s + d.headcount, 0).toLocaleString(),
    change: '+215 vs last month',
    trend: 'up',
    icon: Truck,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Monthly Billing (Apr)',
    value: '₱' + (invoices.filter(i => i.period === 'April 2026').reduce((s, i) => s + i.amount, 0) / 1000000).toFixed(1) + 'M',
    change: '+12% vs March',
    trend: 'up',
    icon: Receipt,
    color: 'text-asianow-red',
    bg: 'bg-red-50',
  },
];

const recentVendors = vendors.filter(v => ['Pending', 'Flagged'].includes(v.status)).slice(0, 5);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6" aria-label="Dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">AsiaNow Vendor & Workforce Management — May 12, 2026</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key performance indicators">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.title}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === 'up' && <TrendingUp size={13} className="text-green-500" aria-hidden="true" />}
                  <span className="text-xs text-gray-500">{kpi.change}</span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                <kpi.icon size={20} className={kpi.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Deployments by Region" subtitle="Active headcount across all regions" />
            <ResponsiveContainer width="100%" height={260}>
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

        {/* Activity Feed */}
        <div>
          <Card padding={false}>
            <div className="p-6 pb-3">
              <CardHeader title="Recent Activity" />
            </div>
            <div className="divide-y divide-gray-50">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
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

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{invoices.filter(i => i.status === 'Paid').length}</p>
              <p className="text-xs text-gray-500">Paid Invoices</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-yellow-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{invoices.filter(i => i.status === 'Pending').length}</p>
              <p className="text-xs text-gray-500">Pending Invoices</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={18} className="text-asianow-red" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vendors.filter(v => v.status === 'Flagged').length}</p>
              <p className="text-xs text-gray-500">Flagged Vendors</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Truck size={18} className="text-asianow-blue" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{deployments.filter(d => d.status === 'Active').length}</p>
              <p className="text-xs text-gray-500">Active Deployments</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Vendor Applications */}
      <Card padding={false}>
        <div className="p-6 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Vendor Applications</h3>
            <p className="text-sm text-gray-500 mt-0.5">Vendors requiring attention</p>
          </div>
          <Link
            to="/vendors"
            className="flex items-center gap-1 text-sm text-asianow-blue hover:underline font-medium"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Recent vendor applications">
            <thead>
              <tr className="border-y border-gray-100">
                <th scope="col" className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Score</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {recentVendors.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 table-row-hover">
                  <td className="py-3 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{v.companyName}</p>
                      <p className="text-xs text-gray-500">{v.contactPerson}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{v.region}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-gray-500 text-xs">{v.submittedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
