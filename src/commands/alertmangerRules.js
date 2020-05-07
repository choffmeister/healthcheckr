"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const HealthCheck_1 = require("../HealthCheck");
async function default_1({ directory }) {
    const healthChecks = await HealthCheck_1.loadHealthChecks(directory);
    process.stdout.write(yaml.safeDump({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        data: {
            'healthcheckr.rules.yaml': yaml.safeDump({
                groups: healthChecks
                    .filter(hc => hc.alertmanagerRules && hc.alertmanagerRules.length > 0)
                    .map(healthCheck => ({
                    name: `${healthCheck.name}.rules`,
                    rules: healthCheck.alertmanagerRules,
                })),
            }),
        },
    }));
}
exports.default = default_1;
//# sourceMappingURL=alertmangerRules.js.map