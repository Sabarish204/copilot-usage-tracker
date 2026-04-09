import * as vscode from "vscode";
import { PromptRecord } from "../models";
import { ReportingService } from "../services/reporting";
import { StorageService } from "../services/storage";
import { toDayKey, toMonthKey } from "../util/date";

type SidebarNode =
  | { kind: "summary"; label: string; description: string }
  | { kind: "prompt"; prompt: PromptRecord };

export class SidebarProvider implements vscode.TreeDataProvider<SidebarNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<SidebarNode | undefined>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(
    private readonly storage: StorageService,
    private readonly reporting: ReportingService
  ) {}

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  getTreeItem(element: SidebarNode): vscode.TreeItem {
    if (element.kind === "summary") {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
      item.description = element.description;
      return item;
    }

    const item = new vscode.TreeItem(element.prompt.promptPreview, vscode.TreeItemCollapsibleState.None);
    item.description = `${element.prompt.dayKey} • ${element.prompt.source}`;
    item.tooltip = this.createPromptTooltip(element.prompt);
    return item;
  }

  async getChildren(): Promise<SidebarNode[]> {
    const prompts = await this.storage.getAllPrompts();
    const now = new Date();
    const summaryNodes: SidebarNode[] = [
      {
        kind: "summary",
        label: "Today",
        description: `${this.reporting.getTodayCount(prompts, toDayKey(now))} prompts`
      },
      {
        kind: "summary",
        label: "This Month",
        description: `${this.reporting.getMonthCount(prompts, toMonthKey(now))} prompts`
      }
    ];

    const promptNodes: SidebarNode[] = prompts.slice(0, 25).map((prompt) => ({
      kind: "prompt",
      prompt
    }));

    return [...summaryNodes, ...promptNodes];
  }

  private createPromptTooltip(prompt: PromptRecord): vscode.MarkdownString {
    const lines = [
      `**Source:** ${prompt.source}`,
      `**Created:** ${prompt.createdAt}`,
      `**Planned Hours:** ${this.formatHours(prompt.plannedEffortHours)}`,
      `**Actual Hours:** ${this.formatHours(prompt.actualEffortHours)}`,
      `**Efficiency:** ${prompt.efficiencyPct ?? 0}%`
    ];

    if (prompt.promptText) {
      lines.push("", "```text", prompt.promptText, "```");
    }

    return new vscode.MarkdownString(lines.join("\n"));
  }

  private formatHours(value?: number): string {
    return value === undefined ? "-" : value.toFixed(2);
  }
}
