"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const utils_1 = require("../utils");
function httpTemplate(name, opts) {
    return {
        name,
        schedule: opts.schedule,
        execute: () => {
            return utils_1.measureDuration(async () => {
                await axios_1.default.request(opts.request);
            });
        },
    };
}
exports.httpTemplate = httpTemplate;
//# sourceMappingURL=httpTemplate.js.map