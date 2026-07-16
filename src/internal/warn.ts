/**
 * Logs a warning message to the console in non-production environments.
 *
 * This utility function conditionally outputs warnings to help developers
 * catch potential issues during development without cluttering production logs.
 *
 * @param message - The warning message to display
 * @returns void
 *
 * @remarks
 * - Warnings are only logged when `NODE_ENV` is not set to `'production'`.
 * - The function checks for the existence of `process` and `process.env`
 *   to avoid errors in browser environments where `process` may be undefined.
 * - All warnings are prefixed with `[resolveStyles]` for easy identification
 *   and filtering in the console.
 * - In production builds, the warning is completely suppressed to avoid
 *   unnecessary console output and potential performance overhead.
 *
 * @example
 * ```ts
 * // Development environment (NODE_ENV !== 'production')
 * warn('Invalid style property: "display: flex"');
 * // Console output: "[resolveStyles] Invalid style property: "display: flex""
 *
 * // Production environment (NODE_ENV === 'production')
 * warn('This will not be logged');
 * // No console output
 *
 * // Browser environment (process undefined)
 * warn('Works in browsers too');
 * // Will check process existence first, logs if not in production
 * ```
 *
 * @see {@link https://nodejs.org/api/process.html#process_process_env | Node.js process.env}
 * @see {@link https://create-react-app.dev/docs/adding-custom-environment-variables/ | Environment Variables in React}
 */
export function warn(message: string): void {
  // Only log warnings in development environment
  // Checks for process existence to support browser environments
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(`[resolveStyles] ${message}`);
  }
}
