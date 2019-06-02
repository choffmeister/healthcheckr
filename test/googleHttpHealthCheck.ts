import { httpTemplate } from '../src'

export default httpTemplate('google_http', {
  cron: '*/5 * * * * *',
  request: {
    method: 'get',
    url: 'https://google.com',
  },
})
