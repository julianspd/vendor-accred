import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Users, Bell, Link, CheckCircle,
  AlertCircle, Plus, Trash2, Edit3, Save, RefreshCw,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';

const initialUsers = [
  { id: 'u001', name: 'Julian D.', email: 'julian@asianow.ph', role: 'Admin', status: 'Active', lastLogin: '2026-05-12 09:45' },
  { id: 'u002', name: 'Maria Lim', email: 'maria.lim@asianow.ph', role: 'Finance Officer', status: 'Active', lastLogin: '2026-05-12 08:30' },
  { id: 'u003', name: 'Carlos Mendez', email: 'carlos@asianow.ph', role: 'Operations Manager', status: 'Active', lastLogin: '2026-05-11 17:20' },
  { id: 'u004', name: 'Ana Cruz', email: 'ana.cruz@asianow.ph', role: 'Operations Manager', status: 'Active', lastLogin: '2026-05-11 14:05' },
  { id: 'u005', name: 'Test Vendor', email: 'vendor@example.ph', role: 'Vendor', status: 'Inactive', lastLogin: '2026-04-30 10:00' },
];

type UserRow = typeof initialUsers[0];

const integrations = [
  { name: 'Finance ERP (SAP)', description: 'Automated invoice reconciliation and GL posting', status: 'Connected', lastSync: '2026-05-12 06:00', icon: '💼' },
  { name: 'Payroll System (Sprout HR)', description: 'Worker payroll data sync and SSS/PhilHealth validation', status: 'Connected', lastSync: '2026-05-12 06:00', icon: '💰' },
  { name: 'Banking API (BDO)', description: 'Automated payment disbursement to vendors', status: 'Connected', lastSync: '2026-05-11 18:00', icon: '🏦' },
  { name: 'Customer Billing (Salesforce)', description: 'Client-facing billing and service agreements', status: 'Disconnected', lastSync: 'Never', icon: '📊' },
  { name: 'SSS Online Portal', description: 'Worker SSS membership and contribution verification', status: 'Connected', lastSync: '2026-05-12 04:00', icon: '🛡️' },
  { name: 'DTI/SEC Business Registry', description: 'Automated vendor document verification', status: 'Connected', lastSync: '2026-05-12 02:00', icon: '🏢' },
];

const notificationPrefs = [
  { category: 'Fraud Alerts', email: true, inApp: true, sms: true },
  { category: 'Vendor Applications', email: true, inApp: true, sms: false },
  { category: 'Document Expiry Warnings', email: true, inApp: true, sms: false },
  { category: 'Invoice Disputes', email: true, inApp: true, sms: true },
  { category: 'Deployment Status Changes', email: false, inApp: true, sms: false },
  { category: 'New Bids Received', email: true, inApp: true, sms: false },
  { category: 'Compliance Violations', email: true, inApp: true, sms: true },
  { category: 'Weekly Reports', email: true, inApp: false, sms: false },
];

type Tab = 'platform' | 'users' | 'notifications' | 'integrations';

// ─── Integrations Panel ───────────────────────────────────────────────────────

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface IntegrationState {
  name: string;
  description: string;
  status: 'Connected' | 'Disconnected';
  lastSync: string;
  icon: string;
  latency?: number;
  testStatus: TestStatus;
  testMessage: string;
}

