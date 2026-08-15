export function getErrorStatus(error: Error): number | undefined {
  return (error as Error & { status?: number }).status
}
