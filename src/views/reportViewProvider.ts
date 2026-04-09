import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { ExcelExportService } from "../services/excelExport";
import { PromptTrackerService } from "../services/promptTracker";
import { ReportingService } from "../services/reporting";
import { StorageService } from "../services/storage";
import { toDayKey, toMonthKey } from "../util/date";
import { SidebarProvider } from "./sidebarProvider";

export class ReportViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "copilotUsageTracker.reports";
  private webviewView?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly tracker: PromptTrackerService,
    private readonly storage: StorageService,
    private readonly reporting: ReportingService,
    private readonly excelExport: ExcelExportService,
    private readonly sidebar: SidebarProvider
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.type === "savePrompt") {
        await this.handleSavePrompt(message);
        return;
      }

      if (message.type === "generateReport") {
        await this.handleGenerateReport(message.from, message.to);
        return;
      }

      if (message.type === "exportReport") {
        await this.handleExportReport(message.from, message.to);
        return;
      }

      if (message.type === "fillFromSelection") {
        await this.handleFillFromSelection();
        return;
      }

      if (message.type === "fillFromClipboard") {
        await this.handleFillFromClipboard();
      }
    });

    void this.pushBootstrapState();
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "reportView.js"));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      font-family: var(--vscode-font-family);
      padding: 0;
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(255, 209, 102, 0.16), transparent 28%),
        linear-gradient(180deg, rgba(31, 75, 153, 0.08), transparent 32%),
        var(--vscode-editor-background);
    }
    .layout {
      display: grid;
      grid-template-columns: 190px 1fr;
      min-height: 100vh;
    }
    .tabs {
      display: grid;
      gap: 8px;
      padding: 18px 14px;
      border-right: 1px solid var(--vscode-panel-border);
      background:
        linear-gradient(180deg, rgba(31, 75, 153, 0.16), rgba(31, 75, 153, 0.03)),
        color-mix(in srgb, var(--vscode-sideBar-background) 94%, transparent);
    }
    .brand {
      display: grid;
      gap: 6px;
      padding: 8px 6px 16px;
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1f4b99, #3b74d1);
      color: #fffaf2;
      font-size: 20px;
      font-weight: 700;
    }
    .brand-title {
      font-size: 17px;
      font-weight: 700;
    }
    .brand-copy {
      color: var(--vscode-descriptionForeground);
      line-height: 1.4;
      font-size: 12px;
    }
    .tab-button {
      border: 1px solid rgba(127, 127, 127, 0.2);
      border-radius: 14px;
      padding: 14px 12px;
      text-align: left;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
    }
    .tab-button:hover {
      transform: translateY(-1px);
      border-color: rgba(255, 209, 102, 0.6);
    }
    .tab-button.active {
      background: linear-gradient(135deg, rgba(255, 209, 102, 0.25), rgba(31, 75, 153, 0.2));
      border-color: rgba(255, 209, 102, 0.7);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    .content {
      display: grid;
      gap: 18px;
      padding: 22px;
    }
    .panel {
      display: none;
      gap: 12px;
    }
    .panel.active {
      display: grid;
    }
    form, .card, .summary-card {
      display: grid;
      gap: 12px;
    }
    .hero {
      display: grid;
      gap: 10px;
      padding: 18px;
      border: 1px solid rgba(127, 127, 127, 0.18);
      border-radius: 20px;
      background:
        linear-gradient(135deg, rgba(31, 75, 153, 0.18), rgba(255, 209, 102, 0.12)),
        color-mix(in srgb, var(--vscode-editorWidget-background) 90%, transparent);
    }
    .hero h2, .card h3, .summary-card h2 {
      margin: 0;
    }
    .hero-copy {
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
      max-width: 780px;
    }
    .content-grid {
      display: grid;
      grid-template-columns: minmax(320px, 1.15fr) minmax(280px, 0.85fr);
      gap: 18px;
      align-items: start;
    }
    .row {
      display: grid;
      gap: 8px;
    }
    input, textarea, button {
      padding: 10px 12px;
      font: inherit;
    }
    textarea {
      min-height: 170px;
      resize: vertical;
      line-height: 1.45;
    }
    input, textarea {
      border-radius: 12px;
      border: 1px solid rgba(127, 127, 127, 0.25);
      background: color-mix(in srgb, var(--vscode-input-background) 88%, transparent);
      color: inherit;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    button {
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
    }
    .primary-button {
      background: linear-gradient(135deg, #1f4b99, #3b74d1);
      color: #fffaf2;
    }
    .secondary-button {
      background: transparent;
      border-color: rgba(127, 127, 127, 0.28);
      color: inherit;
    }
    .metrics {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
    .metric {
      border: 1px solid rgba(127, 127, 127, 0.18);
      border-radius: 16px;
      padding: 14px;
      background: color-mix(in srgb, var(--vscode-editorWidget-background) 92%, transparent);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      text-align: left;
      border-bottom: 1px solid var(--vscode-panel-border);
      padding: 8px 4px;
      vertical-align: top;
    }
    .table-wrap {
      overflow-x: auto;
    }
    .muted {
      color: var(--vscode-descriptionForeground);
    }
    .status {
      min-height: 18px;
    }
    .helper-card {
      display: grid;
      gap: 14px;
      padding: 18px;
      border: 1px solid rgba(127, 127, 127, 0.18);
      border-radius: 18px;
      background: color-mix(in srgb, var(--vscode-editorWidget-background) 94%, transparent);
    }
    .helper-list {
      display: grid;
      gap: 10px;
    }
    .helper-item {
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(127, 127, 127, 0.14);
    }
    .prompt-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }
    @media (max-width: 980px) {
      .layout {
        grid-template-columns: 1fr;
      }
      .tabs {
        border-right: 0;
        border-bottom: 1px solid var(--vscode-panel-border);
      }
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="tabs">
      <div class="brand">
        <div class="brand-badge">CT</div>
        <div class="brand-title">Copilot Tracker</div>
        <div class="brand-copy">Track prompt effort, review savings, and export reports without leaving VS Code.</div>
      </div>
      <button class="tab-button active" data-tab-target="save-prompt-panel" type="button">Save Prompt</button>
      <button class="tab-button" data-tab-target="report-panel" type="button">Report</button>
    </div>
    <div class="content">
      <section id="save-prompt-panel" class="panel active">
        <div class="hero">
          <h2>Save Prompt</h2>
          <div class="hero-copy">Capture the prompt you used with Copilot, then add planned and actual effort manually. Prompts typed directly into native Copilot Chat cannot be auto-read by a third-party extension, so this dashboard focuses on a fast manual save flow.</div>
          <div class="metrics">
            <div class="metric"><strong>Today</strong><br><span id="today-count">0</span></div>
            <div class="metric"><strong>This Month</strong><br><span id="month-count">0</span></div>
          </div>
        </div>
        <div class="content-grid">
          <form id="save-prompt-form" class="helper-card">
            <div class="row">
              <label for="prompt-text">Prompt</label>
              <textarea id="prompt-text" name="prompt" placeholder="Describe what you asked Copilot..." required></textarea>
            </div>
            <div class="prompt-meta">
              <span>Tip: paste the exact Copilot prompt here.</span>
              <span id="prompt-length">0 characters</span>
            </div>
            <div class="actions">
              <button id="fill-selection" class="secondary-button" type="button">Use Editor Selection</button>
              <button id="fill-clipboard" class="secondary-button" type="button">Use Clipboard</button>
            </div>
            <div class="row">
              <label for="planned-hours">Planned Effort (hours)</label>
              <input id="planned-hours" name="planned" type="number" min="0" step="0.01" value="1" required />
            </div>
            <div class="row">
              <label for="actual-hours">Actual Effort (hours)</label>
              <input id="actual-hours" name="actual" type="number" min="0" step="0.01" value="1" required />
            </div>
            <div class="actions">
              <button class="primary-button" type="submit">Save Prompt</button>
            </div>
            <div id="save-status" class="status muted"></div>
          </form>
          <div class="helper-card">
            <h3>Recent Prompts</h3>
            <div class="muted">Your latest saved prompts and time saved numbers appear here.</div>
            <div id="recent-prompts" class="table-wrap"></div>
          </div>
        </div>
      </section>
      <section id="report-panel" class="panel">
        <div class="hero">
          <h2>Report</h2>
          <div class="hero-copy">Generate a range-based summary of prompt volume, planned effort, actual effort, and overall time saved. Export the result as a modern Excel workbook when you need to share or archive it.</div>
        </div>
        <div class="content-grid">
          <form id="report-form" class="helper-card">
            <div class="row">
              <label for="from">From</label>
              <input id="from" name="from" type="date" required />
            </div>
            <div class="row">
              <label for="to">To</label>
              <input id="to" name="to" type="date" required />
            </div>
            <div class="actions">
              <button class="primary-button" type="submit">Generate Report</button>
              <button id="export-report" class="secondary-button" type="button">Export Excel</button>
            </div>
            <div id="report-status" class="status muted"></div>
          </form>
          <div class="helper-card">
            <h3>How report export works</h3>
            <div class="helper-list">
              <div class="helper-item">Choose your date range and generate the report first.</div>
              <div class="helper-item">Use <strong>Export Excel</strong> to save a modern .xlsx workbook.</div>
              <div class="helper-item">The export includes summary, daily breakdown, and prompt-level rows.</div>
            </div>
          </div>
        </div>
        <div id="output" class="helper-card"></div>
      </section>
    </div>
  </div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }

  private async pushBootstrapState(): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    const prompts = await this.storage.getAllPrompts();
    const now = new Date();

    this.webviewView.webview.postMessage({
      type: "bootstrap",
      payload: {
        defaultFrom: toDayKey(now),
        defaultTo: toDayKey(now),
        todayCount: this.reporting.getTodayCount(prompts, toDayKey(now)),
        monthCount: this.reporting.getMonthCount(prompts, toMonthKey(now)),
        recentPrompts: prompts.slice(0, 10)
      }
    });
  }

  private async handleSavePrompt(message: { promptText: string; plannedHours: number; actualHours: number }): Promise<void> {
    if (!this.isValidHours(message.plannedHours) || !this.isValidHours(message.actualHours)) {
      this.webviewView?.webview.postMessage({
        type: "saveError",
        payload: {
          message: "Planned and actual effort must be non-negative hours with up to 2 decimal places."
        }
      });
      return;
    }

    await this.tracker.createPrompt({
      promptText: message.promptText,
      plannedEffortHours: Number(message.plannedHours),
      actualEffortHours: Number(message.actualHours),
      source: "webview"
    });

    this.sidebar.refresh();
    await this.pushBootstrapState();

    this.webviewView?.webview.postMessage({
      type: "promptSaved",
      payload: {
        message: "Prompt saved successfully."
      }
    });
  }

  private async handleGenerateReport(from: string, to: string): Promise<void> {
    const prompts = await this.storage.getAllPrompts();
    const report = this.reporting.buildRangeReport(prompts, from, to);

    this.webviewView?.webview.postMessage({
      type: "reportResult",
      payload: report
    });
  }

  private async handleExportReport(from: string, to: string): Promise<void> {
    const prompts = await this.storage.getAllPrompts();
    const filteredPrompts = prompts.filter((prompt) => prompt.createdAt.slice(0, 10) >= from && prompt.createdAt.slice(0, 10) <= to);
    const report = this.reporting.buildRangeReport(prompts, from, to);
    const workbook = this.excelExport.buildWorkbook(report, filteredPrompts);
    const defaultUri = vscode.Uri.joinPath(this.context.globalStorageUri, `copilot-usage-report-${from}-to-${to}.xlsx`);
    const selected = await vscode.window.showSaveDialog({
      defaultUri,
      filters: {
        "Excel Workbook": ["xlsx"]
      }
    });

    if (!selected) {
      return;
    }

    const exportPath = path.extname(selected.fsPath) ? selected.fsPath : `${selected.fsPath}.xlsx`;

    await fs.writeFile(exportPath, workbook);
    this.webviewView?.webview.postMessage({
      type: "reportExported",
      payload: {
        message: `Excel report exported to ${exportPath}`
      }
    });
  }

  private async handleFillFromSelection(): Promise<void> {
    const text = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection).trim() ?? "";
    this.webviewView?.webview.postMessage({
      type: "promptPrefilled",
      payload: {
        text,
        source: "editor selection"
      }
    });
  }

  private async handleFillFromClipboard(): Promise<void> {
    const text = (await vscode.env.clipboard.readText()).trim();
    this.webviewView?.webview.postMessage({
      type: "promptPrefilled",
      payload: {
        text,
        source: "clipboard"
      }
    });
  }

  private isValidHours(value: number): boolean {
    if (!Number.isFinite(value) || value < 0) {
      return false;
    }

    return Math.round(value * 100) === value * 100;
  }
}
