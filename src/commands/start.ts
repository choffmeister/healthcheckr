import * as express from 'express'
import * as expressBasicAuth from 'express-basic-auth'
import * as http from 'http'
import * as prometheus from 'prom-client'
import * as winston from 'winston'
import { initializeHealthCheck, loadHealthChecks } from '../HealthCheck'

export interface Args {
  verbose: boolean
  directory: string
  auth?: string
}

export default async function({ verbose, directory, auth }: Args) {
  const logger = winston.createLogger({
    level: !verbose ? 'info' : 'debug',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  })

  const app = express()
  const healthChecks = await loadHealthChecks(directory)
  if (healthChecks.length > 0) {
    healthChecks.forEach(healthCheck => {
      logger.info(`Loaded healthcheck ${healthCheck.name}`)
      initializeHealthCheck(logger, healthCheck)
    })
  } else {
    logger.warn('Could not find any healthchecks')
  }

  const authMiddelware: express.Handler = auth
    ? (req, res, next) => {
        const [username, password] = auth.split(':', 2)
        const middleware = expressBasicAuth({
          challenge: true,
          users: {
            [username]: password,
          },
        })
        return middleware(req, res, next)
      }
    : (_req, _res, next) => next()

  app.get('/metrics', authMiddelware, (_req, res) => {
    res.set('Content-Type', prometheus.register.contentType)
    res.end(prometheus.register.metrics())
  })

  http.createServer(app).listen(8080)
}
