"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function measureDuration(fn) {
    const start = process.hrtime();
    try {
        const result = await fn();
        const end = process.hrtime(start);
        const duration = end[0] + end[1] * 1e-9;
        return {
            result,
            duration,
        };
    }
    catch (error) {
        const end = process.hrtime(start);
        const duration = end[0] + end[1] * 1e-9;
        return {
            error,
            duration,
        };
    }
}
exports.measureDuration = measureDuration;
//# sourceMappingURL=measureDuration.js.map