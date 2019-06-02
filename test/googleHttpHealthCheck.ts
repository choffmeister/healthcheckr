import axios from 'axios'
import { HealthCheck } from '../src/HealthCheck'
import { measureDuration } from '../src/utils'

const googleHealthCheck: HealthCheck = {
  name: 'google_http',
  cron: '*/5 * * * * *',
  buckets: {
    minSeconds: 0.1,
    maxSeconds: 5.0,
  },
  execute: async () => {
    const [, duration] = await measureDuration(async () => {
      await axios.get('https://google.com')
    })
    return duration
  },
}

export default googleHealthCheck
