// fetch() that gives up after a while instead of waiting forever.
// Rejects with an error whose name is "AbortError" on timeout.
export const fetchWithTimeout = (
  url,
  options = {},
  timeoutMs = 25000
) => {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timer));
};
