import * as yaml from 'js-yaml'
import { loadHealthChecks } from '../HealthCheck'

export interface Args {
  directory: string
}

export default async function({ directory }: Args) {
  const healthChecks = await loadHealthChecks(directory)
  process.stdout.write(
    yaml.safeDump({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      data: {
        'healthcheckr.rules.yaml': yaml.safeDump({
          groups: healthChecks
            .filter(hc => hc.alerts && hc.alerts.length > 0)
            .map(healthCheck => ({
              name: `${healthCheck.name}.rules`,
              rules: healthCheck.alerts!.map(alert => ({
                alert: alert.name,
                annotations: {
                  message: alert.message,
                },
                expr: alert.expression,
                labels: {
                  severity: alert.severity,
                },
              })),
            })),
        }),
      },
    })
  )
}
