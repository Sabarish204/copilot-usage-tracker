"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const date_1 = require("../util/date");
class ReportingService {
    getTodayCount(prompts, dayKey) {
        return prompts.filter((prompt) => prompt.dayKey === dayKey).length;
    }
    getMonthCount(prompts, monthKey) {
        return prompts.filter((prompt) => prompt.monthKey === monthKey).length;
    }
    buildRangeReport(prompts, from, to) {
        const filtered = prompts.filter((prompt) => (0, date_1.isWithinDateRange)(prompt.createdAt, from, to));
        const grouped = new Map();
        for (const prompt of filtered) {
            const dayPrompts = grouped.get(prompt.dayKey) ?? [];
            dayPrompts.push(prompt);
            grouped.set(prompt.dayKey, dayPrompts);
        }
        const byDay = Array.from(grouped.entries())
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([dayKey, dayPrompts]) => ({
            dayKey,
            ...this.calculateMetrics(dayPrompts)
        }));
        return {
            from,
            to,
            byDay,
            ...this.calculateMetrics(filtered)
        };
    }
    calculateMetrics(prompts) {
        const totalPlannedHours = prompts.reduce((sum, prompt) => sum + (prompt.plannedEffortHours ?? 0), 0);
        const totalActualHours = prompts.reduce((sum, prompt) => sum + (prompt.actualEffortHours ?? 0), 0);
        const efficiencyPct = totalPlannedHours > 0
            ? Number(Math.max(0, Math.min(100, ((totalPlannedHours - totalActualHours) / totalPlannedHours) * 100)).toFixed(2))
            : 0;
        return {
            totalPrompts: prompts.length,
            totalPlannedHours: Number(totalPlannedHours.toFixed(2)),
            totalActualHours: Number(totalActualHours.toFixed(2)),
            efficiencyPct
        };
    }
}
exports.ReportingService = ReportingService;
//# sourceMappingURL=reporting.js.map