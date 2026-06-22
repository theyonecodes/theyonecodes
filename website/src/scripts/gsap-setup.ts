import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function createSectionAnimation(
  element: HTMLElement | string,
  options?: {
    from?: gsap.TweenVars
    to?: gsap.TweenVars
    trigger?: string | Element
    start?: string
    end?: string
    scrub?: boolean | number
    markers?: boolean
  }
) {
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (!el) return null

  return gsap.fromTo(
    el,
    {
      opacity: 0,
      y: 80,
      ...options?.from,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: options?.trigger || el,
        start: options?.start || 'top 85%',
        end: options?.end || 'top 35%',
        toggleActions: 'play none none reverse',
        ...(options?.scrub !== undefined ? { scrub: options.scrub } : {}),
        markers: options?.markers,
      },
      ...options?.to,
    }
  )
}

export function createParallaxEffect(
  element: HTMLElement | string,
  options?: {
    y?: number
    start?: string
    end?: string
    ease?: string
  }
) {
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (!el) return null

  return gsap.to(el, {
    y: options?.y ?? 150,
    ease: options?.ease || 'none',
    scrollTrigger: {
      trigger: el,
      start: options?.start || 'top bottom',
      end: options?.end || 'bottom top',
      scrub: true,
    },
  })
}

export function createMagneticEffect(element: HTMLElement) {
  const speed = 0.3

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(element, {
      x: x * speed,
      y: y * speed,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    })
  }

  element.addEventListener('mousemove', onMouseMove)
  element.addEventListener('mouseleave', onMouseLeave)

  return () => {
    element.removeEventListener('mousemove', onMouseMove)
    element.removeEventListener('mouseleave', onMouseLeave)
  }
}
