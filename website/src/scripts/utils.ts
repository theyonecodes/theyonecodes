export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isCapableDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    (navigator.deviceMemory ?? 4) >= 4 &&
    (navigator.hardwareConcurrency ?? 4) >= 4 &&
    !prefersReducedMotion()
  )
}

export function initScrollReveal(): void {
  if (prefersReducedMotion()) return

  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  )

  elements.forEach((el) => observer.observe(el))
}
