import * as XLSX from "xlsx";
import { PromptRecord, RangeReport } from "../models";

export class ExcelExportService {
  buildWorkbook(report: RangeReport, prompts: PromptRecord[]): Buffer {
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
      ["S.No", "Prompt", "Date", "Planned Effort", "Actual Effort", "Efficiency %"],
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
