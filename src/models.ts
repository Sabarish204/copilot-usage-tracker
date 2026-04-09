export type PromptSource = "chatParticipant" | "command" | "webview";

export interface PromptRecord {
  id: string;
  createdAt: string;
  dayKey: string;
  monthKey: string;
  source: PromptSource;
  promptText?: string;
  promptPreview: string;
  plannedEffortHours?: number;
  actualEffortHours?: number;
  efficiencyPct?: number;
  notes?: string;
}

export interface ReportRange {
  from: string;
  to: string;
}

export interface SummaryMetrics {
  totalPrompts: number;
  totalPlannedHours: number;
  totalActualHours: number;
  efficiencyPct: number;
}

export interface DailySummary extends SummaryMetrics {
  dayKey: string;
}

export interface RangeReport extends SummaryMetrics {
  from: string;
  to: string;
  byDay: DailySummary[];
}
