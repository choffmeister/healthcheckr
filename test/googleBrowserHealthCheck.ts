import * as puppeteer from 'puppeteer'
import { HealthCheck } from '../src/HealthCheck'
import { measureDuration } from '../src/utils'

const browserHealthCheck: HealthCheck = {
  name: 'google_browser',
  cron: '*/5 * * * * *',
  buckets: {
    minSeconds: 1,
    maxSeconds: 10,
  },
  alerts: [
    {
      name: 'GoogleBrowsingSlow',
      message: 'Browsing https://google.com is slow',
      expression: 'avg(healthcheckr_google_browser[15m]) > 2',
      severity: 'warning',
    },
  ],
  execute: async (_logger, test) => {
    const browser = await puppeteer.launch({
      headless: !test,
      args: ['--no-sandbox'],
    })
    try {
      const page = await browser.newPage()
      await page.emulateMedia('screen')
      await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 })
      const [, duration] = await measureDuration(async () => {
        await page.goto('https://google.com', { waitUntil: 'networkidle0' })
      })
      return duration
    } finally {
      await browser.close()
    }
  },
}

export default browserHealthCheck
