import { browserTemplate } from '../src'

export default browserTemplate('google_browser', {
  cron: '*/5 * * * * *',
  script: async page => {
    await page.goto('https://google.com', { waitUntil: 'networkidle0' })
  },
})
