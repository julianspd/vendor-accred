import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, Building2, FileText, Send, ArrowLeft, ArrowRight, ScrollText, Scan, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useForm } from 'react-hook-form';
import { generateContract, ContractCompanyInfo } from '../utils/contractTemplate';
import { runGovernmentVerification, VerificationResult } from '../utils/govVerification';

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { num: 1, label: 'Company Info', icon: Building2 },
  { num: 2, label: 'Document Upload', icon: Upload },
  { num: 3, label: 'Contract Review', icon: ScrollText },
  { num: 4, label: 'Review & Submit', icon: FileText },
  { num: 5, label: 'Confirmation', icon: CheckCircle },
];

interface CompanyInfo {
  companyName: string;
  dtiSec: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  specialization: string;
  workerCount: string;
}

const documents = [
  { id: 'sec_dti', label: 'SEC/DTI Registration Certificate', required: true, hint: '', extractFields: ['Registration No.', 'Company Name', 'Date Issued', 'Validity'] },
  { id: 'mayors_permit', label: "Mayor's Business Permit (current year)", required: true, hint: '', extractFields: ['Permit No.', 'Business Name', 'LGU', 'Valid Until'] },
  { id: 'bir', label: 'BIR Certificate of Registration (Form 2303)', required: true, hint: '', extractFields: ['TIN', 'Registered Name', 'RDO Code', 'Registration Date'] },
  { id: 'ids', label: 'Valid IDs of Directors/Officers', required: true, hint: '', extractFields: ['ID Type', 'ID Number', 'Name', 'Expiry'] },
  { id: 'payroll', label: 'Latest 3 months Payroll Records', required: true, hint: '', extractFields: ['Period Covered', 'Total Employees', 'Total Payroll', 'Prepared By'] },
  { id: 'insurance', label: 'Certificate of Insurance (Employer Liability)', required: true, hint: '', extractFields: ['Policy No.', 'Insurer', 'Coverage Amount', 'Expiry Date'] },
  { id: 'bpo_boi_permit', label: 'Business Permit (BPO/BOI)', required: true, hint: 'Current year business permit from LGU', extractFields: ['Permit No.', 'Date Issued', 'LGU', 'Valid Until'] },
  { id: 'bank_details', label: 'Bank Account Details (Voided Check / CDO)', required: true, hint: 'Bank name, account number, account name for payroll', extractFields: ['Bank Name', 'Account No.', 'Account Name', 'Branch'] },
  { id: 'sss', label: 'SSS Certificate of Membership', required: false, hint: '', extractFields: ['SS Number', 'Member Name', 'Date Registered'] },
  { id: 'philhealth', label: 'PhilHealth Certificate', required: false, hint: '', extractFields: ['PhilHealth No.', 'Member Name', 'Membership Type'] },
  { id: 'pagibig', label: 'Pag-IBIG Fund Certificate', required: false, hint: '', extractFields: ['MID Number', 'Member Name', 'Status'] },
];

