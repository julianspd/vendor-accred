import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Download, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Wallet, ArrowUpRight, ArrowDownLeft, X, FileText, Calendar, Users,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { invoices as allInvoices } from '../data/billing';
import { Invoice } from '../types';

const manpowerValidationRows = [
  { vendor: 'Makati Premium Logistics', deployed: 200, billed: 200, variance: '0%', status: 'Validated', statusType: 'ok' as const },
  { vendor: 'RapidDeliver Solutions Inc.', deployed: 210, billed: 215, variance: '+2.4%', status: 'Within Threshold', statusType: 'ok' as const },
  { vendor: 'Northern Luzon Labor Co.', deployed: 130, billed: 145, variance: '+11.5%', status: 'Flagged', statusType: 'flagged' as const },
  { vendor: 'Pasig River Logistics', deployed: 85, billed: 85, variance: '0%', status: 'Validated', statusType: 'ok' as const },
];

// ─── Invoice Detail Drawer ───────────────────────────────────────────────────

const InvoiceDetail: React.FC<{
  invoice: Invoice;
  onClose: () => void;
  onFlag: (inv: Invoice) => void;
}> = ({ invoice, onClose, onFlag }) => {
  const dailyRate = Math.round(invoice.amount / (invoice.headcount * 26));
  const lineItems = [
    { desc: `Basic wage (${invoice.headcount} workers × ₱${dailyRate.toLocaleString()}/day × 26 days)`, amount: Math.round(invoice.amount * 0.72) },
    { desc: 'SSS Employer Contribution (3.5%)', amount: Math.round(invoice.amount * 0.035) },
    { desc: 'PhilHealth Employer Share (2%)', amount: Math.round(invoice.amount * 0.02) },
    { desc: 'Pag-IBIG Employer Contribution (1%)', amount: Math.round(invoice.amount * 0.01) },
    { desc: '13th Month Provision (accrued)', amount: Math.round(invoice.amount * 0.077) },
    { desc: 'Agency Service Fee (8%)', amount: Math.round(invoice.amount * 0.08) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="invoice-detail-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="ml-auto relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-semibold text-asianow-blue mb-1">{invoice.invoiceNumber}</p>
              <h2 id="invoice-detail-title" className="text-base md:text-lg font-bold text-gray-900 leading-tight">{invoice.vendorName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={invoice.status} />
                <span className="text-xs text-gray-500">{invoice.period}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-gray-100 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close invoice detail"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText size={11} className="text-gray-400" aria-hidden="true" />
                <p className="text-xs text-gray-500">Invoice Total</p>
              </div>
              <p className="text-lg font-bold text-gray-900">₱{invoice.amount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={11} className="text-gray-400" aria-hidden="true" />
                <p className="text-xs text-gray-500">Headcount</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{invoice.headcount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={11} className="text-gray-400" aria-hidden="true" />
                <p className="text-xs text-gray-500">Due Date</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{invoice.dueDate}</p>
            </div>
          </div>

          {/* Invoice info */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Description', value: invoice.description },
              { label: 'Service Period', value: invoice.period },
              { label: 'Due Date', value: invoice.dueDate },
              ...(invoice.paidDate ? [{ label: 'Paid Date', value: invoice.paidDate }] : []),
            ].map(item => (
              <div key={item.label} className={`bg-gray-50 rounded-lg p-3 ${item.label === 'Description' ? 'col-span-2' : ''}`}>
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Line items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Billing Breakdown</p>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-50">
                {lineItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-gray-700 flex-1 pr-4">{item.desc}</p>
                    <p className="text-xs font-semibold text-gray-900 flex-shrink-0">₱{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-900">Total Invoice</p>
                <p className="text-sm font-bold text-gray-900">₱{invoice.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className={`rounded-xl p-4 border ${
            invoice.status === 'Paid' ? 'bg-green-50 border-green-100' :
            invoice.status === 'Overdue' ? 'bg-red-50 border-red-100' :
            invoice.status === 'Disputed' ? 'bg-yellow-50 border-yellow-100' :
            'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {invoice.status === 'Paid' && <CheckCircle size={15} className="text-green-600" aria-hidden="true" />}
              {invoice.status === 'Overdue' && <AlertTriangle size={15} className="text-red-600" aria-hidden="true" />}
              {invoice.status === 'Pending' && <Clock size={15} className="text-yellow-600" aria-hidden="true" />}
              <p className="text-sm font-semibold text-gray-900">Payment Status: {invoice.status}</p>
            </div>
            {invoice.status === 'Paid' && invoice.paidDate && (
              <p className="text-xs text-green-700">Cleared on {invoice.paidDate} via BDO Online Transfer</p>
            )}
            {invoice.status === 'Overdue' && (
              <p className="text-xs text-red-700">Payment overdue — escalation notice sent to vendor on {invoice.dueDate}</p>
            )}
            {invoice.status === 'Pending' && (
              <p className="text-xs text-gray-600">Awaiting payment by {invoice.dueDate}</p>
            )}
            {invoice.status === 'Disputed' && (
              <p className="text-xs text-yellow-700">Under review by billing team — estimated resolution in 3–5 business days</p>
            )}
          </div>

          {/* Compliance note */}
          <div className="bg-asianow-blue/5 rounded-lg p-3 border border-asianow-blue/10">
            <p className="text-xs text-gray-600">
              This invoice was validated by the AI Manpower Output Validator. Headcount deployment vs billed
              headcount variance is within acceptable threshold (&lt;5%).
            </p>
          </div>
        </div>

        {/* Actions */}
        {(invoice.status === 'Pending' || invoice.status === 'Overdue') && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
            <Button
              variant="danger"
              className="flex-1 min-h-[44px]"
              onClick={() => { onFlag(invoice); onClose(); }}
            >
              <AlertTriangle size={14} /> Flag as Disputed
            </Button>
            <Button variant="outline" onClick={onClose} className="min-h-[44px]">Close</Button>
          </div>
        )}
        {invoice.status !== 'Pending' && invoice.status !== 'Overdue' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
            <Button variant="outline" onClick={onClose} className="w-full min-h-[44px]">Close</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Collection Summary ───────────────────────────────────────────────────────

const CollectionSummary: React.FC = () => {
  const total = allInvoices.reduce((s, i) => s + i.amount, 0);
  const paid = allInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = allInvoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const disputed = allInvoices.filter(i => i.status === 'Disputed').reduce((s, i) => s + i.amount, 0);
  const overdue = allInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  const [reconciling, setReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);

  const handleReconcile = () => {
    setReconciling(true);
    setReconcileMessage(null);
    setTimeout(() => {
      setReconciling(false);
      setReconcileMessage('Reconciliation complete — 4 new matches found');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed (All Time)', value: `₱${(total / 1000000).toFixed(2)}M`, icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Collected (Paid)', value: `₱${(paid / 1000000).toFixed(2)}M`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Collection', value: `₱${(pending / 1000000).toFixed(2)}M`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Disputed / Overdue', value: `₱${((disputed + overdue) / 1000).toFixed(0)}K`, icon: AlertTriangle, color: 'text-asianow-red', bg: 'bg-red-50' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`} aria-hidden="true">
                <s.icon size={18} className={s.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-asianow-blue" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">Reconciliation Status</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>Last auto-reconciled: <strong className="text-gray-900">2026-05-12 06:00</strong></span>
            <span>Matched invoices: <strong className="text-green-700">21/25</strong></span>
            <span>Unmatched (pending): <strong className="text-yellow-700">4</strong></span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {reconcileMessage && (
              <span className="text-xs text-green-700 font-medium">{reconcileMessage}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconcile}
              loading={reconciling}
              aria-label="Run auto-reconciliation"
            >
              <RefreshCw size={12} /> {reconciling ? 'Reconciling...' : 'Run Reconciliation'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ManpowerValidation: React.FC = () => (
  <Card>
    <CardHeader
      title="Manpower Output Validation"
      subtitle="AI cross-checks deployed headcount vs billed headcount before invoice approval"
    />
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table" aria-label="Manpower output validation">
        <thead>
          <tr className="border-b border-gray-100">
            {['Vendor', 'Deployed', 'Billed', 'Variance', 'Status'].map(h => (
              <th key={h} scope="col" className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {manpowerValidationRows.map(row => (
            <tr key={row.vendor} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-900">{row.vendor}</td>
              <td className="py-3 px-4 text-gray-700">{row.deployed}</td>
              <td className="py-3 px-4 text-gray-700">{row.billed}</td>
              <td className={`py-3 px-4 font-semibold ${row.statusType === 'flagged' ? 'text-red-600' : 'text-gray-700'}`}>{row.variance}</td>
              <td className="py-3 px-4">
                {row.statusType === 'flagged' ? (
                  <span className="text-red-600 font-semibold text-xs">⚠ Flagged</span>
                ) : row.status === 'Within Threshold' ? (
                  <span className="text-blue-700 font-semibold text-xs">Within Threshold ✓</span>
                ) : (
                  <span className="text-green-700 font-semibold text-xs">Validated ✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-500 mt-3 px-4 pb-1">
      Invoices exceeding 5% variance are held for manual review before payment release.
    </p>
  </Card>
);

// ─── Digital Wallet / Payout Ledger ──────────────────────────────────────────

interface PayoutRecord {
  id: string;
  vendor: string;
  amount: number;
  method: string;
  reference: string;
  date: string;
  status: 'Released' | 'Pending' | 'Processing';
}

const initialPayouts: PayoutRecord[] = [
  { id: 'pay001', vendor: 'Makati Premium Logistics', amount: 1_248_000, method: 'BDO Online Transfer', reference: 'TXN-20260512-001', date: '2026-05-12', status: 'Released' },
  { id: 'pay002', vendor: 'RapidDeliver Solutions Inc.', amount: 987_000, method: 'BDO Online Transfer', reference: 'TXN-20260512-002', date: '2026-05-12', status: 'Released' },
  { id: 'pay003', vendor: 'Taguig City Riders Co.', amount: 756_000, method: 'BPI Fund Transfer', reference: 'TXN-20260511-001', date: '2026-05-11', status: 'Released' },
  { id: 'pay004', vendor: 'Cebu Logistics Corp.', amount: 445_000, method: 'BDO Online Transfer', reference: 'TXN-20260514-001', date: '2026-05-14', status: 'Pending' },
  { id: 'pay005', vendor: 'Bulacan Premier Workforce', amount: 523_000, method: 'BPI Fund Transfer', reference: 'TXN-20260514-002', date: '2026-05-14', status: 'Pending' },
  { id: 'pay006', vendor: 'Laguna Express Staffing', amount: 312_000, method: 'BDO Online Transfer', reference: 'TXN-20260514-003', date: '2026-05-14', status: 'Processing' },
];

const PayoutLedger: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>(initialPayouts);
  const [releasing, setReleasing] = useState<string | null>(null);

  const walletBalance = 8_420_000;
  const totalReleased = payouts.filter(p => p.status === 'Released').reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts.filter(p => p.status !== 'Released').reduce((s, p) => s + p.amount, 0);

  const handleRelease = async (id: string) => {
    setReleasing(id);
    await new Promise(r => setTimeout(r, 1800));
    setPayouts(prev => prev.map(p => p.id === id
      ? { ...p, status: 'Released', reference: `TXN-${Date.now()}`.slice(0, 18) }
      : p
    ));
    setReleasing(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Wallet Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">₱{walletBalance.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-asianow-blue/10 flex items-center justify-center" aria-hidden="true">
              <Wallet size={18} className="text-asianow-blue" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Released (This Month)</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700">₱{totalReleased.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center" aria-hidden="true">
              <ArrowUpRight size={18} className="text-green-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pending Disbursement</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-700">₱{totalPending.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center" aria-hidden="true">
              <ArrowDownLeft size={18} className="text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Payout Ledger</p>
            <p className="text-xs text-gray-500">Direct vendor disbursements via banking API</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-green-600">BDO / BPI API Connected</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Payout ledger">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Method</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Reference</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${p.status === 'Pending' ? 'bg-yellow-50/30' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.vendor}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">₱{p.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs hidden sm:table-cell">{p.method}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 hidden md:table-cell">{p.reference}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs hidden sm:table-cell">{p.date}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      p.status === 'Released' ? 'bg-green-100 text-green-700' :
                      p.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.status !== 'Released' && (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={releasing === p.id}
                        onClick={() => handleRelease(p.id)}
                        aria-label={`Release payment to ${p.vendor}`}
                      >
                        {releasing === p.id ? 'Sending...' : 'Release'}
                      </Button>
                    )}
                    {p.status === 'Released' && (
                      <CheckCircle size={16} className="text-green-500" aria-label="Released" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── Main Billing Page ────────────────────────────────────────────────────────

export const Billing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'invoices' | 'payouts'>('invoices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [invoices, setInvoices] = useState(allInvoices);
  const [flagModal, setFlagModal] = useState<Invoice | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // On mount — restore tab and open invoice drawer from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'payouts' || tab === 'invoices') setActiveTab(tab);

    const invoiceId = searchParams.get('invoice');
    if (invoiceId) {
      const match = allInvoices.find(i => i.id === invoiceId);
      if (match) setDetailInvoice(match);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (tab: 'invoices' | 'payouts') => {
    setActiveTab(tab);
    setSearchParams(prev => { prev.set('tab', tab); return prev; });
  };

  const openInvoice = (inv: Invoice) => {
    setDetailInvoice(inv);
    setSearchParams(prev => { prev.set('invoice', inv.id); return prev; });
  };

  const closeInvoice = () => {
    setDetailInvoice(null);
    setSearchParams(prev => { prev.delete('invoice'); return prev; });
  };

  const vendorNames = [...new Set(allInvoices.map(i => i.vendorName))].sort();

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      inv.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchVendor = vendorFilter === 'All' || inv.vendorName === vendorFilter;
    return matchSearch && matchStatus && matchVendor;
  });

  const handleFlagDispute = (inv: Invoice) => {
    setFlagModal(inv);
    setDisputeReason('');
  };

  const handleSubmitDispute = () => {
    if (!flagModal) return;
    setInvoices(prev => prev.map(i => i.id === flagModal.id ? { ...i, status: 'Disputed' as Invoice['status'] } : i));
    setFlagModal(null);
  };

  const handleExport = () => {
    const csv = [
      ['Invoice No.', 'Vendor', 'Amount', 'Period', 'Due Date', 'Status'],
      ...filtered.map(i => [i.invoiceNumber, i.vendorName, i.amount, i.period, i.dueDate, i.status]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asianow_invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" aria-label="Billing and Collections">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Reverse billing statements, payouts, and collection tracking</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { id: 'invoices', label: 'Invoices & Billing' },
          { id: 'payouts', label: 'Digital Wallet & Payouts' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'payouts' && <PayoutLedger />}

      {activeTab === 'invoices' && (
        <>
          <CollectionSummary />
          <ManpowerValidation />

          {/* Reverse Billing Statements */}
          <Card>
            <CardHeader title="Reverse Billing Summary" subtitle="Payments owed from AsiaNow to vendors" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Reverse billing statements by vendor">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Vendor', 'Paid (All Time)', 'Pending', 'Disputed', 'Net Exposure'].map(h => (
                      <th key={h} scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...new Set(allInvoices.map(i => i.vendorName))].slice(0, 8).map(vendorName => {
                    const vInvs = allInvoices.filter(i => i.vendorName === vendorName);
                    const paid = vInvs.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
                    const pending = vInvs.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
                    const disputed = vInvs.filter(i => i.status === 'Disputed').reduce((s, i) => s + i.amount, 0);
                    return (
                      <tr key={vendorName} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{vendorName}</td>
                        <td className="py-3 px-4 text-green-700 font-medium">₱{paid.toLocaleString()}</td>
                        <td className="py-3 px-4 text-yellow-700 font-medium">₱{pending.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-600 font-medium">₱{disputed.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">₱{(paid + pending + disputed).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Filters */}
          <Card>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-48">
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  icon={<Search size={14} />}
                  aria-label="Search invoices"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Disputed', label: 'Disputed' },
                  { value: 'Overdue', label: 'Overdue' },
                ]}
                aria-label="Filter by status"
              />
              <Select
                value={vendorFilter}
                onChange={e => setVendorFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Vendors' },
                  ...vendorNames.map(v => ({ value: v, label: v })),
                ]}
                aria-label="Filter by vendor"
              />
            </div>
          </Card>

          {/* Invoice Table */}
          <Card padding={false}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> invoices · Total: <strong>₱{filtered.reduce((s, i) => s + i.amount, 0).toLocaleString()}</strong>
              </p>
              <p className="text-xs text-gray-400 hidden sm:block">Click any row to view full invoice</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Invoice list">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Invoice #</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Description</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Headcount</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Period</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Due Date</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr
                      key={inv.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${inv.status === 'Overdue' ? 'bg-red-50/40' : inv.status === 'Disputed' ? 'bg-yellow-50/40' : ''}`}
                      onClick={() => openInvoice(inv)}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && openInvoice(inv)}
                      role="button"
                      aria-label={`View invoice ${inv.invoiceNumber}`}
                    >
                      <td className="py-3 px-4">
                        <p className="font-mono text-xs font-semibold text-asianow-blue">{inv.invoiceNumber}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{inv.vendorName}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs hidden lg:table-cell">
                        <p className="truncate">{inv.description}</p>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700 hidden md:table-cell">{inv.headcount}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap hidden md:table-cell">{inv.period}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">₱{inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap hidden sm:table-cell">{inv.dueDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={inv.status} />
                          {inv.paidDate && (
                            <p className="text-xs text-gray-400">Paid {inv.paidDate}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {inv.status === 'Pending' || inv.status === 'Overdue' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={e => { e.stopPropagation(); handleFlagDispute(inv); }}
                            aria-label={`Flag invoice ${inv.invoiceNumber} as disputed`}
                          >
                            Flag
                          </Button>
                        ) : inv.status === 'Disputed' ? (
                          <Badge variant="danger">Under Review</Badge>
                        ) : (
                          <CheckCircle size={16} className="text-green-500" aria-label="Paid" />
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400">No invoices match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Dispute modal */}
          <Modal isOpen={!!flagModal} onClose={() => setFlagModal(null)} title="Flag Invoice as Disputed" size="sm">
            {flagModal && (
              <>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500">Invoice</p>
                  <p className="font-semibold text-gray-900">{flagModal.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">{flagModal.vendorName} · ₱{flagModal.amount.toLocaleString()}</p>
                </div>
                <div className="mb-4">
                  <label htmlFor="dispute-reason" className="text-sm font-medium text-gray-700 mb-1 block">Dispute Reason</label>
                  <textarea
                    id="dispute-reason"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                    rows={3}
                    placeholder="Describe the issue..."
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="danger" className="flex-1" onClick={handleSubmitDispute}>
                    Confirm Dispute
                  </Button>
                  <Button variant="outline" onClick={() => setFlagModal(null)}>Cancel</Button>
                </div>
              </>
            )}
          </Modal>
        </>
      )}

      {/* Invoice Detail Drawer */}
      {detailInvoice && (
        <InvoiceDetail
          invoice={detailInvoice}
          onClose={closeInvoice}
          onFlag={inv => { closeInvoice(); handleFlagDispute(inv); }}
        />
      )}
    </div>
  );
};
