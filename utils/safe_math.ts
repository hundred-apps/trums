export function safeDivide(a: any, b: any): number {
  const numA = Number(a);
  const numB = Number(b);
  if (!isFinite(numA) || !isFinite(numB) || numB === 0) return 0;
  return numA / numB;
}

export function safePercent(a: any, b: any): string {
  const result = safeDivide(a, b) * 100;
  return isFinite(result) ? result.toFixed(2) : "0.00";
}

export function displayAmount(ref: any, multiplier: number) {
  if (ref.type === "percent") {
    return (multiplier || 0) * (ref.amount / 100);
  } else {
    return ref.amount;
  }
}

export function percentToNominal(value: number, multiplier: number) {
  return multiplier * (value / 100);
}
export function nominalToPercent(value: number, multiplier: number) {
  return (value / multiplier) * 100;
}

export function displayPercentage(ref: any, multiplier: number): Number {
  console.log("ref", ref);
  if (ref.type === "amount") {
    return ref.amount / multiplier || 0 * 100;
  } else {
    return ref.amount;
  }
}

export function customMathCeil(num: number): number {
  return Math.ceil(num * 100) / 100;
}
