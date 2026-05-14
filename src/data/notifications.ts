import { Notification } from '../types';

export const notifications: Notification[] = [
  { id: 'n001', title: 'Fraud Alert: Ghost Manpower', message: 'Northern Luzon Labor Co. — 12 workers with no check-in records detected.', timestamp: '2 hours ago', read: false, type: 'error' },
  { id: 'n002', title: 'Document Expiring Soon', message: 'Laguna Express Staffing — Insurance Certificate expires in 34 days.', timestamp: '5 hours ago', read: false, type: 'warning' },
  { id: 'n003', title: 'New Vendor Application', message: 'Negros Occidental Staffers submitted accreditation request.', timestamp: '8 hours ago', read: false, type: 'info' },
  { id: 'n004', title: 'Invoice Dispute Filed', message: 'Invoice AN-2026-0016 disputed by Finance team.', timestamp: '1 day ago', read: false, type: 'warning' },
  { id: 'n005', title: 'Deployment Activated', message: '35 Drivers deployed to Calamba, Laguna (D023).', timestamp: '1 day ago', read: true, type: 'success' },
  { id: 'n006', title: 'Duplicate Worker Alert', message: 'Pasig River Logistics — 3 worker IDs in multiple payrolls.', timestamp: '2 days ago', read: true, type: 'error' },
  { id: 'n007', title: 'Vendor Rejected', message: 'General Santos Port Crew application rejected. AI score: 22/100.', timestamp: '3 days ago', read: true, type: 'info' },
  { id: 'n008', title: 'Monthly Billing Cycle', message: 'April 2026 invoices generated. Total: ₱4.2M across 12 vendors.', timestamp: '5 days ago', read: true, type: 'info' },
];
