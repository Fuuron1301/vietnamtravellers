export function shouldBypassNextImageOptimization(src: string) {
  return /upload\.wikimedia\.org/i.test(src);
}
