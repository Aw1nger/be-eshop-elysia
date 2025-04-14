// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly context?: { route?: string; details?: any },
  ) {
    super(message);
    this.name = "ApiError";
  }
}
