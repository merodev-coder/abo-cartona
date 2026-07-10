interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, retryableStatuses: number[]): boolean {
  if (!(error instanceof Error)) return false;

  // Check for HTTP status codes
  const status =
    (error as { status?: number; statusCode?: number }).status ||
    (error as { status?: number; statusCode?: number }).statusCode;
  if (status && retryableStatuses.includes(Number(status))) {
    return true;
  }

  // Check for network-related errors
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('abort') ||
    message.includes('failed to fetch') ||
    message.includes('connection') ||
    message.includes('econnrefused')
  );
}

/**
 * Execute a function with exponential backoff retry logic
 *
 * @example
 * const result = await withRetry(
 *   () => fetch('/api/order', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
 *   { maxRetries: 3, baseDelay: 2000 },
 *   'order-submission'
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: string = 'unknown'
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const shouldRetry = isRetryableError(lastError, finalConfig.retryableStatuses);

      if (!shouldRetry || attempt === finalConfig.maxRetries) {
        throw lastError;
      }

      // Calculate exponential backoff with jitter
      const baseDelay = finalConfig.baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;
      const delay = Math.min(baseDelay + jitter, finalConfig.maxDelay);

      console.info(
        `[${context}] Retry ${attempt + 1}/${finalConfig.maxRetries} after ${Math.round(delay)}ms:`,
        lastError.message
      );

      // Call retry callback if provided
      finalConfig.onRetry?.(attempt + 1, lastError);

      await sleep(delay);
    }
  }

  throw lastError || new Error('Unknown error in retry logic');
}

/**
 * Retry wrapper specifically for fetch requests
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<RetryConfig>
): Promise<Response> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Throw for error status codes to trigger retry
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as Error & { status: number }).status = response.status;
          throw error;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    retryConfig,
    `fetch-${url}`
  );
}

/**
 * Hook for tracking retry attempts in UI
 */
export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
}

export function createRetryTracker() {
  const state: RetryState = {
    attempt: 0,
    isRetrying: false,
    lastError: null,
  };

  const listeners = new Set<(state: RetryState) => void>();

  const notify = () => listeners.forEach((cb) => cb({ ...state }));

  return {
    state,
    subscribe: (callback: (state: RetryState) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    onRetry: (attempt: number, error: Error) => {
      state.attempt = attempt;
      state.isRetrying = true;
      state.lastError = error;
      notify();
    },
    onSuccess: () => {
      state.isRetrying = false;
      state.lastError = null;
      notify();
    },
    onError: (error: Error) => {
      state.isRetrying = false;
      state.lastError = error;
      notify();
    },
  };
}
