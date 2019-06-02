import * as path from 'path'
import * as winston from 'winston'
import * as yargs from 'yargs'
import { default as alertmanagerRulesCommand } from './commands/alertmangerRules'
import { default as startCommand } from './commands/start'
import { default as testCommand } from './commands/test'

export * from './HealthCheck'
export * from './templates'
export * from './utils'

const baseLogger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
})

export async function main() {
  try {
    // tslint:disable-next-line no-unused-expression
    yargs
      .option('verbose', {
        type: 'boolean',
        alias: 'v',
        default: false,
      })
      .option('directory', {
        type: 'string',
        default: 'checks',
        coerce: path.resolve,
      })
      .command(
        'start',
        'starts the healthchecks watcher',
        yargs =>
          yargs
            .option('label', {
              type: 'array',
              alias: 'l',
              coerce: (arr: string[]) => {
                return arr.map(raw => {
                  const match = raw.match(/^([^=]+)=([^=]+)$/)
                  if (match) {
                    return {
                      label: match[1],
                      value: match[2],
                    }
                  } else {
                    throw new Error(`Unable to parse label definition '${raw}'`)
                  }
                })
              },
            })
            .option('auth', {
              type: 'string',
              alias: 'a',
            }),
        yargs =>
          startCommand({
            verbose: yargs.verbose,
            directory: yargs.directory,
            additionalLabels: (yargs.label as any) || [],
            metricsAuth: yargs.auth,
          })
      )
      .command('test', 'test the healthchecks', yargs => yargs, testCommand)
      .command('alertmanager-rules', 'exports prometheus alertmanager rules', yargs => yargs, alertmanagerRulesCommand)
      .recommendCommands()
      .demandCommand(1)
      .help()
      .strict().argv
  } catch (err) {
    baseLogger.error('Starting the server failed', { error: (err && err.message) || undefined })
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
