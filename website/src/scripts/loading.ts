import gsap from 'gsap'

export function initLoadingScreen(container: HTMLElement) {
  const tl = gsap.timeline()

  tl.to(container, {
    opacity: 0,
    duration: 0.8,
    delay: 1.5,
    ease: 'power2.inOut',
    onComplete: () => {
      container.style.display = 'none'
      document.body.style.overflow = ''
    },
  })

  return tl
}
