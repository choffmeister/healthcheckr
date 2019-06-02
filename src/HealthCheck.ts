import { CronJob } from 'cron'
import * as fs from 'fs'
import { range } from 'lodash'
import * as path from 'path'
import * as prometheus from 'prom-client'
import * as winston from 'winston'

export interface HealthCheckBuckets {
  minSeconds: number
  maxSeconds: number
  precision?: number
}

export interface HealthCheckAlert {
  name: string
  message: string
  expression: string
  severity: 'none' | 'warning' | 'critical'
}

export interface HealthCheck {
  name: string
  cron: string
  buckets: HealthCheckBuckets
  alerts?: HealthCheckAlert[]
  execute: (logger: winston.Logger, test?: boolean) => Promise<number>
}

export async function loadHealthChecks(directory: string): Promise<HealthCheck[]> {
  const fileNames = await new Promise<string[]>((resolve, reject) => {
    fs.readdir(directory, (err, files) => (!err ? resolve(files) : reject(err)))
  })
  const healthChecks = fileNames
    .filter(fn => !!fn.match(/\.ts$/))
    .map(fileName => {
      const file = path.resolve(directory, fileName)
      return require(file).default as HealthCheck
    })
  return healthChecks
}

export function initializeHealthCheck(logger: winston.Logger, healthCheck: HealthCheck): CronJob {
  const minSeconds = healthCheck.buckets.minSeconds
  const maxSeconds = healthCheck.buckets.maxSeconds
  const precision = healthCheck.buckets.precision || 0.1
  const steps = Math.ceil(Math.log(maxSeconds / minSeconds) / Math.log(1 + precision)) + 1
  const buckets = range(0, steps).map(i => Math.pow(1 + precision, i) * minSeconds)
  const durationHistogram = new prometheus.Histogram({
    name: `healthcheckr_${healthCheck.name}_duration_seconds`,
    help: healthCheck.name,
    buckets,
  })

  const successCounter = new prometheus.Counter({
    name: `healthcheckr_${healthCheck.name}_success_count`,
    help: healthCheck.name,
  })
  const failureCounter = new prometheus.Counter({
    name: `healthcheckr_${healthCheck.name}_failure_count`,
    help: healthCheck.name,
  })

  return new CronJob(
    healthCheck.cron,
    async () => {
      const duration = await runHealthCheck(logger, healthCheck)
      if (duration !== undefined) {
        durationHistogram.observe(duration)
        successCounter.inc()
      } else {
        failureCounter.inc()
      }
    },
    undefined,
    true,
    'UTC'
  )
}

export async function runHealthCheck(
  logger: winston.Logger,
  healthCheck: HealthCheck,
  test?: boolean
): Promise<number | undefined> {
  try {
    const duration = await healthCheck.execute(logger, test)
    logger.debug(`Healthcheck ${healthCheck.name} succeeded (took ${(duration * 1000).toFixed(3)} msecs)`)
    return duration
  } catch (err) {
    logger.warn(`Healthcheck ${healthCheck.name} failed`, { err })
    return undefined
  }
}
