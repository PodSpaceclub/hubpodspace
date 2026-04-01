/**
 * Next.js Instrumentation Hook
 * Runs once when the Node.js server starts.
 * Registers global error handlers to prevent the process from crashing
 * on unhandled rejections or uncaught exceptions, which would cause
 * Nginx to return 502/404 for static assets during restart.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('unhandledRejection', (reason) => {
      console.error('[process] unhandledRejection — processo mantido vivo:', reason);
    });
    process.on('uncaughtException', (error) => {
      console.error('[process] uncaughtException — processo mantido vivo:', error);
    });
  }
}
