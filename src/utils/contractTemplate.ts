// Dynamic contract template generator — produces a personalized MSA from onboarding data

export interface ContractCompanyInfo {
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

export function generateContract(company: ContractCompanyInfo): string {
  const today = new Date();
  const effectiveDate = today.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const expiryDate = new Date(today.setFullYear(today.getFullYear() + 1))
    .toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const refNo = `MSA-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return `MANPOWER SERVICES AGREEMENT
Contract Reference: ${refNo}
Effective Date: ${effectiveDate}
Expiry Date: ${expiryDate}

PARTIES

This Manpower Services Agreement ("Agreement") is entered into by and between:

PRINCIPAL:
AsiaNow Logistics Inc.
Unit 12F, BGC Corporate Center, 30th Street, Bonifacio Global City, Taguig City, Metro Manila
DTI Registration No.: DTI-NCR-2022-0001
Represented by: Operations Administration Department
("AsiaNow" or "Principal")

VENDOR:
${company.companyName}
Business Address: ${company.address}
Registration No.: ${company.dtiSec}
Contact Person: ${company.contactPerson}
Email: ${company.email}
Telephone: ${company.phone}
Primary Region of Operations: ${company.region}
Primary Service Specialization: ${company.specialization}
Estimated Worker Pool: ${company.workerCount} workers
("Vendor")

WHEREAS, AsiaNow is engaged in logistics, e-commerce fulfillment, and last-mile delivery operations across the Philippines; and

WHEREAS, the Vendor is a licensed manpower service provider specializing in ${company.specialization} services with a workforce pool of ${company.workerCount} registered workers; and

WHEREAS, AsiaNow wishes to engage the Vendor to provide manpower deployment services subject to the terms and conditions herein;

NOW, THEREFORE, in consideration of the mutual covenants herein, the parties agree as follows:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SCOPE OF SERVICES

1.1 The Vendor, ${company.companyName}, shall provide AsiaNow with qualified and trained ${company.specialization} personnel ("Deployed Workers") as requested by AsiaNow through the AsiaNow Vendor Portal from time to time.

1.2 The Vendor shall ensure all Deployed Workers are duly registered with SSS, PhilHealth, and Pag-IBIG Fund prior to deployment.

1.3 Services shall be rendered primarily in the ${company.region} region, and may be extended to other regions upon mutual written agreement through the Portal.

1.4 The Vendor shall maintain a minimum workforce pool of ${company.workerCount} workers to fulfill deployment requests without material delay.

2. COMPLIANCE WITH PHILIPPINE LABOR LAWS

2.1 The Vendor shall comply in full with all applicable provisions of Presidential Decree No. 442 (Labor Code of the Philippines), as amended, including all DOLE Department Orders, special laws, and issuances concerning labor contracting and subcontracting arrangements.

2.2 The Vendor shall ensure all Deployed Workers receive at minimum the applicable regional minimum wage for ${company.region}, exclusive of AsiaNow's service management fee.

2.3 The Vendor shall be solely responsible for the payment of all mandatory government contributions including SSS, PhilHealth, and Pag-IBIG Fund for all Deployed Workers. Proof of remittance shall be submitted to AsiaNow on a monthly basis via the Compliance module of the AsiaNow Vendor Portal.

2.4 The Vendor shall maintain DOLE registration as a legitimate job contractor and shall not engage in labor-only contracting as defined under DOLE Department Order No. 174, Series of 2017.

3. PAYMENT TERMS

3.1 AsiaNow shall remit payment to ${company.companyName} on a Net Fifteen (15) calendar day basis from the date of invoice approval in the AsiaNow Billing & Collections module.

3.2 Invoices must be submitted through the AsiaNow Vendor Portal on or before the 5th day of each calendar month covering the immediately preceding month's deployment.

3.3 All payments shall be made via bank transfer to the Vendor's accredited bank account on file in the AsiaNow system. Any changes to banking details require 5 business days' written notice and re-verification.

3.4 AsiaNow's AI-powered reconciliation engine shall cross-check billed headcount against GPS deployment records prior to invoice approval. Invoices with discrepancies exceeding 5% shall be held for manual review.

4. SERVICE LEVEL AGREEMENT (SLA)

4.1 The Vendor shall maintain a minimum attendance and deployment rate of ninety-five percent (95%) of committed headcount at all times.

4.2 The Vendor shall respond to all AsiaNow deployment requests submitted through the Requirement Marketplace within twenty-four (24) hours.

4.3 Failure to meet SLA requirements in two (2) consecutive monthly periods shall constitute a material breach and may result in suspension of vendor accreditation.

4.4 The Vendor must notify AsiaNow through the Portal at least forty-eight (48) hours in advance of any anticipated deployment shortfall.

5. AI-ENABLED MONITORING AND AUDIT RIGHTS

5.1 The Vendor acknowledges and consents to the use of AsiaNow's AI-powered fraud detection and compliance monitoring engine, which performs automated cross-checks on attendance records, payroll data, deployment logs, and billing statements on a continuous basis.

5.2 AsiaNow reserves the right to conduct compliance audits, including document verification and payroll audits, at any time with or without prior notice. The Vendor shall provide full cooperation within twenty-four (24) hours of an audit request.

5.3 Worker GPS check-in records generated through the AsiaNow platform shall be the authoritative record for attendance and deployment verification, superseding manual timekeeping records in the event of a dispute.

6. CONFIDENTIALITY AND DATA PRIVACY

6.1 Both parties agree to maintain the confidentiality of all proprietary information shared under this Agreement, including but not limited to pricing structures, client operational data, and worker personal information.

6.2 The Vendor shall comply with Republic Act No. 10173 (Data Privacy Act of 2012) in the handling of all personal data of Deployed Workers. The Vendor shall designate a Data Protection Officer and submit proof of registration with the National Privacy Commission prior to first deployment.

7. INTELLECTUAL PROPERTY

7.1 All data, records, reports, and analytics generated through the AsiaNow Vendor Portal in connection with this Agreement shall remain the exclusive property of AsiaNow Logistics Inc.

8. TERMINATION

8.1 Either party may terminate this Agreement without cause upon thirty (30) days written notice delivered through the AsiaNow Vendor Portal.

8.2 AsiaNow may terminate this Agreement immediately and without prior notice for cause, including but not limited to: fraud, document falsification, ghost manpower billing, repeated SLA breaches, DOLE violations, or any act that brings AsiaNow into disrepute.

8.3 Upon termination, the Vendor shall ensure the smooth handover of all ongoing deployments and shall not cause any disruption to AsiaNow's operations.

9. GOVERNING LAW AND DISPUTE RESOLUTION

9.1 This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines.

9.2 Any dispute arising from this Agreement shall first be subject to good faith negotiation between the parties for a period of fifteen (15) days. Failing settlement, the dispute shall be referred to binding arbitration in Metro Manila under the rules of the Philippine Dispute Resolution Center, Inc. (PDRCI).

10. ENTIRE AGREEMENT

10.1 This Agreement constitutes the entire understanding between ${company.companyName} and AsiaNow Logistics Inc. with respect to the subject matter herein and supersedes all prior negotiations, representations, or agreements.

10.2 Any amendment to this Agreement must be made in writing and approved through the AsiaNow Vendor Portal by authorized representatives of both parties.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IN WITNESS WHEREOF, the parties have executed this Agreement as of ${effectiveDate}.

ASIANOW LOGISTICS INC.                    ${company.companyName.toUpperCase()}

_______________________________           _______________________________
Authorized Signatory                       ${company.contactPerson}
Operations Administration                  Authorized Representative
AsiaNow Vendor Portal                      ${company.email}

Contract Reference: ${refNo}
Generated by AsiaNow AI Contract Engine — ${effectiveDate}`;
}
