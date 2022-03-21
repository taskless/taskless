/** A stand-in error object that works with Phin */
export class RequestError extends Error {
  raw: unknown;
  constructor(err: string | undefined, raw: unknown) {
    super(err);
    this.raw = raw;
  }
}