const IntegrationsPanel: React.FC = () => {
  const [items, setItems] = useState<IntegrationState[]>(
    integrations.map(i => ({
      ...i,
      status: i.status as 'Connected' | 'Disconnected',
      testStatus: 'idle' as TestStatus,
      testMessage: '',
    }))
  );

  const testConnection = async (name: string) => {
    setItems(prev => prev.map(i => i.name === name
      ? { ...i, testStatus: 'testing', testMessage: 'Sending handshake request...' }
      : i
    ));

    const stages = [
      [400, 'Establishing secure TLS connection...'],
      [600, 'Authenticating API credentials...'],
      [500, 'Verifying endpoint response...'],
    ] as [number, string][];

    for (const [ms, msg] of stages) {
      await new Promise(r => setTimeout(r, ms));
      setItems(prev => prev.map(i => i.name === name ? { ...i, testMessage: msg } : i));
    }

    await new Promise(r => setTimeout(r, 300));
    const integ = integrations.find(i => i.name === name)!;
    const success = integ.status === 'Connected';
    const latency = Math.floor(Math.random() * 80 + 40);

    setItems(prev => prev.map(i => i.name === name ? {
      ...i,
      testStatus: success ? 'success' : 'error',
      testMessage: success
        ? `Connection healthy — ${latency}ms response time. API version verified.`
        : 'Connection failed — credentials not configured. Click "Connect" to set up.',
      latency: success ? latency : undefined,
      lastSync: success ? new Date().toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : i.lastSync,
    } : i));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((int) => (
          <Card key={int.name}>
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0" aria-hidden="true">{int.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{int.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{int.description}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {int.status === 'Connected'
                      ? <CheckCircle size={14} className="text-green-500" aria-hidden="true" />
                      : <AlertCircle size={14} className="text-red-500" aria-hidden="true" />
                    }
                    <span className={`text-xs font-medium ${int.status === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {int.status}
                    </span>
                  </div>
                </div>

                {/* Test connection result */}
                {int.testStatus !== 'idle' && (
                  <div className={`mt-2 rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${
                    int.testStatus === 'testing' ? 'bg-blue-50 text-blue-700' :
                    int.testStatus === 'success' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {int.testStatus === 'testing' && (
                      <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    {int.testStatus === 'success' && <CheckCircle size={12} className="flex-shrink-0 mt-0.5" aria-hidden="true" />}
                    {int.testStatus === 'error' && <AlertCircle size={12} className="flex-shrink-0 mt-0.5" aria-hidden="true" />}
                    <span>{int.testMessage}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400 truncate">Last sync: {int.lastSync}</p>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testConnection(int.name)}
                      loading={int.testStatus === 'testing'}
                      aria-label={`Test connection for ${int.name}`}
                    >
                      <RefreshCw size={11} /> Test
                    </Button>
                    <Button
                      variant={int.status === 'Connected' ? 'outline' : 'primary'}
                      size="sm"
                      aria-label={int.status === 'Connected' ? `Configure ${int.name}` : `Connect ${int.name}`}
                    >
                      {int.status === 'Connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('platform');
  const [notifPrefs, setNotifPrefs] = useState(notificationPrefs);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userList, setUserList] = useState<UserRow[]>(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserRow>>({});

  const startEdit = (u: UserRow) => { setEditingId(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const saveEdit = (id: string) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, ...editForm } : u));
    setEditingId(null);
    setEditForm({});
  };
  const deleteUser = (id: string) => {
    if (window.confirm('Remove this user?')) setUserList(prev => prev.filter(u => u.id !== id));
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'platform', label: 'Platform', icon: <SettingsIcon size={15} /> },
    { id: 'users', label: 'Users', icon: <Users size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'integrations', label: 'Integrations', icon: <Link size={15} /> },
  ];

  const toggleNotif = (i: number, field: 'email' | 'inApp' | 'sms') => {
    setNotifPrefs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: !p[field] } : p));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6" aria-label="Settings">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Platform configuration, users, and integrations</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit" role="tablist" aria-label="Settings sections">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="General Settings" />
            <div className="space-y-4">
              <Input label="Platform Name" defaultValue="AsiaNow Vendor & Workforce Portal" />
              <Input label="Company Name" defaultValue="AsiaNow Logistics Inc." />
              <Input label="Admin Email" defaultValue="admin@asianow.ph" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Default Currency" defaultValue="PHP (₱)" />
                <Input label="Timezone" defaultValue="Asia/Manila (UTC+8)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Billing Cycle (Day of Month)" type="number" defaultValue="15" />
                <Input label="Accreditation Review SLA (days)" type="number" defaultValue="10" />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="AI Engine Configuration" />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Fraud Detection</p>
                  <p className="text-xs text-gray-500">AI monitors billing, manpower, and document anomalies</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-xs font-medium text-green-600">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Document OCR Verification</p>
                  <p className="text-xs text-gray-500">Auto-extract and validate document data on upload</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-xs font-medium text-green-600">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Demand Forecasting</p>
                  <p className="text-xs text-gray-500">Predictive manpower demand using historical trends</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-xs font-medium text-green-600">Enabled</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">AI Accreditation Score Threshold (Auto-Flag)</label>
                <div className="flex items-center gap-3 mt-2">
                  <input type="range" min={20} max={80} defaultValue={50} className="flex-1" aria-label="AI score threshold for auto-flagging" />
                  <span className="text-sm font-bold text-gray-700">50</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Vendors scoring below this threshold are automatically flagged for review.</p>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>
              <Save size={16} /> Save Changes
            </Button>
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium" role="status">
                <CheckCircle size={15} /> Settings saved!
              </span>
            )}
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600"><strong>{userList.length}</strong> users</p>
            <Button size="sm">
              <Plus size={14} /> Invite User
            </Button>
          </div>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="User management">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Email</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Role</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Last Login</th>
                    <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      {editingId === u.id ? (
                        <>
                          <td className="py-2 px-4">
                            <input
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                              value={editForm.name ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              aria-label="Edit name"
                            />
                          </td>
                          <td className="py-2 px-4 hidden md:table-cell">
                            <input
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                              value={editForm.email ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                              aria-label="Edit email"
                            />
                          </td>
                          <td className="py-2 px-4 hidden sm:table-cell">
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-asianow-blue"
                              value={editForm.role ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                              aria-label="Edit role"
                            >
                              {['Admin', 'Finance Officer', 'Operations Manager', 'Vendor'].map(r => (
                                <option key={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-4"><StatusBadge status={u.status} /></td>
                          <td className="py-2 px-4 text-gray-400 text-xs hidden lg:table-cell">{u.lastLogin}</td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(u.id)}>Save</Button>
                              <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-asianow-dark flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                                {u.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{u.email}</td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <Badge variant={u.role === 'Admin' ? 'danger' : u.role === 'Finance Officer' ? 'warning' : u.role === 'Vendor' ? 'default' : 'info'}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                          <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">{u.lastLogin}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => startEdit(u)} aria-label={`Edit user ${u.name}`}><Edit3 size={13} /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)} aria-label={`Remove user ${u.name}`} className="text-red-500 hover:text-red-700"><Trash2 size={13} /></Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Notification Preferences */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader title="Notification Preferences" subtitle="Configure alerts and notification channels" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Notification preferences">
              <thead>
                <tr className="border-b border-gray-100">
                  <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th scope="col" className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th scope="col" className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">In-App</th>
                  <th scope="col" className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">SMS</th>
                </tr>
              </thead>
              <tbody>
                {notifPrefs.map((pref, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{pref.category}</td>
                    {(['email', 'inApp', 'sms'] as const).map(field => (
                      <td key={field} className="py-3 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer" aria-label={`${field} notification for ${pref.category}`}>
                          <input
                            type="checkbox"
                            checked={pref[field]}
                            onChange={() => toggleNotif(i, field)}
                            className="sr-only"
                          />
                          <div className={`relative w-10 h-5 rounded-full transition-colors ${pref[field] ? 'bg-asianow-blue' : 'bg-gray-200'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${pref[field] ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>
              <Save size={16} /> Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <IntegrationsPanel />
      )}
    </div>
  );
};
