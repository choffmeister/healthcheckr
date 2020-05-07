"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const HealthCheck_1 = require("../HealthCheck");
async function default_1({ verbose, directory }) {
    const logger = winston.createLogger({
        level: !verbose ? 'info' : 'debug',
        format: winston.format.simple(),
        transports: [new winston.transports.Console()],
    });
    const healthChecks = await HealthCheck_1.loadHealthChecks(directory);
    if (healthChecks.length > 0) {
        await healthChecks.reduce((acc, healthCheck) => acc.then(async () => HealthCheck_1.runHealthCheck(logger, healthCheck, true)), Promise.resolve());
    }
    else {
        logger.warn('Could not find any healthchecks');
    }
}
exports.default = default_1;
//# sourceMappingURL=test.js.map