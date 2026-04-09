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
exports.ExcelExportService = void 0;
const XLSX = __importStar(require("xlsx"));
class ExcelExportService {
    buildWorkbook(report, prompts) {
        const workbook = XLSX.utils.book_new();
        const summaryRows = [
            ["From", report.from],
            ["To", report.to],
            ["Total Prompts", report.totalPrompts],
            ["Total Planned Hours", report.totalPlannedHours],
            ["Total Actual Hours", report.totalActualHours],
            ["Efficiency Saved %", report.efficiencyPct]
        ];
        const reportRows = [
            ["Date", "Prompts", "Planned Hours", "Actual Hours", "Efficiency Saved %"],
            ...report.byDay.map((day) => [
                day.dayKey,
                day.totalPrompts,
                day.totalPlannedHours,
                day.totalActualHours,
                day.efficiencyPct
            ])
        ];
        const promptRows = [
            ["Prompt Serial Number", "Prompt", "Date", "Planned Effort", "Actual Effort", "Efficiency %"],
            ...prompts.map((prompt, index) => [
                index + 1,
                prompt.promptText ?? prompt.promptPreview,
                prompt.createdAt.slice(0, 10),
                prompt.plannedEffortHours ?? "",
                prompt.actualEffortHours ?? "",
                prompt.efficiencyPct ?? 0
            ])
        ];
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(reportRows), "Daily Report");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(promptRows), "Prompts");
        return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    }
}
exports.ExcelExportService = ExcelExportService;
//# sourceMappingURL=excelExport.js.map