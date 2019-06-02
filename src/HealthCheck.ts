import { CronJob } from 'cron'
import * as fs from 'fs'
import { range } from 'lodash'
import * as path from 'path'
import * as prometheus from 'prom-client'
import * as winston from 'winston'

export interface AlertmanagerRule {
  alert: string
  annotations: {
    summary?: string
    description?: string
    message?: string
    runbook_url?: string
  }
  expr: string
  for?: string
  labels: {
    severity: 'none' | 'warning' | 'critical'
    [key: string]: string
  }
}

export interface HealthCheckDurationBuckets {
  minSeconds: number
  maxSeconds: number
  precision?: number
}

export interface HealthCheckExecutionResult {
  error?: any
  duration: number
}

export interface HealthCheck {
  name: string
  cron: string
  durationBuckets: HealthCheckDurationBuckets
  alertmanagerRules?: AlertmanagerRule[]
  execute: (logger: winston.Logger, test?: boolean) => Promise<HealthCheckExecutionResult>
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
  const minSeconds = healthCheck.durationBuckets.minSeconds
  const maxSeconds = healthCheck.durationBuckets.maxSeconds
  const precision = healthCheck.durationBuckets.precision || 0.1
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
      try {
        const result = await runHealthCheck(logger, healthCheck)
        durationHistogram.observe(result.duration)
        if (!result.error) {
          successCounter.inc()
        } else {
          failureCounter.inc()
        }
      } catch (err) {
        logger.error('An error occured', {
          error: (err && err.message) || undefined,
        })
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
): Promise<HealthCheckExecutionResult> {
  const result = await healthCheck.execute(logger, test)
  if (!result.error) {
    logger.debug(`Healthcheck ${healthCheck.name} succeeded (took ${(result.duration * 1000).toFixed(3)} msecs)`)
  } else {
    logger.warn(`Healthcheck ${healthCheck.name} failed (took ${(result.duration * 1000).toFixed(3)} msecs)`, {
      error: (result.error && result.error.message) || undefined,
    })
  }
  return result
}
