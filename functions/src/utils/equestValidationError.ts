// errors/RequestValidationError.ts
export class RequestValidationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}