function simulateExtractedData(docId: string, fields: string[]): Record<string, string> {
  const fakeValues: Record<string, Record<string, string>> = {
    sec_dti: { 'Registration No.': 'CS-2019-00' + Math.floor(Math.random() * 9999), 'Company Name': '(from file)', 'Date Issued': '2019-03-15', 'Validity': 'Perpetual' },
    mayors_permit: { 'Permit No.': 'BP-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 99999), 'Business Name': '(from file)', 'LGU': 'City of Manila', 'Valid Until': `Dec 31, ${new Date().getFullYear()}` },
    bir: { 'TIN': '000-' + Math.floor(Math.random() * 999) + '-' + Math.floor(Math.random() * 999), 'Registered Name': '(from file)', 'RDO Code': 'RDO 39', 'Registration Date': '2019-04-01' },
    ids: { 'ID Type': 'Philippine Passport', 'ID Number': 'P' + Math.floor(Math.random() * 9999999), 'Name': '(from file)', 'Expiry': '2029-01-01' },
    payroll: { 'Period Covered': 'Feb–Apr 2026', 'Total Employees': String(Math.floor(Math.random() * 200 + 50)), 'Total Payroll': '₱' + (Math.floor(Math.random() * 2000000 + 500000)).toLocaleString(), 'Prepared By': 'HR Department' },
    insurance: { 'Policy No.': 'EL-' + Math.floor(Math.random() * 999999), 'Insurer': 'Pioneer Insurance Corp.', 'Coverage Amount': '₱5,000,000', 'Expiry Date': 'Dec 31, 2026' },
    bpo_boi_permit: { 'Permit No.': 'BPO-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9999), 'Date Issued': 'Jan 15, 2026', 'LGU': 'Taguig City', 'Valid Until': `Dec 31, ${new Date().getFullYear()}` },
    bank_details: { 'Bank Name': 'Bank of the Philippine Islands', 'Account No.': '****-****-' + Math.floor(Math.random() * 9999), 'Account Name': '(from file)', 'Branch': 'BGC Main' },
    sss: { 'SS Number': '34-' + Math.floor(Math.random() * 9999999) + '-' + Math.floor(Math.random() * 9), 'Member Name': '(from file)', 'Date Registered': '2019-01-10' },
    philhealth: { 'PhilHealth No.': '13-' + Math.floor(Math.random() * 999999999), 'Member Name': '(from file)', 'Membership Type': 'Employed' },
    pagibig: { 'MID Number': Math.floor(Math.random() * 9999999999).toString().padStart(12, '0'), 'Member Name': '(from file)', 'Status': 'Active' },
  };
  const src = fakeValues[docId] ?? {};
  return Object.fromEntries(fields.map(f => [f, src[f] ?? 'Extracted ✓']));
}

// ─── Step Indicator ─────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ currentStep: Step }> = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-8" role="navigation" aria-label="Onboarding steps">
    {steps.map((step, i) => (
      <React.Fragment key={step.num}>
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              currentStep > step.num
                ? 'bg-green-500 border-green-500 text-white'
                : currentStep === step.num
                ? 'bg-asianow-blue border-asianow-blue text-white'
                : 'bg-white border-gray-200 text-gray-400'
            }`}
            aria-current={currentStep === step.num ? 'step' : undefined}
          >
            {currentStep > step.num
              ? <CheckCircle size={18} aria-hidden="true" />
              : <step.icon size={18} aria-hidden="true" />
            }
          </div>
          <p className={`hidden sm:block text-xs mt-1.5 font-medium whitespace-nowrap ${
            currentStep >= step.num ? 'text-gray-700' : 'text-gray-400'
          }`}>
            {step.label}
          </p>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`h-0.5 w-6 sm:w-12 mx-1 mb-0 sm:mb-5 transition-colors ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'}`}
            aria-hidden="true"
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Step 1 ──────────────────────────────────────────────────────────────────

const Step1: React.FC<{ onNext: (data: CompanyInfo) => void }> = ({ onNext }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyInfo>();
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4" aria-label="Company information form">
      <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
      <p className="text-sm text-gray-500">Provide your company's basic information for accreditation.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <Input
            label="Registered Company Name"
            placeholder="e.g., ABC Logistics Inc."
            {...register('companyName', { required: 'Required' })}
            error={errors.companyName?.message}
          />
        </div>
        <Input
          label="DTI/SEC Registration No."
          placeholder="SEC No. / DTI No."
          {...register('dtiSec', { required: 'Required' })}
          error={errors.dtiSec?.message}
        />
        <Select
          label="Primary Specialization"
          options={[
            { value: 'Delivery Rider', label: 'Delivery Rider' },
            { value: 'Warehouse Staff', label: 'Warehouse Staff' },
            { value: 'Dispatch Officer', label: 'Dispatch Officer' },
            { value: 'Driver', label: 'Driver' },
            { value: 'Customer Service', label: 'Customer Service' },
            { value: 'Sorter', label: 'Sorter' },
            { value: 'Security', label: 'Security' },
            { value: 'Multiple', label: 'Multiple (indicate in notes)' },
          ]}
          {...register('specialization', { required: true })}
        />
        <Input
          label="Contact Person"
          placeholder="Full Name"
          {...register('contactPerson', { required: 'Required' })}
          error={errors.contactPerson?.message}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="contact@company.ph"
          {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
          error={errors.email?.message}
        />
        <Input
          label="Mobile Number"
          placeholder="+63 9XX XXX XXXX"
          {...register('phone', { required: 'Required' })}
          error={errors.phone?.message}
        />
        <Select
          label="Region of Operation"
          options={[
            { value: 'NCR', label: 'NCR' },
            { value: 'Cebu', label: 'Cebu' },
            { value: 'Davao', label: 'Davao' },
            { value: 'Laguna', label: 'Laguna' },
            { value: 'Visayas', label: 'Visayas' },
            { value: 'Luzon', label: 'Luzon' },
            { value: 'Mindanao', label: 'Mindanao' },
            { value: 'Nationwide', label: 'Nationwide' },
          ]}
          {...register('region', { required: true })}
        />
        <Input
          label="Estimated Worker Pool"
          type="number"
          min={1}
          placeholder="Number of workers"
          {...register('workerCount', { required: 'Required' })}
          error={errors.workerCount?.message}
        />
        <div className="col-span-1 sm:col-span-2">
          <Input
            label="Business Address"
            placeholder="Street, City, Province"
            {...register('address', { required: 'Required' })}
            error={errors.address?.message}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" size="lg">
        Next: Upload Documents <ArrowRight size={16} />
      </Button>
    </form>
  );
};

// ─── Step 2 — Document Upload with OCR ───────────────────────────────────────

interface DocState {
  file: File | null;
  scanning: boolean;
  scanProgress: number;
  scanLabel: string;
  extracted: Record<string, string> | null;
  verified: boolean;
}

const DocUploadRow: React.FC<{
  doc: typeof documents[0];
  state: DocState;
  onFile: (id: string, file: File) => void;
}> = ({ doc, state, onFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`rounded-xl border transition-all p-4 ${
        state.verified ? 'border-green-200 bg-green-50' :
        state.file ? 'border-asianow-blue/30 bg-blue-50/20' :
        'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {state.verified
            ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            : state.scanning
            ? <Scan size={18} className="text-asianow-blue animate-pulse flex-shrink-0 mt-0.5" aria-hidden="true" />
            : <FileText size={18} className="text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{doc.label}</p>
            <p className="text-xs text-gray-500">{doc.required ? 'Required' : 'Optional'}{doc.hint ? ` — ${doc.hint}` : ''}</p>

            {/* File info */}
            {state.file && !state.scanning && (
              <p className="text-xs text-asianow-blue mt-1 truncate">
                {state.file.name} ({(state.file.size / 1024).toFixed(0)} KB)
              </p>
            )}

            {/* OCR scan progress */}
            {state.scanning && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-asianow-blue font-medium">{state.scanLabel}</span>
                  <span className="text-xs text-gray-500">{state.scanProgress}%</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-asianow-blue rounded-full transition-all duration-300"
                    style={{ width: `${state.scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Extracted data */}
            {state.extracted && state.verified && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {Object.entries(state.extracted).map(([k, v]) => (
                  <div key={k} className="text-xs">
                    <span className="text-gray-500">{k}: </span>
                    <span className="text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            aria-label={`Upload ${doc.label}`}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onFile(doc.id, f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={state.scanning}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              state.verified
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : state.scanning
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-asianow-blue text-white hover:bg-asianow-dark'
            }`}
          >
            <Upload size={12} aria-hidden="true" />
            {state.verified ? 'Verified ✓' : state.scanning ? 'Scanning...' : state.file ? 'Re-upload' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Step2: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [docStates, setDocStates] = useState<Record<string, DocState>>(
    Object.fromEntries(documents.map(d => [d.id, { file: null, scanning: false, scanProgress: 0, scanLabel: '', extracted: null, verified: false }]))
  );

  const requiredDone = documents.filter(d => d.required).every(d => docStates[d.id]?.verified);

  const handleFile = async (docId: string, file: File) => {
    const doc = documents.find(d => d.id === docId)!;

    setDocStates(prev => ({ ...prev, [docId]: { ...prev[docId], file, scanning: true, scanProgress: 0, scanLabel: 'Initializing AI OCR engine...', extracted: null, verified: false } }));

    const steps_scan = [
      [15, 'Loading document...'],
      [35, 'Detecting document boundaries...'],
      [55, 'Running optical character recognition...'],
      [75, 'Extracting key fields...'],
      [90, 'Cross-checking AI database...'],
      [100, 'Verification complete'],
    ] as [number, string][];

    for (const [progress, label] of steps_scan) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 200));
      setDocStates(prev => ({ ...prev, [docId]: { ...prev[docId], scanProgress: progress, scanLabel: label } }));
    }

    const extracted = simulateExtractedData(docId, doc.extractFields);
    setDocStates(prev => ({ ...prev, [docId]: { ...prev[docId], scanning: false, extracted, verified: true } }));
  };

  return (
    <div className="space-y-4" aria-label="Document upload form">
      <h2 className="text-lg font-bold text-gray-900">Document Upload</h2>
      <p className="text-sm text-gray-500">Upload your compliance documents. Our AI OCR engine will scan and extract key fields automatically.</p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
        <Scan size={16} className="text-asianow-blue flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-blue-800 font-medium">
          Documents are scanned by our AI OCR engine in real time. Accepted formats: PDF, JPG, PNG. Max 10MB per file.
          Extracted data is cross-checked against government registries automatically.
        </p>
      </div>

      <div className="space-y-2">
        {documents.map(doc => (
          <DocUploadRow
            key={doc.id}
            doc={doc}
            state={docStates[doc.id]}
            onFile={handleFile}
          />
        ))}
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">
          <strong>{Object.values(docStates).filter(s => s.verified).length}</strong> of {documents.length} documents verified
        </span>
        {!requiredDone && (
          <span className="text-xs text-red-600 font-medium">
            {documents.filter(d => d.required && !docStates[d.id]?.verified).length} required documents remaining
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={16} /> Back</Button>
        <Button className="flex-1" onClick={onNext} disabled={!requiredDone} size="lg">
          Next: Contract Review <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

// ─── Step 3 — Dynamic Contract ────────────────────────────────────────────────

const Step3Contract: React.FC<{ companyInfo: ContractCompanyInfo | null; onNext: () => void; onBack: () => void }> = ({ companyInfo, onNext, onBack }) => {
  const [agreed, setAgreed] = useState(false);
  const contractText = companyInfo ? generateContract(companyInfo) : '';

  return (
    <div className="space-y-4" aria-label="Contract review form">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Service Agreement & Terms</h2>
          <p className="text-sm text-gray-500">Personalized contract generated for <strong>{companyInfo?.companyName}</strong>. Read carefully before agreeing.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-asianow-blue/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-asianow-blue flex-shrink-0">
          <ScrollText size={12} aria-hidden="true" /> AI Generated
        </div>
      </div>

      <div
        className="overflow-y-auto h-64 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 bg-gray-50 font-mono leading-relaxed whitespace-pre-wrap"
        tabIndex={0}
        aria-label="Service agreement text — scroll to read"
      >
        {contractText}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 rounded border-gray-300 text-asianow-blue focus:ring-asianow-blue"
          aria-required="true"
        />
        <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">
          I, <strong>{companyInfo?.contactPerson || 'Authorized Representative'}</strong>, have read and agree to the Manpower Services Agreement on behalf of <strong>{companyInfo?.companyName || 'the company'}</strong>.
        </span>
      </label>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={16} /> Back</Button>
        <Button className="flex-1" onClick={onNext} disabled={!agreed} size="lg">
          Next: Review & Submit <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

// ─── Step 4 — Review & Submit with Gov Verification ──────────────────────────

const Step4: React.FC<{ companyInfo: CompanyInfo | null; onSubmit: () => void; onBack: () => void }> = ({ companyInfo, onSubmit, onBack }) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyLabel, setVerifyLabel] = useState('');
  const [verifyResults, setVerifyResults] = useState<VerificationResult[] | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'passed' | 'failed' | 'partial' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    if (!companyInfo) return;
    setVerifying(true);
    setVerifyResults(null);
    const suite = await runGovernmentVerification(
      companyInfo.companyName,
      companyInfo.dtiSec,
      label => setVerifyLabel(label)
    );
    setVerifyResults(suite.results);
    setVerifyStatus(suite.overallStatus);
    setVerifying(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    onSubmit();
  };

  return (
    <div className="space-y-4" aria-label="Review and submit form">
      <h2 className="text-lg font-bold text-gray-900">Review & Submit</h2>
      <p className="text-sm text-gray-500">Run government API verification, then submit your application for AI review.</p>

      {companyInfo && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Company Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Company Name', value: companyInfo.companyName },
              { label: 'DTI/SEC No.', value: companyInfo.dtiSec },
              { label: 'Contact Person', value: companyInfo.contactPerson },
              { label: 'Email', value: companyInfo.email },
              { label: 'Phone', value: companyInfo.phone },
              { label: 'Region', value: companyInfo.region },
              { label: 'Specialization', value: companyInfo.specialization },
              { label: 'Worker Pool', value: companyInfo.workerCount },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-lg p-2.5">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Government API Verification */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-asianow-blue" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">Government Registry Verification</span>
          </div>
          {!verifyResults && (
            <Button variant="outline" size="sm" onClick={handleVerify} loading={verifying}>
              {verifying ? verifyLabel : 'Run Verification'}
            </Button>
          )}
          {verifyStatus && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              verifyStatus === 'passed' ? 'bg-green-100 text-green-700' :
              verifyStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {verifyStatus === 'passed' ? 'All Passed' : verifyStatus === 'partial' ? 'Partial' : 'Failed'}
            </span>
          )}
        </div>

        {verifying && (
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-asianow-blue">
              <span className="inline-block w-4 h-4 border-2 border-asianow-blue border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              {verifyLabel}
            </div>
          </div>
        )}

        {verifyResults && (
          <div className="divide-y divide-gray-100">
            {verifyResults.map((r, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <span className={`mt-0.5 flex-shrink-0 ${r.status === 'verified' ? 'text-green-500' : 'text-red-500'}`}>
                  {r.status === 'verified'
                    ? <CheckCircle size={15} aria-hidden="true" />
                    : <AlertCircle size={15} aria-hidden="true" />
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-800">{r.agency}</span>
                    <span className="text-xs text-gray-400">— {r.field}</span>
                  </div>
                  <p className="text-xs text-gray-600">{r.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ref: {r.refCode}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!verifyResults && !verifying && (
          <div className="px-4 py-4 text-xs text-gray-500 italic">
            Connects to DTI/SEC, BIR, SSS, PhilHealth, and DOLE registries to validate your company registration in real time.
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-yellow-300" defaultChecked />
          <span className="text-xs text-yellow-800 font-medium">
            I certify that all information and documents submitted are true and accurate. I understand that false declarations may result in disqualification and legal action.
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={submitting}><ArrowLeft size={16} /> Back</Button>
        <Button className="flex-1" onClick={handleSubmit} loading={submitting} size="lg">
          <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
};

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────

const Step5: React.FC<{ companyName: string }> = ({ companyName }) => {
  const navigate = useNavigate();
  const refNo = `AN-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return (
    <div className="text-center space-y-6 py-4" aria-label="Application submitted confirmation">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={40} className="text-green-500" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
        <p className="text-sm text-gray-500 mt-2">Thank you, <strong>{companyName}</strong>.</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Reference Number</span>
          <span className="font-mono text-sm font-bold text-asianow-blue">{refNo}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Documents Verified</span>
          <span className="text-sm font-semibold text-green-600">AI OCR + Gov Registry ✓</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className="text-sm font-semibold text-yellow-600">Under AI Review</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Expected Response</span>
          <span className="text-sm text-gray-800">5–10 business days</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          Our AI engine has cross-checked your documents against government registries. You will receive an email notification once the full review is complete.
        </p>
        <p className="text-xs text-gray-500">
          For queries, contact: <strong>accreditation@asianow.ph</strong>
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>Back to Login</Button>
        <Button className="flex-1" onClick={() => navigate('/dashboard')}>Go to Portal</Button>
      </div>
    </div>
  );
};

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export const VendorOnboarding: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  return (
    <div className="min-h-screen bg-asianow-light flex items-start justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 bg-asianow-red rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" width="22" height="22" aria-hidden="true">
              <circle cx="15" cy="3.5" r="1.5"/>
              <path d="M11.5 11l-1.5 7H8l1.5-5.5L8 11l-2-1 1-3.5C7.5 5.5 9 5 10.5 5.5l2 1c.8.4 1.5 1 1.5 2l.5 2.5 2.5.5-.5 2-3.5-.5z"/>
              <path d="M12 18l1 4H11l-.5-3L12 18z"/>
              <path d="M10.5 18l-.5 3H8l1-3H10.5z"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-extrabold text-asianow-red">Asia</span>
            <span className="text-xl font-extrabold text-asianow-dark">Now</span>
          </div>
          <span className="text-sm text-gray-500 border-l border-gray-300 pl-2 ml-1">Vendor Onboarding</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <StepIndicator currentStep={step} />

          {step === 1 && (
            <Step1 onNext={data => { setCompanyInfo(data); setStep(2); }} />
          )}
          {step === 2 && (
            <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <Step3Contract
              companyInfo={companyInfo}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4 companyInfo={companyInfo} onSubmit={() => setStep(5)} onBack={() => setStep(3)} />
          )}
          {step === 5 && (
            <Step5 companyName={companyInfo?.companyName || 'Vendor'} />
          )}
        </div>
      </div>
    </div>
  );
};
