import axios, { AxiosRequestConfig } from 'axios'
import { HealthCheck } from '../HealthCheck'
import { measureDuration } from '../utils'

export interface HttpTemplateOpts {
  schedule: number
  request: AxiosRequestConfig
}

export function httpTemplate(name: string, opts: HttpTemplateOpts): HealthCheck {
  return {
    name,
    schedule: opts.schedule,
    execute: () => {
      return measureDuration(async () => {
        await axios.request(opts.request)
      })
    },
  }
}
