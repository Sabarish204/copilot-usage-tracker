export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toMonthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function isWithinDateRange(isoDate: string, from: string, to: string): boolean {
  const value = isoDate.slice(0, 10);
  return value >= from && value <= to;
}

export function computeEfficiencyPct(planned?: number, actual?: number): number {
  if (!planned || planned <= 0 || actual === undefined || actual < 0) {
    return 0;
  }

  const savedPct = ((planned - actual) / planned) * 100;
  return Number(Math.max(0, Math.min(100, savedPct)).toFixed(2));
}
