"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDayKey = toDayKey;
exports.toMonthKey = toMonthKey;
exports.isWithinDateRange = isWithinDateRange;
exports.computeEfficiencyPct = computeEfficiencyPct;
function toDayKey(date) {
    return date.toISOString().slice(0, 10);
}
function toMonthKey(date) {
    return date.toISOString().slice(0, 7);
}
function isWithinDateRange(isoDate, from, to) {
    const value = isoDate.slice(0, 10);
    return value >= from && value <= to;
}
function computeEfficiencyPct(planned, actual) {
    if (!planned || planned <= 0 || actual === undefined || actual < 0) {
        return 0;
    }
    const savedPct = ((planned - actual) / planned) * 100;
    return Number(Math.max(0, Math.min(100, savedPct)).toFixed(2));
}
//# sourceMappingURL=date.js.map