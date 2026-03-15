/**
 * Detects if the current browser uses WebKit (Safari, iOS browsers).
 * All browsers on iOS are required to use WebKit, including Chrome and Firefox.
 * WebKit has issues with streaming fetch/ReadableStream that require polling fallbacks.
 */
export function isWebKit(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;

  // Check for iOS (all browsers on iOS use WebKit)
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;

  // Check for Safari on macOS (but not Chrome/Firefox which also contain "Safari" in UA)
  const isSafari =
    /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua);

  return isIOS || isSafari;
}

/**
 * Detects if streaming fetch is likely to work reliably.
 * Returns false for WebKit-based browsers that have issues with ReadableStream.
 */
export function supportsStreamingFetch(): boolean {
  return !isWebKit();
}
