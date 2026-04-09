import * as vscode from "vscode";
import { ExcelExportService } from "./services/excelExport";
import { PromptTrackerService } from "./services/promptTracker";
import { ReportingService } from "./services/reporting";
import { StorageService } from "./services/storage";
import { ReportViewProvider } from "./views/reportViewProvider";
import { SidebarProvider } from "./views/sidebarProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const storage = new StorageService(context);
  await storage.ensureReady();

  const reporting = new ReportingService();
  const tracker = new PromptTrackerService(storage);
  const sidebar = new SidebarProvider(storage, reporting);
  const excelExport = new ExcelExportService();
  const reports = new ReportViewProvider(context, tracker, storage, reporting, excelExport, sidebar);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("copilotUsageTracker.sidebar", sidebar),
    vscode.window.registerTreeDataProvider("copilotUsageTracker.sidebar.explorer", sidebar),
    vscode.window.registerWebviewViewProvider(ReportViewProvider.viewType, reports),
    vscode.commands.registerCommand("copilotUsageTracker.refresh", () => {
      sidebar.refresh();
    }),
    vscode.commands.registerCommand("copilotUsageTracker.openWalkthrough", async () => {
      await vscode.commands.executeCommand(
        "workbench.action.openWalkthrough",
        "local-dev.copilot-usage-tracker#copilotUsageTracker.gettingStarted",
        false
      );
    }),
    vscode.commands.registerCommand("copilotUsageTracker.openReports", async () => {
      await vscode.commands.executeCommand("workbench.view.extension.copilotUsageTracker");
      await vscode.commands.executeCommand(`${ReportViewProvider.viewType}.focus`);
    }),
    vscode.commands.registerCommand("copilotUsageTracker.exportJson", async () => {
      const defaultUri = vscode.Uri.joinPath(context.globalStorageUri, "copilot-usage-export.json");
      const selected = await vscode.window.showSaveDialog({
        defaultUri,
        filters: { JSON: ["json"] }
      });

      if (!selected) {
        return;
      }

      await storage.exportToPath(selected.fsPath);
      void vscode.window.showInformationMessage(`Exported usage data to ${selected.fsPath}`);
    }),
    vscode.commands.registerCommand("copilotUsageTracker.askWithTracking", async () => {
      const promptText = await vscode.window.showInputBox({
        title: "Tracked Copilot Prompt",
        prompt: "Enter the prompt you want to track",
        ignoreFocusOut: true,
        validateInput: (value) => value.trim() ? undefined : "Prompt is required."
      });

      if (!promptText) {
        return;
      }

      const plannedText = await vscode.window.showInputBox({
        title: "Planned Effort",
        prompt: "Enter planned effort in hours",
        ignoreFocusOut: true,
        value: "1",
        validateInput: validateHours
      });

      if (plannedText === undefined) {
        return;
      }

      const actualText = await vscode.window.showInputBox({
        title: "Actual Effort",
        prompt: "Enter actual effort in hours",
        ignoreFocusOut: true,
        value: "1",
        validateInput: validateHours
      });

      if (actualText === undefined) {
        return;
      }

      const record = await tracker.createPrompt({
        promptText,
        source: "command",
        plannedEffortHours: Number(plannedText),
        actualEffortHours: Number(actualText)
      });

      sidebar.refresh();
      void vscode.window.showInformationMessage(
        `Tracked prompt for ${record.dayKey}. Efficiency: ${record.efficiencyPct ?? 0}%`
      );
    })
  );
}

export function deactivate(): void {}

function validateHours(value: string): string | undefined {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return "Enter hours using up to 2 decimal places, for example 0.35.";
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue) || numberValue < 0) {
    return "Enter a valid number of hours.";
  }

  return undefined;
}
