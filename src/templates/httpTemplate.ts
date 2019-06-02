import axios, { AxiosRequestConfig } from 'axios'
import { HealthCheck } from '../HealthCheck'
import { measureDuration } from '../utils'

export interface HttpTemplateOpts {
  cron: string
  request: AxiosRequestConfig
}

export function httpTemplate(name: string, opts: HttpTemplateOpts): HealthCheck {
  return {
    name,
    cron: opts.cron,
    durationBuckets: {
      minSeconds: 0.1,
      maxSeconds: 5.0,
    },
    execute: () => {
      return measureDuration(async () => {
        await axios.request(opts.request)
      })
    },
  }
}
