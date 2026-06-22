export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isCapableDevice(): boolean {
  return (
    navigator.deviceMemory >= 4 &&
    navigator.hardwareConcurrency >= 4 &&
    !prefersReducedMotion()
  )
}