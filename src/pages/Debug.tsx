import React, { useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { vendors } from '../data/vendors';
import { requirements } from '../data/requirements';
import { invoices } from '../data/billing';
import { deployments } from '../data/deployments';
import { Card, CardHeader } from '../components/ui/Card';

const routeMap = [
  { route: '/dashboard',               url: '/dashboard',                  description: 'Operations overview',         example: '/dashboard' },
  { route: '/vendors',                 url: '/vendors',                     description: 'Vendor list',                  example: '/vendors' },
  { route: '/vendors?vendor=v001',     url: '/vendors?vendor=v001',         description: 'Vendor v001 drawer open',      example: '/vendors?vendor=v001' },
  { route: '/vendors?vendor=v003',     url: '/vendors?vendor=v003',         description: 'Vendor v003 drawer open',      example: '/vendors?vendor=v003' },
  { route: '/marketplace',             url: '/marketplace',                 description: 'Requirements list',            example: '/marketplace' },
  { route: '/marketplace?req=req001',  url: '/marketplace?req=req001',      description: 'Requirement detail drawer',    example: '/marketplace?req=req001' },
  { route: '/marketplace?bids=req001', url: '/marketplace?bids=req001',     description: 'Bids modal',                   example: '/marketplace?bids=req001' },
  { route: '/operations',              url: '/operations',                  description: 'Deployment table',             example: '/operations' },
  { route: '/billing',                 url: '/billing',                     description: 'Invoices tab',                 example: '/billing' },
  { route: '/billing?tab=payouts',     url: '/billing?tab=payouts',         description: 'Payouts tab',                  example: '/billing?tab=payouts' },
  { route: '/billing?invoice=inv001',  url: '/billing?invoice=inv001',      description: 'Invoice detail drawer',        example: '/billing?invoice=inv001' },
  { route: '/analytics',               url: '/analytics',                   description: 'Analytics & charts',           example: '/analytics' },
  { route: '/compliance',              url: '/compliance',                  description: 'Compliance & alerts',          example: '/compliance' },
  { route: '/settings',                url: '/settings',                    description: 'Settings',                     example: '/settings' },
  { route: '/owner',                   url: '/owner',                       description: 'Owner alignment checklist',    example: '/owner' },
  { route: '/onboarding',              url: '/onboarding',                  description: 'Vendor onboarding wizard',     example: '/onboarding' },
  { route: '/debug',                   url: '/debug',                       description: 'This page',                    example: '/debug' },
  { route: '/login',                   url: '/login',                       description: 'Login screen',                 example: '/login' },
];

export const Debug: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const paramEntries = Array.from(searchParams.entries());

  // Vendor counts
  const totalVendors     = vendors.length;
  const accredited       = vendors.filter(v => v.status === 'Accredited').length;
  const pendingVendors   = vendors.filter(v => v.status === 'Pending').length;
  const flagged          = vendors.filter(v => v.status === 'Flagged').length;
  const rejected         = vendors.filter(v => v.status === 'Rejected').length;

  // Requirement counts
  const totalReqs        = requirements.length;
  const openReqs         = requirements.filter(r => r.status === 'Open').length;
  const inProgressReqs   = requirements.filter(r => r.status === 'In Progress').length;
  const filledReqs       = requirements.filter(r => r.status === 'Filled').length;
  const closedReqs       = requirements.filter(r => r.status === 'Closed').length;

  // Invoice counts
  const totalInvoices    = invoices.length;
  const paidInvoices     = invoices.filter(i => i.status === 'Paid').length;
  const pendingInvoices  = invoices.filter(i => i.status === 'Pending').length;
  const overdueInvoices  = invoices.filter(i => i.status === 'Overdue').length;
  const disputedInvoices = invoices.filter(i => i.status === 'Disputed').length;

  // Deployment counts
  const totalDeployments  = deployments.length;
  const activeDeployments = deployments.filter(d => d.status === 'Active').length;
  const completedDeps     = deployments.filter(d => d.status === 'Completed').length;

  const vendorLinks      = vendors.slice(0, 6);
  const requirementLinks = requirements.slice(0, 6);
  const invoiceLinks     = invoices.slice(0, 6);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" aria-label="Debug Console">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
              Internal use only
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Debug Console</h1>
          <p className="text-sm text-gray-500 mt-0.5">URL structure · data state · deep links</p>
        </div>
      </div>

      {/* URL Inspector */}
      <Card>
        <CardHeader title="URL Inspector" subtitle="Current routing state" />
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-36 flex-shrink-0">Pathname</span>
            <code className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{location.pathname}</code>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-36 flex-shrink-0">Search params</span>
            <div className="flex flex-wrap gap-2">
              {paramEntries.length === 0 ? (
                <span className="text-gray-400 text-xs italic">none</span>
              ) : (
                paramEntries.map(([key, value]) => (
                  <code key={key} className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {key}={value}
                  </code>
                ))
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-36 flex-shrink-0">Full URL</span>
            <code className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs break-all">
              {window.location.href}
            </code>
          </div>
        </div>
      </Card>

      {/* Route Map */}
      <Card padding={false}>
        <div className="p-6 pb-4">
          <CardHeader title="Route Map" subtitle="All app routes with deep-link examples" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 w-56">Route</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Example deep link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {routeMap.map(item => (
                <tr key={item.route} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3">
                    <code className="font-mono text-xs text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {item.route}
                    </code>
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-sm">{item.description}</td>
                  <td className="px-6 py-3">
                    <Link
                      to={item.example}
                      className="text-xs font-mono text-asianow-blue hover:underline hover:text-blue-700 transition-colors"
                    >
                      {item.example}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live Data Counts */}
      <Card>
        <CardHeader title="Live Data Counts" subtitle="Tallied from imported data modules" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Vendors */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Vendors</p>
            <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Accredited</span><span className="font-semibold text-green-700">{accredited}</span></div>
              <div className="flex justify-between"><span>Pending</span><span className="font-semibold text-amber-600">{pendingVendors}</span></div>
              <div className="flex justify-between"><span>Flagged</span><span className="font-semibold text-red-600">{flagged}</span></div>
              <div className="flex justify-between"><span>Rejected</span><span className="font-semibold text-gray-500">{rejected}</span></div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Requirements</p>
            <p className="text-2xl font-bold text-gray-900">{totalReqs}</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Open</span><span className="font-semibold text-blue-700">{openReqs}</span></div>
              <div className="flex justify-between"><span>In Progress</span><span className="font-semibold text-amber-600">{inProgressReqs}</span></div>
              <div className="flex justify-between"><span>Filled</span><span className="font-semibold text-green-700">{filledReqs}</span></div>
              <div className="flex justify-between"><span>Closed</span><span className="font-semibold text-gray-500">{closedReqs}</span></div>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Paid</span><span className="font-semibold text-green-700">{paidInvoices}</span></div>
              <div className="flex justify-between"><span>Pending</span><span className="font-semibold text-amber-600">{pendingInvoices}</span></div>
              <div className="flex justify-between"><span>Overdue</span><span className="font-semibold text-red-600">{overdueInvoices}</span></div>
              <div className="flex justify-between"><span>Disputed</span><span className="font-semibold text-orange-600">{disputedInvoices}</span></div>
            </div>
          </div>

          {/* Deployments */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deployments</p>
            <p className="text-2xl font-bold text-gray-900">{totalDeployments}</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Active</span><span className="font-semibold text-green-700">{activeDeployments}</span></div>
              <div className="flex justify-between"><span>Completed</span><span className="font-semibold text-gray-500">{completedDeps}</span></div>
            </div>
          </div>

        </div>
      </Card>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Vendor Quick Links */}
        <Card>
          <CardHeader title="Vendor Quick Links" subtitle="First 6 — opens vendor drawer" />
          <div className="space-y-1.5">
            {vendorLinks.map(v => (
              <Link
                key={v.id}
                to={`/vendors?vendor=${v.id}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group transition-colors"
              >
                <span className="text-sm text-gray-800 group-hover:text-asianow-blue transition-colors truncate">{v.companyName}</span>
                <code className="font-mono text-xs text-gray-400 group-hover:text-asianow-blue flex-shrink-0 transition-colors">{v.id}</code>
              </Link>
            ))}
          </div>
        </Card>

        {/* Requirement Quick Links */}
        <Card>
          <CardHeader title="Requirement Quick Links" subtitle="First 6 — opens detail drawer" />
          <div className="space-y-1.5">
            {requirementLinks.map(r => (
              <Link
                key={r.id}
                to={`/marketplace?req=${r.id}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group transition-colors"
              >
                <span className="text-sm text-gray-800 group-hover:text-asianow-blue transition-colors truncate">{r.title}</span>
                <code className="font-mono text-xs text-gray-400 group-hover:text-asianow-blue flex-shrink-0 transition-colors">{r.id}</code>
              </Link>
            ))}
          </div>
        </Card>

        {/* Invoice Quick Links */}
        <Card>
          <CardHeader title="Invoice Quick Links" subtitle="First 6 — opens invoice drawer" />
          <div className="space-y-1.5">
            {invoiceLinks.map(i => (
              <Link
                key={i.id}
                to={`/billing?invoice=${i.id}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group transition-colors"
              >
                <span className="text-sm text-gray-800 group-hover:text-asianow-blue transition-colors truncate">{i.invoiceNumber}</span>
                <code className="font-mono text-xs text-gray-400 group-hover:text-asianow-blue flex-shrink-0 transition-colors">{i.id}</code>
              </Link>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};
