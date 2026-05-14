import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, ChevronDown, ChevronUp, Download } from 'lucide-react';

type ItemStatus = 'done' | 'in-progress' | 'next' | 'planned';

interface AlignmentItem {
  id: string;
  text: string;
  status: ItemStatus;
  note?: string;
}

interface AlignmentSection {
  id: string;
  number: number;
  title: string;
  items: AlignmentItem[];
}

const sections: AlignmentSection[] = [
  {
    id: 's1', number: 1, title: 'CORE PLATFORM OBJECTIVES',
    items: [
      { id: '1.1', text: 'Vendor accreditation and compliance management across all regions', status: 'done' },
      { id: '1.2', text: 'AI-driven vendor scoring and risk classification (Low / Medium / High)', status: 'done' },
      { id: '1.3', text: 'Manpower requirement posting and vendor bidding marketplace', status: 'done' },
      { id: '1.4', text: 'Operations and deployment tracking by region and role', status: 'done' },
      { id: '1.5', text: 'Reverse billing, invoice management, and payout ledger', status: 'done' },
      { id: '1.6', text: 'Compliance monitoring with audit trail and violation tracking', status: 'done' },
      { id: '1.7', text: 'Analytics and business intelligence dashboard', status: 'done' },
      { id: '1.8', text: 'Mobile-first responsive design (375px iPhone target)', status: 'done' },
    ],
  },
  {
    id: 's2', number: 2, title: 'VENDOR ACCREDITATION',
    items: [
      { id: '2.1', text: 'Vendor list with status filters (Accredited, Pending, Flagged, Rejected)', status: 'done' },
      { id: '2.2', text: 'Clickable status cards filter the vendor table instantly', status: 'done' },
      { id: '2.3', text: 'Slide-in vendor detail drawer with 3 tabs: Overview / Documents / Performance', status: 'done' },
      { id: '2.4', text: 'AI Accreditation Score (0–100) with compliance and track-record sub-scores', status: 'done' },
      { id: '2.5', text: 'Document checklist with per-doc status (Verified, Submitted, Missing, Expired)', status: 'done' },
      { id: '2.6', text: 'Approve & Accredit / Reject actions with live state update', status: 'done' },
      { id: '2.7', text: 'Deployment performance history chart (monthly deployed vs target)', status: 'done' },
      { id: '2.8', text: 'Quick contact bar with Call and Email links directly in drawer', status: 'done' },
      { id: '2.9', text: 'Mobile card view replaces table on small screens', status: 'done' },
      { id: '2.10', text: 'Billing summary per vendor inside drawer', status: 'done' },
      { id: '2.11', text: 'Real DTI/SEC, BIR, SSS, PhilHealth, DOLE government API verification', status: 'next', note: 'Requires Supabase + real API keys' },
    ],
  },
  {
    id: 's3', number: 3, title: 'VENDOR ONBOARDING FLOW',
    items: [
      { id: '3.1', text: '4-step guided onboarding wizard (Info → Documents → Contract → Verification)', status: 'done' },
      { id: '3.2', text: 'OCR document scan simulation with 5-stage progress and field extraction display', status: 'done' },
      { id: '3.3', text: 'Dynamic contract generation — Manpower Services Agreement with all vendor fields substituted', status: 'done' },
      { id: '3.4', text: 'Sequential government agency verification with per-agency status and reference codes', status: 'done' },
      { id: '3.5', text: 'Real file upload to Supabase Storage for document persistence', status: 'next', note: 'Requires Supabase Storage bucket' },
      { id: '3.6', text: 'Actual OCR via Google Vision or AWS Textract', status: 'planned' },
      { id: '3.7', text: 'E-signature integration for contract signing', status: 'planned' },
    ],
  },
  {
    id: 's4', number: 4, title: 'REQUIREMENT MARKETPLACE',
    items: [
      { id: '4.1', text: 'Requirement cards grid with role-color coding and status badges', status: 'done' },
      { id: '4.2', text: 'Clickable status summary cards (Open, In Progress, Filled, Closed) filter list', status: 'done' },
      { id: '4.3', text: 'Full-detail side drawer on card click — description, metadata, budget', status: 'done' },
      { id: '4.4', text: 'AI Pricing Engine panel — live daily/monthly/total calculation as form fills', status: 'done' },
      { id: '4.5', text: 'AI Auto-Routing Engine in bids modal — ranked vendor matches with score bars', status: 'done' },
      { id: '4.6', text: 'Post New Requirement modal with full form validation', status: 'done' },
      { id: '4.7', text: 'Search + 4-filter bar (region, role, status, category)', status: 'done' },
      { id: '4.8', text: 'Deadline countdown with urgent color coding (≤7 days = red)', status: 'done' },
      { id: '4.9', text: 'Vendor bid submission form (vendors submit bids from their portal)', status: 'planned' },
      { id: '4.10', text: 'Bid acceptance / award flow with vendor notification', status: 'planned' },
    ],
  },
  {
    id: 's5', number: 5, title: 'OPERATIONS & DEPLOYMENT',
    items: [
      { id: '5.1', text: 'Active deployments table with region, role, vendor, headcount, status', status: 'done' },
      { id: '5.2', text: 'Auto-routing modal per deployment row — ranked vendor suggestions with AI scores', status: 'done' },
      { id: '5.3', text: 'AI Pricing Engine embedded in routing modal for budget suggestions', status: 'done' },
      { id: '5.4', text: 'Filter by region, role, status, and date range', status: 'done' },
      { id: '5.5', text: 'Mobile responsive table with column hiding at breakpoints', status: 'done' },
      { id: '5.6', text: 'Real-time deployment status updates via Supabase Realtime', status: 'next', note: 'Requires Supabase Realtime subscription' },
      { id: '5.7', text: 'GPS-based attendance and deployment confirmation', status: 'planned' },
    ],
  },
  {
    id: 's6', number: 6, title: 'BILLING & COLLECTIONS',
    items: [
      { id: '6.1', text: 'Invoice table with search, status filter, vendor filter, and CSV export', status: 'done' },
      { id: '6.2', text: 'Click invoice row → full detail drawer with line-item breakdown (wages, SSS, PhilHealth, etc.)', status: 'done' },
      { id: '6.3', text: 'Collection summary KPI cards (Total Billed, Collected, Pending, Disputed)', status: 'done' },
      { id: '6.4', text: 'Reverse billing summary table — paid, pending, disputed, net exposure per vendor', status: 'done' },
      { id: '6.5', text: 'Manpower Output Validation — AI cross-checks deployed vs billed headcount', status: 'done' },
      { id: '6.6', text: 'Auto-reconciliation engine with matched/unmatched invoice tracking', status: 'done' },
      { id: '6.7', text: 'Flag invoice as disputed with reason submission', status: 'done' },
      { id: '6.8', text: 'Digital Wallet & Payout Ledger tab with wallet balance and BDO/BPI API indicator', status: 'done' },
      { id: '6.9', text: 'Release payout button with 1.8s banking API simulation and status update', status: 'done' },
      { id: '6.10', text: 'Real BDO / BPI banking API integration for actual fund disbursement', status: 'next', note: 'Requires bank API credentials and Supabase backend' },
      { id: '6.11', text: 'BIR e-Invoice compliance (EFPS integration)', status: 'planned' },
    ],
  },
  {
    id: 's7', number: 7, title: 'ANALYTICS & REPORTING',
    items: [
      { id: '7.1', text: 'Worker deployment by region bar chart (Recharts)', status: 'done' },
      { id: '7.2', text: 'Compliance trend radar chart', status: 'done' },
      { id: '7.3', text: 'Billing trend area chart (billed vs collected)', status: 'done' },
      { id: '7.4', text: 'Vendor performance and AI score distribution', status: 'done' },
      { id: '7.5', text: 'Audit log with action, actor, entity, and timestamp', status: 'done' },
      { id: '7.6', text: 'Export to CSV / PDF from all data tables', status: 'done', note: 'CSV implemented; PDF via browser print' },
      { id: '7.7', text: 'Live data from Supabase replacing mock data sets', status: 'next' },
      { id: '7.8', text: 'Scheduled report delivery via email (weekly/monthly)', status: 'planned' },
    ],
  },
  {
    id: 's8', number: 8, title: 'COMPLIANCE & AUDIT',
    items: [
      { id: '8.1', text: 'Compliance overview with active alerts, violations, and scheduled audits', status: 'done' },
      { id: '8.2', text: 'DOLE, SSS, PhilHealth, Pag-IBIG, BIR compliance tracking per vendor', status: 'done' },
      { id: '8.3', text: 'Audit log with full event history', status: 'done' },
      { id: '8.4', text: 'Violation severity classification (Critical, High, Medium)', status: 'done' },
      { id: '8.5', text: 'Upcoming audit schedule with countdown', status: 'done' },
      { id: '8.6', text: 'Automated compliance alerts triggered by document expiry', status: 'next' },
      { id: '8.7', text: 'DOLE online portal API integration for real-time status', status: 'planned' },
    ],
  },
  {
    id: 's9', number: 9, title: 'AI & INTELLIGENCE FEATURES',
    items: [
      { id: '9.1', text: 'Dynamic pricing engine — base rates, regional multipliers, volume discounts, employer contributions', status: 'done' },
      { id: '9.2', text: 'Auto-routing algorithm — scores vendors on AI score, compliance, region, capacity, specialization', status: 'done' },
      { id: '9.3', text: 'Contract template engine — generates full Manpower Services Agreement from vendor data', status: 'done' },
      { id: '9.4', text: 'Government verification suite — simulates sequential DTI/SEC, BIR, SSS, PhilHealth, DOLE checks', status: 'done' },
      { id: '9.5', text: 'Manpower output validator — flags invoices with >5% headcount variance', status: 'done' },
      { id: '9.6', text: 'AI accreditation score (0–100) per vendor with risk classification', status: 'done' },
      { id: '9.7', text: 'Real ML model for vendor scoring (trained on historical data)', status: 'planned' },
      { id: '9.8', text: 'Predictive demand forecasting for seasonal surge requirements', status: 'planned' },
    ],
  },
  {
    id: 's10', number: 10, title: 'MOBILE & ACCESSIBILITY',
    items: [
      { id: '10.1', text: 'Slide-in mobile sidebar with overlay backdrop', status: 'done' },
      { id: '10.2', text: 'Hamburger menu toggle in header (hidden on desktop)', status: 'done' },
      { id: '10.3', text: 'All modals and drawers scale to full-width on mobile', status: 'done' },
      { id: '10.4', text: '44px minimum touch targets on all interactive elements', status: 'done' },
      { id: '10.5', text: 'Table columns progressively hidden at sm/md/lg breakpoints', status: 'done' },
      { id: '10.6', text: 'Vendor list becomes cards on mobile (replaces table)', status: 'done' },
      { id: '10.7', text: 'WCAG 2.1 AA — aria-label, role, aria-live, focus management', status: 'done' },
      { id: '10.8', text: 'KPI text scales: text-xl → sm:text-2xl → lg:text-3xl', status: 'done' },
      { id: '10.9', text: 'Native mobile app (React Native or PWA)', status: 'planned' },
    ],
  },
  {
    id: 's11', number: 11, title: 'BACKEND INFRASTRUCTURE (SUPABASE)',
    items: [
      { id: '11.1', text: 'Supabase project setup and schema design', status: 'next' },
      { id: '11.2', text: 'Auth — email/password login with role-based access (Admin, Vendor, Viewer)', status: 'next' },
      { id: '11.3', text: 'Vendors table — replace mock data with live Supabase records', status: 'next' },
      { id: '11.4', text: 'Requirements / bids tables with real-time updates', status: 'next' },
      { id: '11.5', text: 'Invoices and payouts tables with row-level security', status: 'next' },
      { id: '11.6', text: 'Deployments table linked to vendors and requirements', status: 'next' },
      { id: '11.7', text: 'Supabase Storage for vendor document uploads', status: 'next' },
      { id: '11.8', text: 'Supabase Edge Functions for pricing and routing logic', status: 'next' },
      { id: '11.9', text: 'Row-level security policies per user role', status: 'next' },
      { id: '11.10', text: 'Supabase Realtime for live deployment and bid updates', status: 'planned' },
    ],
  },
  {
    id: 's12', number: 12, title: 'DEPLOYMENT & INTEGRATIONS',
    items: [
      { id: '12.1', text: 'GitHub repository — version controlled at github.com/julianspd/vendor-accred', status: 'done' },
      { id: '12.2', text: 'Vercel deployment — live at vendor-accred.vercel.app', status: 'done' },
      { id: '12.3', text: 'SPA routing fix (vercel.json rewrite rule)', status: 'done' },
      { id: '12.4', text: 'Custom domain setup on Vercel', status: 'next' },
      { id: '12.5', text: 'Environment variables for Supabase URL and anon key in Vercel', status: 'next' },
      { id: '12.6', text: 'CI/CD — auto-deploy on git push to main', status: 'done', note: 'Vercel handles this automatically' },
      { id: '12.7', text: 'Settings integrations panel with connection test simulation', status: 'done' },
      { id: '12.8', text: 'Real ERP / WMS / TMS integration via webhooks', status: 'planned' },
      { id: '12.9', text: 'SMS / push notification system for alerts', status: 'planned' },
    ],
  },
];

