export class HttpError extends Error {
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: Record<string, string[]>) =>
  new HttpError(400, message, details);
export const unauthorized = (message = "Please sign in to continue.") =>
  new HttpError(401, message);
export const forbidden = (message = "You do not have access to this action.") =>
  new HttpError(403, message);
export const notFound = (message = "Not found.") => new HttpError(404, message);
export const tooManyRequests = (message = "Too many requests. Please try again later.") =>
  new HttpError(429, message);
