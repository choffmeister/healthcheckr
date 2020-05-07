"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const utils_1 = require("../utils");
function browserTemplate(name, opts) {
    return {
        name,
        schedule: opts.schedule,
        execute: async (_logger, test) => {
            const browser = await puppeteer.launch({
                headless: !test,
                args: ['--no-sandbox'],
            });
            try {
                const page = await browser.newPage();
                await page.emulateMediaType('screen');
                await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
                return await utils_1.measureDuration(() => opts.script(page));
            }
            finally {
                await browser.close();
            }
        },
    };
}
exports.browserTemplate = browserTemplate;
//# sourceMappingURL=browserTemplate.js.map