import { browserTemplate } from '../src'

export default browserTemplate('google_browser', {
  schedule: 5000,
  script: async page => {
    await page.goto('https://google.com', { waitUntil: 'networkidle0' })
  },
})
