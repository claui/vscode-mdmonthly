export class DateFormattingError extends Error {
  constructor(
    message: string,
    public locales: string | string[] | undefined,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
