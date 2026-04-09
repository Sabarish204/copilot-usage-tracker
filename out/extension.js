"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const excelExport_1 = require("./services/excelExport");
const promptTracker_1 = require("./services/promptTracker");
const reporting_1 = require("./services/reporting");
const storage_1 = require("./services/storage");
const reportViewProvider_1 = require("./views/reportViewProvider");
const sidebarProvider_1 = require("./views/sidebarProvider");
async function activate(context) {
    const storage = new storage_1.StorageService(context);
    await storage.ensureReady();
    const reporting = new reporting_1.ReportingService();
    const tracker = new promptTracker_1.PromptTrackerService(storage);
    const sidebar = new sidebarProvider_1.SidebarProvider(storage, reporting);
    const excelExport = new excelExport_1.ExcelExportService();
    const reports = new reportViewProvider_1.ReportViewProvider(context, tracker, storage, reporting, excelExport, sidebar);
    context.subscriptions.push(vscode.window.registerTreeDataProvider("copilotUsageTracker.sidebar", sidebar), vscode.window.registerTreeDataProvider("copilotUsageTracker.sidebar.explorer", sidebar), vscode.window.registerWebviewViewProvider(reportViewProvider_1.ReportViewProvider.viewType, reports), vscode.commands.registerCommand("copilotUsageTracker.refresh", () => {
        sidebar.refresh();
    }), vscode.commands.registerCommand("copilotUsageTracker.openWalkthrough", async () => {
        await vscode.commands.executeCommand("workbench.action.openWalkthrough", "local-dev.copilot-usage-tracker#copilotUsageTracker.gettingStarted", false);
    }), vscode.commands.registerCommand("copilotUsageTracker.openReports", async () => {
        await vscode.commands.executeCommand("workbench.view.extension.copilotUsageTracker");
        await vscode.commands.executeCommand(`${reportViewProvider_1.ReportViewProvider.viewType}.focus`);
    }), vscode.commands.registerCommand("copilotUsageTracker.exportJson", async () => {
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
    }), vscode.commands.registerCommand("copilotUsageTracker.askWithTracking", async () => {
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
        void vscode.window.showInformationMessage(`Tracked prompt for ${record.dayKey}. Efficiency: ${record.efficiencyPct ?? 0}%`);
    }));
}
function deactivate() { }
function validateHours(value) {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        return "Enter hours using up to 2 decimal places, for example 0.35.";
    }
    const numberValue = Number(value);
    if (Number.isNaN(numberValue) || numberValue < 0) {
        return "Enter a valid number of hours.";
    }
    return undefined;
}
//# sourceMappingURL=extension.js.map