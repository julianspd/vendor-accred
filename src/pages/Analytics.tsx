import React, { useState } from 'react';
import { AlertTriangle, Brain, TrendingUp, Eye, CheckCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine,
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { fraudAlerts, deploymentTrend, vendorPerformance } from '../data/analytics';
import { deployments } from '../data/deployments';

const demandForecast = [
  { month: 'Jun 2026', ncr: 780, cebu: 190, davao: 130, total: 1270 },
  { month: 'Jul 2026', ncr: 850, cebu: 210, davao: 160, total: 1390 },
  { month: 'Aug 2026', ncr: 920, cebu: 225, davao: 180, total: 1500 },
  { month: 'Sep 2026', ncr: 890, cebu: 220, davao: 170, total: 1450 },
  { month: 'Oct 2026', ncr: 960, cebu: 240, davao: 200, total: 1580 },
  { month: 'Nov 2026', ncr: 1050, cebu: 270, davao: 230, total: 1730 },
  { month: 'Dec 2026', ncr: 1200, cebu: 310, davao: 270, total: 1980 },
];

const riskData = [
  { vendor: 'Northern Luzon', compliance: 30, billing: 25, manpower: 20, docs: 15 },
  { vendor: 'Zamboanga FT', compliance: 35, billing: 40, manpower: 30, docs: 20 },
  { vendor: 'Rizal Multi', compliance: 65, billing: 55, manpower: 70, docs: 80 },
  { vendor: 'Pasig River', compliance: 70, billing: 75, manpower: 65, docs: 85 },
  { vendor: 'Cebu Logistics', compliance: 90, billing: 88, manpower: 92, docs: 95 },
];

export const Analytics: React.FC = () => {
  const [alertFilter, setAlertFilter] = useState<string>('All');
  const [alerts, setAlerts] = useState(fraudAlerts);

  const filteredAlerts = alertFilter === 'All'
    ? alerts
    : alerts.filter(a => a.status === alertFilter || a.severity === alertFilter || a.type === alertFilter);

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' as const } : a));
  };

  // --- 9.8 Demand Forecast: compute from deployment data ---
  const RIDER_ROLES = new Set(['Delivery Rider', 'Driver']);
  const WAREHOUSE_ROLES = new Set(['Warehouse Staff', 'Sorter', 'Inventory Clerk']);
  const DISPATCH_ROLES = new Set(['Dispatch Officer', 'Customer Service']);

  // Bucket each deployment into its start month (2026-01 … 2026-04 = 4 complete months)
  const historicalBuckets: Record<string, { Riders: number; Warehouse: number; Dispatch: number }> = {};
  const HIST_MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04'];
  HIST_MONTHS.forEach(m => { historicalBuckets[m] = { Riders: 0, Warehouse: 0, Dispatch: 0 }; });

  deployments.forEach(d => {
    const monthKey = d.startDate.slice(0, 7);
    if (!HIST_MONTHS.includes(monthKey)) return;
    if (RIDER_ROLES.has(d.role)) historicalBuckets[monthKey].Riders += d.headcount;
    else if (WAREHOUSE_ROLES.has(d.role)) historicalBuckets[monthKey].Warehouse += d.headcount;
    else if (DISPATCH_ROLES.has(d.role)) historicalBuckets[monthKey].Dispatch += d.headcount;
  });

  // Simple linear regression helper
  const linearProject = (values: number[], stepsAhead: number[]): number[] => {
    const n = values.length;
    const xs = values.map((_, i) => i);
    const sx = xs.reduce((a, b) => a + b, 0);
    const sy = values.reduce((a, b) => a + b, 0);
    const sxy = xs.reduce((acc, x, i) => acc + x * values[i], 0);
    const sx2 = xs.reduce((acc, x) => acc + x * x, 0);
    const denom = n * sx2 - sx * sx;
    const slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
    const intercept = (sy - slope * sx) / n;
    return stepsAhead.map(step => Math.max(0, Math.round(intercept + slope * step)));
  };

  const histValues = (key: 'Riders' | 'Warehouse' | 'Dispatch') =>
    HIST_MONTHS.map(m => historicalBuckets[m][key]);

  const forecastSteps = [4, 5, 6]; // steps 4, 5, 6 = Jun, Jul, Aug
  const projRiders    = linearProject(histValues('Riders'),   forecastSteps);
  const projWarehouse = linearProject(histValues('Warehouse'), forecastSteps);
  const projDispatch  = linearProject(histValues('Dispatch'),  forecastSteps);

  const MONTH_LABELS: Record<string, string> = {
    '2026-01': 'Jan', '2026-02': 'Feb', '2026-03': 'Mar', '2026-04': 'Apr',
  };
  const FORECAST_LABELS = ['Jun', 'Jul', 'Aug'];

  // Build unified chart data with split keys:
  //   *Hist keys hold values for Jan–Apr, null for Jun–Aug (solid lines)
  //   *Proj keys hold null for Jan–Apr, values for Jun–Aug (dashed lines)
  // The Apr→Jun bridge: Apr point also appears in *Proj so lines connect seamlessly.
  const combinedForecastData = [
    ...HIST_MONTHS.map((m, idx) => ({
      month: MONTH_LABELS[m],
      RidersHist:    historicalBuckets[m].Riders,
      WarehouseHist: historicalBuckets[m].Warehouse,
      DispatchHist:  historicalBuckets[m].Dispatch,
      // Give the last historical point to *Proj as well so the line bridges the gap
      RidersProj:    idx === HIST_MONTHS.length - 1 ? historicalBuckets[m].Riders    : null,
      WarehouseProj: idx === HIST_MONTHS.length - 1 ? historicalBuckets[m].Warehouse : null,
      DispatchProj:  idx === HIST_MONTHS.length - 1 ? historicalBuckets[m].Dispatch  : null,
    })),
    ...FORECAST_LABELS.map((label, i) => ({
      month: label,
      RidersHist:    null,
      WarehouseHist: null,
      DispatchHist:  null,
      RidersProj:    projRiders[i],
      WarehouseProj: projWarehouse[i],
      DispatchProj:  projDispatch[i],
    })),
  ];

  // KPI cards
  const junTotal = projRiders[0] + projWarehouse[0] + projDispatch[0];
  const aprTotal = historicalBuckets['2026-04'].Riders
    + historicalBuckets['2026-04'].Warehouse
    + historicalBuckets['2026-04'].Dispatch;
  const momGrowthPct = aprTotal > 0 ? ((junTotal - aprTotal) / aprTotal * 100).toFixed(1) : '0.0';
  const junRoleEntries: [string, number][] = [
    ['Riders', projRiders[0]],
    ['Warehouse', projWarehouse[0]],
    ['Dispatch', projDispatch[0]],
  ];
  const highestDemandRole = junRoleEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  return (
    <div className="space-y-6" aria-label="AI Analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Fraud detection, performance insights, and demand forecasting</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-asianow-dark/5 rounded-lg px-3 py-2">
          <Brain size={16} className="text-asianow-blue" aria-hidden="true" />
          <span className="text-sm font-medium text-asianow-dark">AI Engine Active</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {/* Fraud Alert Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Alerts', value: alerts.filter(a => a.status === 'Open').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Investigating', value: alerts.filter(a => a.status === 'Investigating').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Resolved', value: alerts.filter(a => a.status === 'Resolved').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'High Severity', value: alerts.filter(a => a.severity === 'High').length, color: 'text-asianow-red', bg: 'bg-red-50' },
        ].map(s => (
          <Card key={s.label}>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Fraud Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="AI Fraud Alerts" subtitle="Automatically detected anomalies" />
          <div className="flex gap-2">
            {['All', 'Open', 'Investigating', 'Resolved'].map(f => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  alertFilter === f ? 'bg-asianow-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-pressed={alertFilter === f}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${
                alert.status === 'Resolved' ? 'border-green-100 bg-green-50/30' :
                alert.severity === 'High' ? 'border-red-200 bg-red-50/50' :
                alert.severity === 'Medium' ? 'border-yellow-200 bg-yellow-50/50' :
                'border-blue-100 bg-blue-50/30'
              }`}
              role="article"
              aria-label={`${alert.severity} severity fraud alert: ${alert.type}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-1 p-1.5 rounded-lg ${
                    alert.status === 'Resolved' ? 'bg-green-100' :
                    alert.severity === 'High' ? 'bg-red-100' :
                    alert.severity === 'Medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`} aria-hidden="true">
                    {alert.status === 'Resolved'
                      ? <CheckCircle size={14} className="text-green-600" />
                      : <AlertTriangle size={14} className={alert.severity === 'High' ? 'text-red-600' : 'text-yellow-600'} />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{alert.type}</span>
                      <Badge variant={alert.severity === 'High' ? 'danger' : alert.severity === 'Medium' ? 'warning' : 'info'}>
                        {alert.severity}
                      </Badge>
                      <StatusBadge status={alert.status} />
                    </div>
                    <p className="text-xs font-semibold text-asianow-blue mb-1">{alert.vendorName}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-400 mt-1.5">Detected {alert.detectedDate}</p>
                  </div>
                </div>
                {alert.status !== 'Resolved' && (
                  <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Trend */}
        <Card>
          <CardHeader title="Deployments Over Time" subtitle="Monthly worker deployments by region" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={deploymentTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="ncr" stackId="1" stroke="#E31E24" fill="#E31E2420" name="NCR" />
              <Area type="monotone" dataKey="cebu" stackId="1" stroke="#1A5FA8" fill="#1A5FA820" name="Cebu" />
              <Area type="monotone" dataKey="davao" stackId="1" stroke="#0D3B73" fill="#0D3B7320" name="Davao" />
              <Area type="monotone" dataKey="laguna" stackId="1" stroke="#22c55e" fill="#22c55e20" name="Laguna" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Vendor Performance */}
        <Card>
          <CardHeader title="Vendor Performance Scores" subtitle="Top 10 vendors by overall score" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={vendorPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="vendorName" type="category" tick={{ fontSize: 9 }} width={120} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="score" name="Score" fill="#1A5FA8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 9.8 — Predictive Demand Forecasting (role-based, computed from deployment history) */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Demand Forecast</h2>
        <p className="text-sm text-gray-500 mb-4">Predicted headcount by role category — linear trend from 4-month historical data</p>

        {/* Forecast KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Card>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jun 2026 — Predicted Total</p>
            <p className="text-3xl font-bold text-asianow-blue">{junTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">workers across all roles</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Month-over-Month Growth</p>
            <p className={`text-3xl font-bold ${parseFloat(momGrowthPct) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(momGrowthPct) >= 0 ? '+' : ''}{momGrowthPct}%
            </p>
            <p className="text-xs text-gray-400 mt-1">vs Apr 2026 (last complete month)</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Highest-Demand Role — Jun</p>
            <p className="text-3xl font-bold text-asianow-dark">{highestDemandRole}</p>
            <p className="text-xs text-gray-400 mt-1">{junRoleEntries.find(([k]) => k === highestDemandRole)?.[1].toLocaleString()} projected workers</p>
          </Card>
        </div>

        {/* Forecast Chart */}
        <Card>
          <div className="flex items-start justify-between mb-2">
            <CardHeader
              title="Role-Based Headcount Forecast"
              subtitle="Jan – Apr historical · Jun – Aug projected"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={combinedForecastData} margin={{ top: 10, right: 16, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradRidersH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E31E24" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#E31E24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradWarehouseH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A5FA8" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#1A5FA8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDispatchH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D3B73" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0D3B73" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRidersP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E31E24" stopOpacity={0.07} />
                  <stop offset="95%" stopColor="#E31E24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradWarehouseP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A5FA8" stopOpacity={0.07} />
                  <stop offset="95%" stopColor="#1A5FA8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDispatchP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D3B73" stopOpacity={0.07} />
                  <stop offset="95%" stopColor="#0D3B73" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value: number, name: string) => {
                  const isProj = name.includes('(proj)');
                  const label = isProj ? name.replace(' (proj)', '') : name;
                  return [`${value} workers${isProj ? ' (projected)' : ''}`, label];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => value.replace(' (proj)', '')}
              />
              {/* Historical solid lines — null for Jun–Aug */}
              <Area connectNulls={false} type="monotone" dataKey="RidersHist"
                stroke="#E31E24" fill="url(#gradRidersH)" strokeWidth={2}
                name="Riders" legendType="line" />
              <Area connectNulls={false} type="monotone" dataKey="WarehouseHist"
                stroke="#1A5FA8" fill="url(#gradWarehouseH)" strokeWidth={2}
                name="Warehouse" legendType="line" />
              <Area connectNulls={false} type="monotone" dataKey="DispatchHist"
                stroke="#0D3B73" fill="url(#gradDispatchH)" strokeWidth={2}
                name="Dispatch" legendType="line" />
              {/* Projected dashed lines — null for Jan–Mar, bridges from Apr */}
              <Area connectNulls={false} type="monotone" dataKey="RidersProj"
                stroke="#E31E24" fill="url(#gradRidersP)" strokeWidth={2}
                strokeDasharray="5 5" strokeOpacity={0.7}
                name="Riders (proj)" legendType="none" />
              <Area connectNulls={false} type="monotone" dataKey="WarehouseProj"
                stroke="#1A5FA8" fill="url(#gradWarehouseP)" strokeWidth={2}
                strokeDasharray="5 5" strokeOpacity={0.7}
                name="Warehouse (proj)" legendType="none" />
              <Area connectNulls={false} type="monotone" dataKey="DispatchProj"
                stroke="#0D3B73" fill="url(#gradDispatchP)" strokeWidth={2}
                strokeDasharray="5 5" strokeOpacity={0.7}
                name="Dispatch (proj)" legendType="none" />
              {/* Vertical divider at the forecast boundary */}
              <ReferenceLine
                x="Apr"
                stroke="#9ca3af"
                strokeDasharray="4 4"
                label={{ value: 'Forecast →', position: 'insideTopRight', fontSize: 11, fill: '#6b7280' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-3 text-center italic">
            Forecast based on linear trend from 4-month historical data (Jan – Apr 2026). May 2026 excluded as month is in progress.
          </p>
        </Card>
      </div>

      {/* Demand Forecast */}
      <Card>
        <CardHeader title="Manpower Demand Forecast" subtitle="AI-projected headcount requirements — Jun to Dec 2026" />
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800 font-medium">
            AI Projection: Peak demand expected in December 2026 driven by holiday e-commerce surge (+56% vs current).
            Recommend activating vendor pipeline for NCR and Cebu by October 2026.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={demandForecast} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="total" stroke="#E31E24" fill="#E31E2415" name="Total Projected" strokeWidth={2} />
            <Area type="monotone" dataKey="ncr" stroke="#1A5FA8" fill="#1A5FA810" name="NCR" />
            <Area type="monotone" dataKey="cebu" stroke="#22c55e" fill="#22c55e10" name="Cebu" />
            <Area type="monotone" dataKey="davao" stroke="#f59e0b" fill="#f59e0b10" name="Davao" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Vendor Risk Heatmap */}
      <Card padding={false}>
        <div className="p-6 pb-3">
          <CardHeader title="Vendor Risk Heatmap" subtitle="Risk scoring across key compliance dimensions" />
        </div>
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full text-sm" role="table" aria-label="Vendor risk scores">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Compliance</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Billing</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Manpower Integrity</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall Risk</th>
              </tr>
            </thead>
            <tbody>
              {riskData.map(row => {
                const avg = Math.round((row.compliance + row.billing + row.manpower + row.docs) / 4);
                const riskLevel = avg >= 70 ? 'Low' : avg >= 50 ? 'Medium' : 'High';
                const getCell = (score: number) => (
                  <div className="flex items-center gap-2">
                    <div className={`w-20 h-2 rounded-full ${
                      score >= 70 ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <div
                        className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${score >= 70 ? 'text-green-700' : score >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>{score}</span>
                  </div>
                );
                return (
                  <tr key={row.vendor} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{row.vendor}</td>
                    <td className="py-3 px-4">{getCell(row.compliance)}</td>
                    <td className="py-3 px-4">{getCell(row.billing)}</td>
                    <td className="py-3 px-4">{getCell(row.manpower)}</td>
                    <td className="py-3 px-4">{getCell(row.docs)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={riskLevel === 'Low' ? 'success' : riskLevel === 'Medium' ? 'warning' : 'danger'}>
                        {riskLevel} Risk ({avg})
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
