import { httpTemplate } from '../src'

export default httpTemplate('google_http', {
  schedule: 1000,
  request: {
    method: 'get',
    url: 'https://google.com',
  },
})
