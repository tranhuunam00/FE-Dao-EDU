export interface SalaryBreakdown {
  gross: number;
  tax: number;
  net: number;
}

export function calculateSalaryBreakdown(grossAmount: number): SalaryBreakdown {
  const gross = grossAmount || 0;
  const tax = gross * 0.1;
  const net = gross * 0.9;
  return { gross, tax, net };
}
