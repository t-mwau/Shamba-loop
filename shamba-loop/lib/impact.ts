export function estimateAvoidedCo2eKg(
  divertedWasteKg: number,
  factorKgCo2ePerKg: number,
): number {
  if (!Number.isFinite(divertedWasteKg) || divertedWasteKg < 0) {
    throw new RangeError("divertedWasteKg must be a non-negative finite number");
  }
  if (!Number.isFinite(factorKgCo2ePerKg) || factorKgCo2ePerKg < 0) {
    throw new RangeError("factorKgCo2ePerKg must be a non-negative finite number");
  }

  return divertedWasteKg * factorKgCo2ePerKg;
}
