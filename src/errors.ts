export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

type SetLike = { status?: number | string };

export function handleRouteError(
  error: unknown,
  set: SetLike,
): { error: string } {
  if (error instanceof HttpError) {
    set.status = error.status;
    return { error: error.message };
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled route error:', error);
  }

  // Jangan bocorkan detail internal (query/database) ke client.
  set.status = 500;
  return { error: 'Internal Server Error' };
}

export function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ER_DUP_ENTRY'
  );
}
