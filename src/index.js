"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const winston = require("winston");
const yargs = require("yargs");
const alertmangerRules_1 = require("./commands/alertmangerRules");
const start_1 = require("./commands/start");
const test_1 = require("./commands/test");
__export(require("./HealthCheck"));
__export(require("./templates"));
__export(require("./utils"));
const baseLogger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
});
async function main() {
    try {
        // tslint:disable-next-line no-unused-expression
        yargs
            .option('verbose', {
            type: 'boolean',
            alias: 'v',
            default: false,
        })
            .option('directory', {
            type: 'string',
            default: 'checks',
            coerce: path.resolve,
        })
            .command('start', 'starts the healthchecks watcher', yargs => yargs
            .option('label', {
            type: 'array',
            alias: 'l',
            coerce: (arr) => {
                return arr.map(raw => {
                    const match = raw.match(/^([^=]+)=([^=]+)$/);
                    if (match) {
                        return {
                            label: match[1],
                            value: match[2],
                        };
                    }
                    else {
                        throw new Error(`Unable to parse label definition '${raw}'`);
                    }
                });
            },
        })
            .option('auth', {
            type: 'string',
            alias: 'a',
        }), yargs => start_1.default({
            verbose: yargs.verbose,
            directory: yargs.directory,
            additionalLabels: yargs.label || [],
            metricsAuth: yargs.auth,
        }))
            .command('test', 'test the healthchecks', yargs => yargs, test_1.default)
            .command('alertmanager-rules', 'exports prometheus alertmanager rules', yargs => yargs, alertmangerRules_1.default)
            .recommendCommands()
            .demandCommand(1)
            .help()
            .strict().argv;
    }
    catch (err) {
        baseLogger.error('Starting the server failed', { error: (err && err.message) || undefined });
        process.exit(1);
    }
}
exports.main = main;
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map