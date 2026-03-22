export function log(message: string, ...args: unknown[]) {
  console.log(`[StudyQ API] ${message}`, ...args);
}

export function logError(message: string, error: unknown) {
  console.error(`[StudyQ API ERROR] ${message}`, error);
}
