export function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(`[resolveStyles] ${message}`);
  }
}
