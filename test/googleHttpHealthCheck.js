"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
exports.default = src_1.httpTemplate('google_http', {
    schedule: 1000,
    request: {
        method: 'get',
        url: 'https://google.com',
    },
});
//# sourceMappingURL=googleHttpHealthCheck.js.map