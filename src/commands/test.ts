import * as winston from 'winston'
import { loadHealthChecks, runHealthCheck } from '../HealthCheck'

export interface Args {
  verbose: boolean
  directory: string
}

export default async function({ verbose, directory }: Args) {
  const logger = winston.createLogger({
    level: !verbose ? 'info' : 'debug',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  })

  const healthChecks = await loadHealthChecks(directory)
  if (healthChecks.length > 0) {
    await healthChecks.reduce(
      (acc, healthCheck) => acc.then(async () => runHealthCheck(logger, healthCheck, true)),
      Promise.resolve()
    )
  } else {
    logger.warn('Could not find any healthchecks')
  }
}
