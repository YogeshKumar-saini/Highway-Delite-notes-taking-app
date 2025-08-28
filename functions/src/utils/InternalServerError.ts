// errors/InternalServerError.ts
export class InternalServerError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
