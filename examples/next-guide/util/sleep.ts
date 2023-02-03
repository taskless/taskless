/**
 * Sleep for a predetermined amount of time, used to
 * illustrate services such as a DB connection or
 * external app. Logs info messages along the way
 */
export const sleep = (ms: number, action?: string, failure?: string) =>
  new Promise<void>((resolve) => {
    console.info(`[⏳] ${action}`);
    setTimeout(() => {
      console.info(failure ? `[💥] ${failure}` : `[✅] ${action}`);
      resolve();
    }, ms);
  });
