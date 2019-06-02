export interface MeasureDurationResult<T> {
  error?: any
  result?: T
  duration: number
}

export async function measureDuration<T>(fn: () => Promise<T>): Promise<MeasureDurationResult<T>> {
  const start = process.hrtime()
  try {
    const result = await fn()
    const end = process.hrtime(start)
    const duration = end[0] + end[1] * 1e-9
    return {
      result,
      duration,
    }
  } catch (error) {
    const end = process.hrtime(start)
    const duration = end[0] + end[1] * 1e-9
    return {
      error,
      duration,
    }
  }
}
