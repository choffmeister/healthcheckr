export async function measureDuration<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = process.hrtime()
  const result = await fn()
  const end = process.hrtime(start)
  const duration = end[0] + end[1] * 1e-9
  return [result, duration]
}
