import { DailySummary, PromptRecord, RangeReport, SummaryMetrics } from "../models";
import { isWithinDateRange } from "../util/date";

export class ReportingService {
  getTodayCount(prompts: PromptRecord[], dayKey: string): number {
    return prompts.filter((prompt) => prompt.dayKey === dayKey).length;
  }

  getMonthCount(prompts: PromptRecord[], monthKey: string): number {
    return prompts.filter((prompt) => prompt.monthKey === monthKey).length;
  }

  buildRangeReport(prompts: PromptRecord[], from: string, to: string): RangeReport {
    const filtered = prompts.filter((prompt) => isWithinDateRange(prompt.createdAt, from, to));
    const grouped = new Map<string, PromptRecord[]>();

    for (const prompt of filtered) {
      const dayPrompts = grouped.get(prompt.dayKey) ?? [];
      dayPrompts.push(prompt);
      grouped.set(prompt.dayKey, dayPrompts);
    }

    const byDay: DailySummary[] = Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dayKey, dayPrompts]) => ({
        dayKey,
        ...this.calculateMetrics(dayPrompts)
      }));

    return {
      from,
      to,
      byDay,
      ...this.calculateMetrics(filtered)
    };
  }

  calculateMetrics(prompts: PromptRecord[]): SummaryMetrics {
    const totalPlannedHours = prompts.reduce((sum, prompt) => sum + (prompt.plannedEffortHours ?? 0), 0);
    const totalActualHours = prompts.reduce((sum, prompt) => sum + (prompt.actualEffortHours ?? 0), 0);
    const efficiencyPct = totalPlannedHours > 0
      ? Number(Math.max(0, Math.min(100, ((totalPlannedHours - totalActualHours) / totalPlannedHours) * 100)).toFixed(2))
      : 0;

    return {
      totalPrompts: prompts.length,
      totalPlannedHours: Number(totalPlannedHours.toFixed(2)),
      totalActualHours: Number(totalActualHours.toFixed(2)),
      efficiencyPct
    };
  }
}
