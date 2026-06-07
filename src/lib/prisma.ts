import { db } from "@/lib/db";

export { db };

/**
 * Detects transient connection issues that are safe to retry once.
 */
const isTransientPrismaConnectionError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Closed, cause: None|Can't reach database server|P1001|ECONNRESET|ETIMEDOUT/i.test(
    error.message,
  );
};

/**
 * Retries a read/query operation once when Prisma reports a transient
 * connection problem.
 */
export const withPrismaRetry = async <T>(
  operation: () => Promise<T>,
  retries = 1,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0 || !isTransientPrismaConnectionError(error)) {
      throw error;
    }

    try {
      await db.$disconnect();
    } catch {
      // Ignore disconnect cleanup errors and retry the operation once.
    }

    return withPrismaRetry(operation, retries - 1);
  }
};
