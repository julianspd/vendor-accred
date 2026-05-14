// Auto-Routing Algorithm — scores accredited vendors for a given deployment requirement

import { vendors as allVendors } from '../data/vendors';

export interface VendorMatch {
  vendorId: string;
  vendorName: string;
  region: string;
  workerPool: number;
  totalScore: number;
  breakdown: {
    aiScore: number;      // 0–30
    compliance: number;   // 0–25
    regionMatch: number;  // 0–25
    capacity: number;     // 0–10
    specialization: number; // 0–10
  };
  reasons: string[];
  recommended: boolean;
  matchTier: 'Excellent' | 'Good' | 'Fair';
}

export function autoRoute(region: string, role: string, headcount: number): VendorMatch[] {
  const accredited = allVendors.filter(v => v.status === 'Accredited');

  const scored: VendorMatch[] = accredited.map(vendor => {
    // AI Score component (0–30)
    const aiScore = Math.round((vendor.aiScore / 100) * 30);

    // Compliance component (0–25)
    const compliance = Math.round((vendor.complianceScore / 100) * 25);

    // Region match (0–25)
    const exactRegion = vendor.region === region;
    const nearbyRegions: Record<string, string[]> = {
      NCR: ['Laguna', 'Bulacan'],
      Laguna: ['NCR'],
      Cebu: ['Visayas'],
      Visayas: ['Cebu'],
      Davao: ['Mindanao'],
      Mindanao: ['Davao'],
    };
    const nearby = nearbyRegions[vendor.region]?.includes(region) || nearbyRegions[region]?.includes(vendor.region);
    const regionMatch = exactRegion ? 25 : nearby ? 14 : 5;

    // Capacity (0–10) — vendor's worker pool vs headcount needed
    const ratio = vendor.workerCount / headcount;
    const capacity = ratio >= 3 ? 10 : ratio >= 2 ? 8 : ratio >= 1 ? 5 : 2;

    // Specialization match (0–10)
    const roleKeyword = role.toLowerCase().split(' ')[0];
    const match = vendor.specialization.some(s => {
      const sk = s.toLowerCase();
      return sk.includes(roleKeyword) || role.toLowerCase().includes(sk.split(' ')[0]);
    });
    const specialization = match ? 10 : 4;

    const totalScore = aiScore + compliance + regionMatch + capacity + specialization;

    const reasons: string[] = [];
    if (exactRegion) reasons.push(`Based in ${region} — exact region match`);
    if (nearby) reasons.push(`Adjacent region (${vendor.region}) — short deployment distance`);
    if (aiScore >= 26) reasons.push(`AI score ${vendor.aiScore}/100 — top-tier accreditation`);
    if (compliance >= 22) reasons.push(`Compliance score ${vendor.complianceScore}% — strong regulatory record`);
    if (match) reasons.push(`Primary specialization includes ${role}`);
    if (ratio >= 2) reasons.push(`Worker pool of ${vendor.workerCount} — can cover ${headcount} with buffer`);
    if (reasons.length === 0) reasons.push('General workforce capability');

    const matchTier: VendorMatch['matchTier'] =
      totalScore >= 75 ? 'Excellent' : totalScore >= 55 ? 'Good' : 'Fair';

    return {
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      region: vendor.region,
      workerPool: vendor.workerCount,
      totalScore,
      breakdown: { aiScore, compliance, regionMatch, capacity, specialization },
      reasons,
      recommended: false,
      matchTier,
    };
  });

  const sorted = scored.sort((a, b) => b.totalScore - a.totalScore);
  if (sorted.length > 0) sorted[0].recommended = true;
  return sorted;
}
