// Dynamic Pricing Engine — AI-computed manpower rates for Philippines market

const BASE_DAILY_RATES: Record<string, number> = {
  'Delivery Rider':    650,
  'Warehouse Staff':   600,
  'Dispatch Officer':  750,
  'Sorter':            575,
  'Customer Service':  700,
  'Driver':            800,
  'Security':          625,
  'Inventory Clerk':   625,
  'Hub Coordinator':   900,
  'Fleet Support':     850,
};

const REGIONAL_MULTIPLIERS: Record<string, number> = {
  NCR:      1.15,
  Cebu:     1.05,
  Davao:    1.00,
  Laguna:   1.08,
  Visayas:  0.95,
  Luzon:    0.98,
  Mindanao: 0.93,
};

function volumeDiscount(headcount: number): number {
  if (headcount >= 200) return 0.90;
  if (headcount >= 100) return 0.93;
  if (headcount >=  50) return 0.96;
  if (headcount >=  20) return 0.98;
  return 1.0;
}

export interface PricingBreakdown {
  baseRate: number;
  regionalRate: number;
  volumeDiscountPct: number;
  workerDailyRate: number;
  employerContributions: number;
  agencyFee: number;
  dailyBillableRate: number;
  monthlyRatePerHead: number;
  totalMonthlyBudget: number;
}

export function calculatePricing(role: string, region: string, headcount: number): PricingBreakdown {
  const base = BASE_DAILY_RATES[role] ?? 650;
  const multiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const discount = volumeDiscount(headcount);

  const regionalRate = Math.round(base * multiplier);
  const workerDailyRate = Math.round(regionalRate * discount);

  // SSS + PhilHealth + Pag-IBIG + 13th month prorated = ~17%
  const employerContributions = Math.round(workerDailyRate * 0.17);
  // Agency management fee = 8%
  const agencyFee = Math.round(workerDailyRate * 0.08);

  const dailyBillableRate = workerDailyRate + employerContributions + agencyFee;
  // 26 working days per month
  const monthlyRatePerHead = dailyBillableRate * 26;
  const totalMonthlyBudget = monthlyRatePerHead * headcount;

  return {
    baseRate: base,
    regionalRate,
    volumeDiscountPct: Math.round((1 - discount) * 100),
    workerDailyRate,
    employerContributions,
    agencyFee,
    dailyBillableRate,
    monthlyRatePerHead,
    totalMonthlyBudget,
  };
}

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}
