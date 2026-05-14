// Government API verification simulation
// Simulates calls to SSS, PhilHealth, DTI/SEC, BIR, DOLE registry systems

export type VerificationStatus = 'verified' | 'not_found' | 'expired' | 'mismatch';

export interface VerificationResult {
  agency: string;
  field: string;
  value: string;
  status: VerificationStatus;
  message: string;
  refCode: string;
}

function randomRef(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Simulate a delayed API call
async function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// Deterministically succeed/fail based on registration number patterns
function assessReg(regNo: string): VerificationStatus {
  if (!regNo || regNo.trim().length < 4) return 'not_found';
  if (regNo.toLowerCase().startsWith('test') || regNo === '000000') return 'not_found';
  return 'verified';
}

export interface VerificationSuite {
  results: VerificationResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  passedCount: number;
  failedCount: number;
}

export async function runGovernmentVerification(
  companyName: string,
  dtiSec: string,
  onProgress: (label: string) => void
): Promise<VerificationSuite> {
  const results: VerificationResult[] = [];

  // DTI/SEC check
  onProgress('Querying DTI/SEC Business Registry...');
  await delay(900);
  const dtiStatus = assessReg(dtiSec);
  results.push({
    agency: 'DTI/SEC',
    field: 'Registration Number',
    value: dtiSec,
    status: dtiStatus,
    message: dtiStatus === 'verified'
      ? `${companyName} found in DTI/SEC registry. Active registration confirmed.`
      : 'Registration number not found in DTI/SEC database.',
    refCode: randomRef(),
  });

  // BIR check
  onProgress('Checking BIR Tax Registration...');
  await delay(800);
  const birStatus: VerificationStatus = dtiStatus === 'verified' ? 'verified' : 'not_found';
  results.push({
    agency: 'BIR',
    field: 'TIN / COR Status',
    value: dtiSec.replace(/\D/g, '').padStart(9, '0').slice(0, 9),
    status: birStatus,
    message: birStatus === 'verified'
      ? 'BIR Certificate of Registration (Form 2303) on file. Tax compliance status: Active.'
      : 'No BIR registration found matching this entity.',
    refCode: randomRef(),
  });

  // SSS check
  onProgress('Verifying SSS Employer Registration...');
  await delay(700);
  results.push({
    agency: 'SSS',
    field: 'Employer Account',
    value: companyName,
    status: 'verified',
    message: `SSS employer account active. Contribution remittance status: Up to date as of ${
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    }.`,
    refCode: randomRef(),
  });

  // PhilHealth check
  onProgress('Checking PhilHealth Employer Accreditation...');
  await delay(600);
  results.push({
    agency: 'PhilHealth',
    field: 'Employer Number',
    value: companyName,
    status: 'verified',
    message: 'PhilHealth employer number active. Premium contributions: Current.',
    refCode: randomRef(),
  });

  // DOLE check
  onProgress('Verifying DOLE Contractor Registration...');
  await delay(850);
  const doleStatus: VerificationStatus = dtiStatus === 'verified' ? 'verified' : 'not_found';
  results.push({
    agency: 'DOLE',
    field: 'DOLE Certificate of Registration',
    value: companyName,
    status: doleStatus,
    message: doleStatus === 'verified'
      ? 'DOLE Certificate of Registration as legitimate job contractor confirmed. Status: Active.'
      : 'DOLE contractor registration not found. Vendor must register under DO 174-17.',
    refCode: randomRef(),
  });

  const passedCount = results.filter(r => r.status === 'verified').length;
  const failedCount = results.length - passedCount;
  const overallStatus =
    failedCount === 0 ? 'passed' :
    passedCount === 0 ? 'failed' : 'partial';

  return { results, overallStatus, passedCount, failedCount };
}
