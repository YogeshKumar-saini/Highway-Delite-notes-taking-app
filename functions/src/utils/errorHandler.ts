export class ErrorHandler extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;

    // Preserve the original stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
