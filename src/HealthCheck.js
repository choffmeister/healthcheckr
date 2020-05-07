"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const lodash_1 = require("lodash");
const path = require("path");
const prometheus = require("prom-client");
async function loadHealthChecks(directory) {
    const fileNames = await new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => (!err ? resolve(files) : reject(err)));
    });
    const healthChecks = fileNames
        .filter(fn => !!fn.match(/\.ts$/))
        .map(fileName => {
        const file = path.resolve(directory, fileName);
        return require(file).default;
    });
    return healthChecks;
}
exports.loadHealthChecks = loadHealthChecks;
function initializeMetrics(additionalLabels) {
    const labelNames = ['check', ...additionalLabels.map(l => l.label)];
    const minSeconds = 0.1;
    const maxSeconds = 30;
    const precision = 0.1;
    const steps = Math.ceil(Math.log(maxSeconds / minSeconds) / Math.log(1 + precision)) + 1;
    const buckets = lodash_1.range(0, steps).map(i => Math.pow(1 + precision, i) * minSeconds);
    return {
        durationHistogram: new prometheus.Histogram({
            name: 'healthcheckr_duration_seconds',
            help: 'Execution duration',
            buckets,
            labelNames,
        }),
        successCounter: new prometheus.Counter({
            name: 'healthcheckr_success_count',
            help: 'Successful count',
            labelNames,
        }),
        failureCounter: new prometheus.Counter({
            name: 'healthcheckr_failure_count',
            help: 'Failed count',
            labelNames,
        }),
        totalCounter: new prometheus.Counter({
            name: 'healthcheckr_total_count',
            help: 'Total count',
            labelNames,
        }),
    };
}
exports.initializeMetrics = initializeMetrics;
function initializeHealthCheck(logger, metrics, healthCheck, additionalLabels) {
    const labels = additionalLabels.reduce((acc, { label, value }) => (Object.assign(Object.assign({}, acc), { [label]: value })), {
        check: healthCheck.name,
    });
    const loop = async () => {
        try {
            const result = await runHealthCheck(logger, healthCheck);
            metrics.durationHistogram.observe(labels, result.duration);
            metrics.totalCounter.inc(labels);
            if (!result.error) {
                metrics.successCounter.inc(labels);
            }
            else {
                metrics.failureCounter.inc(labels);
            }
        }
        catch (err) {
            logger.error('An error occured', {
                error: (err && err.message) || undefined,
            });
        }
        setTimeout(() => loop(), healthCheck.schedule * (Math.random() * 0.2 + 0.9));
    };
    loop();
}
exports.initializeHealthCheck = initializeHealthCheck;
async function runHealthCheck(logger, healthCheck, test) {
    const result = await healthCheck.execute(logger, test);
    if (!result.error) {
        logger.debug(`Healthcheck ${healthCheck.name} succeeded (took ${(result.duration * 1000).toFixed(3)} msecs)`);
    }
    else {
        logger.warn(`Healthcheck ${healthCheck.name} failed (took ${(result.duration * 1000).toFixed(3)} msecs)`, {
            error: (result.error && result.error.message) || undefined,
        });
    }
    return result;
}
exports.runHealthCheck = runHealthCheck;
//# sourceMappingURL=HealthCheck.js.map