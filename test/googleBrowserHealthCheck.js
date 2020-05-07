"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
exports.default = src_1.browserTemplate('google_browser', {
    schedule: 5000,
    script: async (page) => {
        await page.goto('https://google.com', { waitUntil: 'networkidle0' });
    },
});
//# sourceMappingURL=googleBrowserHealthCheck.js.map