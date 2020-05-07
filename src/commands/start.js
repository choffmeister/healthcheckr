"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const expressBasicAuth = require("express-basic-auth");
const http = require("http");
const prometheus = require("prom-client");
const winston = require("winston");
const HealthCheck_1 = require("../HealthCheck");
async function default_1({ verbose, directory, additionalLabels, metricsAuth }) {
    const logger = winston.createLogger({
        level: !verbose ? 'info' : 'debug',
        format: winston.format.simple(),
        transports: [new winston.transports.Console()],
    });
    const app = express();
    const healthChecks = await HealthCheck_1.loadHealthChecks(directory);
    if (healthChecks.length > 0) {
        const metrics = HealthCheck_1.initializeMetrics(additionalLabels);
        healthChecks.forEach(healthCheck => {
            logger.info(`Loaded healthcheck ${healthCheck.name}`);
            HealthCheck_1.initializeHealthCheck(logger, metrics, healthCheck, additionalLabels);
        });
    }
    else {
        logger.warn('Could not find any healthchecks');
    }
    const metricsAuthMiddelware = metricsAuth
        ? (req, res, next) => {
            const [username, password] = metricsAuth.split(':', 2);
            const middleware = expressBasicAuth({
                challenge: true,
                users: {
                    [username]: password,
                },
            });
            // @ts-ignore
            return middleware(req, res, next);
        }
        : (_req, _res, next) => next();
    app.get('/metrics', metricsAuthMiddelware, (_req, res) => {
        res.set('Content-Type', prometheus.register.contentType);
        res.end(prometheus.register.metrics());
    });
    http.createServer(app).listen(8080);
}
exports.default = default_1;
//# sourceMappingURL=start.js.map