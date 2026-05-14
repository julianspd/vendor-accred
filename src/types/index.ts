// ─── Vendor Types ───────────────────────────────────────────────────────────

export type VendorStatus = 'Accredited' | 'Pending' | 'Flagged' | 'Rejected';

export interface VendorDocument {
  name: string;
  status: 'Submitted' | 'Missing' | 'Expired' | 'Verified' | 'Expiring Soon';
  expiryDate?: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  status: VendorStatus;
  aiScore: number;
  submittedDate: string;
  accreditedDate?: string;
  documents: VendorDocument[];
  workerCount: number;
  specialization: string[];
  complianceScore: number;
  lastAudit: string;
}

// ─── Requirement Types ───────────────────────────────────────────────────────

export type RequirementStatus = 'Open' | 'In Progress' | 'Filled' | 'Closed';
export type RequirementRole = 'Delivery Rider' | 'Warehouse Staff' | 'Dispatch Officer' | 'Sorter' | 'Customer Service' | 'Driver' | 'Security' | 'Inventory Clerk' | 'Hub Coordinator' | 'Fleet Support';

export interface VendorBid {
  vendorId: string;
  vendorName: string;
  proposedRate: number;
  headcount: number;
  submittedDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Requirement {
  id: string;
  title: string;
  role: RequirementRole;
  location: string;
  region: string;
  headcount: number;
  deadline: string;
  status: RequirementStatus;
  postedDate: string;
  budget: number;
  description: string;
  bids: VendorBid[];
  category: 'Regular' | 'Seasonal' | 'Surge';
}

// ─── Deployment Types ────────────────────────────────────────────────────────

export type DeploymentStatus = 'Active' | 'Completed' | 'Suspended' | 'Pending';

export interface Deployment {
  id: string;
  vendorId: string;
  vendorName: string;
  location: string;
  region: string;
  headcount: number;
  startDate: string;
  endDate?: string;
  status: DeploymentStatus;
  requirementId: string;
  role: string;
  supervisorName: string;
  monthlyRate: number;
}

// ─── Billing Types ───────────────────────────────────────────────────────────

export type InvoiceStatus = 'Paid' | 'Pending' | 'Disputed' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  period: string;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  description: string;
  headcount: number;
  rate: number;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface FraudAlert {
  id: string;
  type: 'Ghost Manpower' | 'Billing Anomaly' | 'Document Fraud' | 'Duplicate Worker' | 'Attendance Anomaly' | 'Overtime Anomaly' | 'Identity Fraud' | 'Geographic Inconsistency';
  vendorId: string;
  vendorName: string;
  description: string;
  detectedDate: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved';
}

export interface DeploymentDataPoint {
  month: string;
  ncr: number;
  cebu: number;
  davao: number;
  laguna: number;
  other: number;
}

export interface VendorPerformance {
  vendorName: string;
  score: number;
  onTimeRate: number;
  compliance: number;
  billing: number;
}

// ─── Compliance Types ────────────────────────────────────────────────────────

export interface ComplianceDoc {
  vendorId: string;
  vendorName: string;
  docType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  vendorName?: string;
  details: string;
}

// ─── User Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operations Manager' | 'Finance Officer' | 'Vendor';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}
