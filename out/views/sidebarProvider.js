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
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const date_1 = require("../util/date");
class SidebarProvider {
    storage;
    reporting;
    onDidChangeTreeDataEmitter = new vscode.EventEmitter();
    onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
    constructor(storage, reporting) {
        this.storage = storage;
        this.reporting = reporting;
    }
    refresh() {
        this.onDidChangeTreeDataEmitter.fire(undefined);
    }
    getTreeItem(element) {
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
    async getChildren() {
        const prompts = await this.storage.getAllPrompts();
        const now = new Date();
        const summaryNodes = [
            {
                kind: "summary",
                label: "Today",
                description: `${this.reporting.getTodayCount(prompts, (0, date_1.toDayKey)(now))} prompts`
            },
            {
                kind: "summary",
                label: "This Month",
                description: `${this.reporting.getMonthCount(prompts, (0, date_1.toMonthKey)(now))} prompts`
            }
        ];
        const promptNodes = prompts.slice(0, 25).map((prompt) => ({
            kind: "prompt",
            prompt
        }));
        return [...summaryNodes, ...promptNodes];
    }
    createPromptTooltip(prompt) {
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
    formatHours(value) {
        return value === undefined ? "-" : value.toFixed(2);
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=sidebarProvider.js.map