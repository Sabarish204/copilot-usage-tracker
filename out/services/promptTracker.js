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
exports.PromptTrackerService = void 0;
const vscode = __importStar(require("vscode"));
const date_1 = require("../util/date");
class PromptTrackerService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async createPrompt(params) {
        const now = new Date();
        const config = vscode.workspace.getConfiguration("copilotUsageTracker");
        const storePromptText = config.get("storePromptText", true);
        const record = {
            id: this.createId(now),
            createdAt: now.toISOString(),
            dayKey: (0, date_1.toDayKey)(now),
            monthKey: (0, date_1.toMonthKey)(now),
            source: params.source,
            promptText: storePromptText ? params.promptText : undefined,
            promptPreview: this.toPreview(params.promptText),
            plannedEffortHours: params.plannedEffortHours,
            actualEffortHours: params.actualEffortHours,
            efficiencyPct: (0, date_1.computeEfficiencyPct)(params.plannedEffortHours, params.actualEffortHours),
            notes: params.notes
        };
        await this.storage.savePrompt(record);
        return record;
    }
    async updateEffort(promptId, plannedEffortHours, actualEffortHours) {
        return this.storage.updatePrompt(promptId, {
            plannedEffortHours,
            actualEffortHours,
            efficiencyPct: (0, date_1.computeEfficiencyPct)(plannedEffortHours, actualEffortHours)
        });
    }
    createId(date) {
        return `${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    toPreview(value) {
        const trimmed = value.replace(/\s+/g, " ").trim();
        return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
    }
}
exports.PromptTrackerService = PromptTrackerService;
//# sourceMappingURL=promptTracker.js.map