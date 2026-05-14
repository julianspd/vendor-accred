import React from 'react';
import { Badge } from './Badge';

type StatusType = string;

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple'; label: string }> = {
  // Vendor
  Accredited: { variant: 'success', label: 'Accredited' },
  Pending: { variant: 'warning', label: 'Pending' },
  Flagged: { variant: 'danger', label: 'Flagged' },
  Rejected: { variant: 'danger', label: 'Rejected' },
  // Deployment
  Active: { variant: 'success', label: 'Active' },
  Completed: { variant: 'info', label: 'Completed' },
  Suspended: { variant: 'danger', label: 'Suspended' },
  // Requirements
  Open: { variant: 'info', label: 'Open' },
  'In Progress': { variant: 'warning', label: 'In Progress' },
  Filled: { variant: 'success', label: 'Filled' },
  Closed: { variant: 'default', label: 'Closed' },
  // Billing
  Paid: { variant: 'success', label: 'Paid' },
  Disputed: { variant: 'danger', label: 'Disputed' },
  Overdue: { variant: 'danger', label: 'Overdue' },
  // Documents
  Verified: { variant: 'success', label: 'Verified' },
  Submitted: { variant: 'info', label: 'Submitted' },
  Missing: { variant: 'danger', label: 'Missing' },
  Expired: { variant: 'danger', label: 'Expired' },
  'Expiring Soon': { variant: 'warning', label: 'Expiring Soon' },
  Valid: { variant: 'success', label: 'Valid' },
  // Fraud
  High: { variant: 'danger', label: 'High' },
  Medium: { variant: 'warning', label: 'Medium' },
  Low: { variant: 'info', label: 'Low' },
  Investigating: { variant: 'warning', label: 'Investigating' },
  Resolved: { variant: 'success', label: 'Resolved' },
  // Bids
  Accepted: { variant: 'success', label: 'Accepted' },
};

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusMap[status] || { variant: 'default', label: status };
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};