const statusConfig: Record<ItemStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'done':        { label: 'Done',        color: 'text-green-700',  bg: 'bg-green-100',  icon: <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" /> },
  'in-progress': { label: 'In Progress', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: <Clock size={15} className="text-blue-500 flex-shrink-0" /> },
  'next':        { label: 'Next',        color: 'text-amber-700',  bg: 'bg-amber-100',  icon: <ArrowRight size={15} className="text-amber-500 flex-shrink-0" /> },
  'planned':     { label: 'Planned',     color: 'text-gray-500',   bg: 'bg-gray-100',   icon: <Circle size={15} className="text-gray-300 flex-shrink-0" /> },
};

export const OwnerAlignment: React.FC = () => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const allItems = sections.flatMap(s => s.items);
  const total = allItems.length;
  const done = allItems.filter(i => i.status === 'done').length;
  const next = allItems.filter(i => i.status === 'next').length;
  const planned = allItems.filter(i => i.status === 'planned').length;
  const pct = Math.round((done / total) * 100);

  const toggleSection = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = () => {
    const rows = ['Section,Item,Status,Note'];
    sections.forEach(s => {
      s.items.forEach(item => {
        rows.push(`"${s.number}. ${s.title}","${item.text}","${item.status}","${item.note || ''}"`);
      });
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asianow-alignment.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" aria-label="Owner Alignment Checklist">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wide">Owner Mode</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Brief Alignment</h1>
          <p className="text-sm text-gray-500 mt-1">AsiaNow Vendor & Workforce Management — Build Status</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Score strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sections', value: sections.length.toString(), sub: 'feature groups', color: 'text-gray-900', bg: 'bg-white border-gray-100' },
          { label: 'Total Items', value: total.toString(), sub: 'tracked features', color: 'text-gray-900', bg: 'bg-white border-gray-100' },
          { label: 'Built & Done', value: done.toString(), sub: `${pct}% of scope`, color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
          { label: 'Completion', value: `${pct}%`, sub: `${next} next · ${planned} planned`, color: 'text-asianow-blue', bg: 'bg-blue-50 border-blue-100' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Overall Build Progress</p>
          <p className="text-sm font-bold text-gray-900">{done} / {total} items</p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-asianow-blue to-green-500 transition-all"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 flex-wrap">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = allItems.filter(i => i.status === key).length;
            return (
              <div key={key} className="flex items-center gap-1.5">
                {cfg.icon}
                <span className="text-xs font-medium text-gray-600">{cfg.label}: <strong>{count}</strong></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map(section => {
          const isCollapsed = collapsed[section.id];
          const sectionDone = section.items.filter(i => i.status === 'done').length;
          const sectionPct = Math.round((sectionDone / section.items.length) * 100);

          return (
            <div key={section.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.id)}
                aria-expanded={!isCollapsed}
              >
                <div className="w-7 h-7 rounded-lg bg-asianow-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{section.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 tracking-wide">{section.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${sectionPct === 100 ? 'bg-green-500' : sectionPct >= 60 ? 'bg-asianow-blue' : 'bg-amber-400'}`}
                        style={{ width: `${sectionPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{sectionDone}/{section.items.length} done</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {sectionPct === 100 && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Complete</span>
                  )}
                  {isCollapsed
                    ? <ChevronDown size={16} className="text-gray-400" />
                    : <ChevronUp size={16} className="text-gray-400" />
                  }
                </div>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {section.items.map((item, idx) => {
                    const cfg = statusConfig[item.status];
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${item.status === 'done' ? 'text-gray-700' : item.status === 'planned' ? 'text-gray-400' : 'text-gray-800'}`}>
                            {item.text}
                          </p>
                          {item.note && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">{item.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-400 hidden sm:block">{section.number}.{idx + 1}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">Next Phase: Supabase + Real Data</p>
        <p className="text-xs text-amber-600 leading-relaxed">
          {next} items are queued as "Next" — all require Supabase schema setup and environment variable configuration in Vercel.
          Once backend is wired, real-time data replaces all mock datasets automatically.
        </p>
      </div>
    </div>
  );
};
