import * as vscode from "vscode";
import { PromptRecord, PromptSource } from "../models";
import { computeEfficiencyPct, toDayKey, toMonthKey } from "../util/date";
import { StorageService } from "./storage";

export class PromptTrackerService {
  constructor(private readonly storage: StorageService) {}

  async createPrompt(params: {
    promptText: string;
    source: PromptSource;
    plannedEffortHours?: number;
    actualEffortHours?: number;
    notes?: string;
  }): Promise<PromptRecord> {
    const now = new Date();
    const config = vscode.workspace.getConfiguration("copilotUsageTracker");
    const storePromptText = config.get<boolean>("storePromptText", true);

    const record: PromptRecord = {
      id: this.createId(now),
      createdAt: now.toISOString(),
      dayKey: toDayKey(now),
      monthKey: toMonthKey(now),
      source: params.source,
      promptText: storePromptText ? params.promptText : undefined,
      promptPreview: this.toPreview(params.promptText),
      plannedEffortHours: params.plannedEffortHours,
      actualEffortHours: params.actualEffortHours,
      efficiencyPct: computeEfficiencyPct(params.plannedEffortHours, params.actualEffortHours),
      notes: params.notes
    };

    await this.storage.savePrompt(record);
    return record;
  }

  async updateEffort(promptId: string, plannedEffortHours?: number, actualEffortHours?: number): Promise<PromptRecord | undefined> {
    return this.storage.updatePrompt(promptId, {
      plannedEffortHours,
      actualEffortHours,
      efficiencyPct: computeEfficiencyPct(plannedEffortHours, actualEffortHours)
    });
  }

  private createId(date: Date): string {
    return `${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private toPreview(value: string): string {
    const trimmed = value.replace(/\s+/g, " ").trim();
    return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
  }
}
