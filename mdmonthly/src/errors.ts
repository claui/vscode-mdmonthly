export class DateFormattingError extends Error {
  constructor(
    message: string,
    public locales: string | string[] | undefined,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export function matchesErrorMessage(pattern: string | RegExp, error: unknown) {
  return error instanceof Object && "message" in error
    && typeof error.message === "string" && error.message.match(pattern);
}
