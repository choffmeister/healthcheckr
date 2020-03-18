import * as puppeteer from 'puppeteer'
import { HealthCheck } from '../HealthCheck'
import { measureDuration } from '../utils'

export interface BrowserTemplateOpts {
  schedule: number
  script: (page: puppeteer.Page) => Promise<void>
}

export function browserTemplate(name: string, opts: BrowserTemplateOpts): HealthCheck {
  return {
    name,
    schedule: opts.schedule,
    execute: async (_logger, test) => {
      const browser = await puppeteer.launch({
        headless: !test,
        args: ['--no-sandbox'],
      })
      try {
        const page = await browser.newPage()
        await page.emulateMediaType('screen')
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
        return await measureDuration(() => opts.script(page))
      } finally {
        await browser.close()
      }
    },
  }
}
