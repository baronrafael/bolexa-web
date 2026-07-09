import { signal } from '@angular/core';

export function createAsyncPageState(initialLoading = true) {
  let requestId = 0;
  const loading = signal(initialLoading);
  const errorMessage = signal<string | null>(null);
  const notFound = signal(false);

  return {
    loading,
    errorMessage,
    notFound,
    start(showLoading = true): number {
      requestId += 1;
      errorMessage.set(null);
      notFound.set(false);

      if (showLoading) {
        loading.set(true);
      }

      return requestId;
    },
    isCurrent(id: number): boolean {
      return id === requestId;
    },
    setNotFound(id: number, value = true): void {
      if (id === requestId) {
        notFound.set(value);
      }
    },
    setError(id: number, message: string): void {
      if (id === requestId) {
        errorMessage.set(message);
      }
    },
    finish(id: number, showLoading = true): void {
      if (id === requestId && showLoading) {
        loading.set(false);
      }
    },
  };
}
