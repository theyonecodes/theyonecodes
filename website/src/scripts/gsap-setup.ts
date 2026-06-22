import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { prefersReducedMotion } from './utils'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function initSmoothScroll() {
  if (prefersReducedMotion()) return null

  const lenis = new Lenis({
    duration: 1.0,
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

export function createMagneticEffect(element: HTMLElement) {
  if (prefersReducedMotion()) return () => {}

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

// ── Typewriter effect for code decorations ──
function setupTypewriter(el: HTMLElement, trigger: Element | string) {
  const text = el.textContent || ''
  el.innerHTML = ''
  el.style.opacity = '1'

  for (const char of text) {
    const span = document.createElement('span')
    span.textContent = char
    span.style.opacity = '0'
    span.style.display = 'inline-block'
    el.appendChild(span)
  }

  const chars = el.querySelectorAll('span')
  gsap.to(chars, {
    opacity: 1,
    duration: 0.05,
    stagger: 0.025,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  })
}

// ── Scramble decode text effect ──
function setupScrambleDecode(
  el: HTMLElement,
  target: string,
  trigger: Element | string,
  options?: { start?: string; stagger?: number; duration?: number }
) {
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  el.innerHTML = ''

  const spans: HTMLSpanElement[] = []
  for (let i = 0; i < target.length; i++) {
    const span = document.createElement('span')
    span.textContent = target[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    span.style.display = 'inline-block'
    el.appendChild(span)
    spans.push(span)
  }

  const finalChars = target.split('')
  gsap.to(spans, {
    scrollTrigger: {
      trigger,
      start: options?.start || 'top 85%',
      toggleActions: 'play none none none',
    },
    duration: options?.duration || 0.6,
    stagger: options?.stagger || 0.02,
    ease: 'power2.out',
    onUpdate: function (this: gsap.core.Tween) {
      const progress = this.progress()
      spans.forEach((span, i) => {
        const charProgress = Math.max(0, Math.min(1, (progress * target.length - i * 0.5) / 1))
        if (charProgress >= 1) {
          span.textContent = finalChars[i]
        } else if (charProgress > 0) {
          span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
      })
    },
  })
}

// ── Counter animation ──
function animateCounter(
  el: HTMLElement,
  target: number,
  trigger: Element | string,
  options?: { prefix?: string; suffix?: string; pad?: number }
) {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    onUpdate: () => {
      const v = Math.round(obj.val)
      const padded = options?.pad ? String(v).padStart(options.pad, '0') : String(v)
      el.textContent = (options?.prefix || '') + padded + (options?.suffix || '')
    },
  })
}

export function initGSAPAnimations() {
  if (prefersReducedMotion()) {
    document.body.classList.remove('gsap-reveal-ready')
    return
  }

  document.body.classList.add('gsap-reveal-ready')

  initSmoothScroll()

  // ══════════════════════════════════════════════════
  // HERO ANIMATIONS (scrub-linked, reversible)
  // ══════════════════════════════════════════════════

  // Wait for fonts to load before splitting text
  document.fonts.ready.then(() => {
    initHeroAnimations()
    initManifestoAnimations()
    initFocusAnimations()
    initProjectsAnimations()
    initTechStackAnimations()
    initContactAnimations()
    initSectionTransitions()
    initScrollReveals()
    initInteractiveEffects()
  })
}

// ── Hero ──
function initHeroAnimations() {
  const heroTitle = document.getElementById('hero-title')
  if (!heroTitle) return

  const heroLines = heroTitle.querySelectorAll<HTMLElement>('[data-split]')
  if (heroLines.length === 0) return

  // SplitText for line-mask reveals
  const splits: ReturnType<typeof SplitText.create>[] = []

  heroLines.forEach((line, i) => {
    const split = SplitText.create(line, {
      type: 'lines',
      mask: 'lines',
    })
    splits.push(split)

    // "Building" — standard line mask reveal (slide up)
    if (i === 0) {
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
        },
      })
    }

    // "autonomous" — color fill reveal
    if (i === 1) {
      // Start: outline only (text-stroke visible, fill transparent)
      // Animate: fill sweeps left-to-right via clip-path
      gsap.fromTo(line,
        {
          WebkitTextStroke: '1px var(--color-text-2)',
          color: 'transparent',
        },
        {
          WebkitTextStroke: '0px transparent',
          color: 'var(--color-text-2)',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top 70%',
            end: 'top 20%',
            scrub: 1.5,
          },
        }
      )

      // Also do line mask reveal
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top 70%',
          end: 'top 25%',
          scrub: 1.5,
        },
      })
    }

    // "systems." — scale + blur emerge
    if (i === 2) {
      gsap.fromTo(line,
        {
          scale: 1.3,
          filter: 'blur(10px)',
          opacity: 0,
        },
        {
          scale: 1,
          filter: 'blur(0px)',
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top 60%',
            end: 'top 15%',
            scrub: 1.5,
          },
        }
      )

      // Accent dot bounce
      const dot = line.querySelector('.hero-accent-dot')
      if (dot) {
        gsap.fromTo(dot,
          { scale: 0 },
          {
            scale: 1,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: '#hero',
              start: 'top 50%',
              end: 'top 10%',
              scrub: 1.5,
            },
          }
        )
      }
    }
  })

  // Tagline word-by-word reveal
  const tagline = document.querySelector<HTMLElement>('[data-word-reveal]')
  if (tagline) {
    const text = tagline.textContent || ''
    const words = text.split(' ')
    tagline.innerHTML = words
      .map((w) => `<span class="inline-block" style="opacity:0;filter:blur(4px)">${w}</span>`)
      .join(' ')

    const wordEls = tagline.querySelectorAll('span')
    gsap.to(wordEls, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      stagger: 0.04,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 50%',
        end: 'top 10%',
        scrub: 1.5,
      },
    })
  }

  // CTAs slide up
  const heroCtas = document.querySelector('.hero-ctas')
  if (heroCtas) {
    gsap.fromTo(heroCtas,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top 40%',
          end: 'top 5%',
          scrub: 1.5,
        },
      }
    )
  }

  // Floating accent lines parallax
  const accentLines = document.querySelectorAll<HTMLElement>('.hero-accent-line')
  accentLines.forEach((line, i) => {
    gsap.to(line, {
      y: -100 - i * 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })
  })

  // Hero gradient parallax
  const heroGradient = document.getElementById('hero-gradient')
  if (heroGradient) {
    gsap.to(heroGradient, {
      y: 200,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }

  // Scroll indicator fade
  const scrollIndicator = document.querySelector('.hero-scroll-indicator')
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 0,
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '20% top',
        scrub: true,
      },
    })
  }
}

// ── Manifesto ──
function initManifestoAnimations() {
  const section = document.getElementById('philosophy')
  if (!section) return

  // Label scramble decode
  const label = section.querySelector<HTMLElement>('.section-label')
  if (label) {
    const target = label.textContent || 'Philosophy'
    setupScrambleDecode(label, target, section, { start: 'top 85%', stagger: 0.03 })
  }

  // Title line mask reveal
  const title = section.querySelector<HTMLElement>('.section-title')
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1.5,
      },
    })
  }

  // Cards — multi-direction reveals
  const cards = section.querySelectorAll<HTMLElement>('.card')
  const directions = [
    { x: -80, y: 0, scale: 1 },    // Card 1: from left
    { x: 80, y: 0, scale: 1 },     // Card 2: from right
    { x: 0, y: 80, scale: 1 },     // Card 3: from bottom
    { x: 0, y: 0, scale: 0.85 },   // Card 4: from scale
  ]

  cards.forEach((card, i) => {
    const dir = directions[i % directions.length]

    gsap.fromTo(card,
      { x: dir.x, y: dir.y, scale: dir.scale, opacity: 0 },
      {
        x: 0, y: 0, scale: 1, opacity: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          end: 'top 50%',
          scrub: 1.5,
        },
      }
    )

    // Background number counter
    const numEl = card.querySelector<HTMLElement>('.manifesto-num')
    if (numEl) {
      const targetNum = parseInt(numEl.textContent || '01')
      animateCounter(numEl, targetNum, card, { pad: 2 })
    }

    // Inner content: title line mask
    const cardTitle = card.querySelector<HTMLElement>('h3')
    if (cardTitle) {
      const split = SplitText.create(cardTitle, { type: 'lines', mask: 'lines' })
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 55%',
          scrub: 1.5,
        },
      })
    }

    // Inner content: description word stagger
    const desc = card.querySelector<HTMLElement>('p')
    if (desc) {
      const text = desc.textContent || ''
      const words = text.split(' ')
      desc.innerHTML = words.map((w) => `<span class="inline-block">${w}</span>`).join(' ')
      const wordEls = desc.querySelectorAll('span')
      gsap.from(wordEls, {
        opacity: 0,
        y: 10,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 82%',
          end: 'top 50%',
          scrub: 1.5,
        },
      })
    }
  })
}

// ── Focus ──
function initFocusAnimations() {
  const section = document.getElementById('focus')
  if (!section) return

  // Label scramble
  const label = section.querySelector<HTMLElement>('.section-label')
  if (label) {
    const target = label.textContent || 'Focus Areas'
    setupScrambleDecode(label, target, section, { start: 'top 85%', stagger: 0.03 })
  }

  // Title line mask
  const title = section.querySelector<HTMLElement>('.section-title')
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1.5,
      },
    })
  }

  // Cards — alternating direction reveals
  const cards = section.querySelectorAll<HTMLElement>('.card')
  const reveals = [
    { x: -100, y: 0, scale: 1 },   // Card 1: from left
    { x: 100, y: 0, scale: 1 },    // Card 2: from right
    { x: 0, y: 0, scale: 0.9 },    // Card 3: scale up
  ]

  cards.forEach((card, i) => {
    const dir = reveals[i % reveals.length]

    gsap.fromTo(card,
      { x: dir.x, y: dir.y, scale: dir.scale, opacity: 0 },
      {
        x: 0, y: 0, scale: 1, opacity: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          end: 'top 50%',
          scrub: 1.5,
        },
      }
    )

    // Typewriter code decoration
    const codeDeco = card.querySelector<HTMLElement>('.code-deco span:last-child')
    if (codeDeco) {
      setupTypewriter(codeDeco, card)
    }

    // Tags cascade
    const tags = card.querySelectorAll<HTMLElement>('.tag')
    gsap.fromTo(tags,
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 82%',
          end: 'top 45%',
          scrub: 1.5,
        },
      }
    )
  })
}

// ── Projects (horizontal scroll gallery) ──
function initProjectsAnimations() {
  const section = document.getElementById('projects')
  if (!section) return

  // Label scramble
  const label = section.querySelector<HTMLElement>('.section-label')
  if (label) {
    const target = label.textContent || 'Projects'
    setupScrambleDecode(label, target, section, { start: 'top 85%', stagger: 0.03 })
  }

  // Title line mask
  const title = section.querySelector<HTMLElement>('.section-title')
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1.5,
      },
    })
  }

  // Featured project cards — staggered clip-path reveal
  const featureCards = section.querySelectorAll<HTMLElement>('.feature-card')
  featureCards.forEach((card, i) => {
    gsap.fromTo(card,
      { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0% 0 0 0)',
        opacity: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          end: 'top 50%',
          scrub: 1.5,
        },
        delay: i * 0.1,
      }
    )

    // Inner content stagger
    const h3 = card.querySelector<HTMLElement>('h3')
    if (h3) {
      const split = SplitText.create(h3, { type: 'lines', mask: 'lines' })
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 55%',
          scrub: 1.5,
        },
      })
    }
  })

  // Dynamic repos section
  const reposLabel = section.querySelector<HTMLElement>('.all-repos-label')
  if (reposLabel) {
    setupScrambleDecode(reposLabel, 'All Repos', section, { start: 'top 85%', stagger: 0.03 })
  }

  const reposTitle = section.querySelector<HTMLElement>('.all-repos-title')
  if (reposTitle) {
    const split = SplitText.create(reposTitle, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: reposTitle,
        start: 'top 85%',
        end: 'top 45%',
        scrub: 1.5,
      },
    })
  }
}

// ── Tech Stack ──
function initTechStackAnimations() {
  const section = document.getElementById('stack')
  if (!section) return

  // Label scramble
  const label = section.querySelector<HTMLElement>('.section-label')
  if (label) {
    const target = label.textContent || 'Tech Stack'
    setupScrambleDecode(label, target, section, { start: 'top 85%', stagger: 0.03 })
  }

  // Title line mask
  const title = section.querySelector<HTMLElement>('.section-title')
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1.5,
      },
    })
  }

  // Tech cards — center-expand clip-path
  const cards = section.querySelectorAll<HTMLElement>('.card')
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          end: 'top 55%',
          scrub: 1.5,
        },
        delay: i * 0.05,
      }
    )

    // Terminal label scramble
    const termLabel = card.querySelector<HTMLElement>('.text-mono')
    if (termLabel) {
      const target = termLabel.textContent?.trim() || ''
      if (target.startsWith('>')) {
        setupScrambleDecode(termLabel, target, card, { start: 'top 85%', stagger: 0.015, duration: 0.4 })
      }
    }
  })

  // Skill bars — scrub-linked fill with counter
  const bars = section.querySelectorAll<HTMLElement>('[data-width]')
  bars.forEach((bar) => {
    const widthVal = bar.getAttribute('data-width') || '50%'
    const numMatch = widthVal.match(/(\d+)/)
    const targetNum = numMatch ? parseInt(numMatch[1]) : 50

    gsap.to(bar, {
      width: widthVal,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 90%',
        end: 'top 50%',
        scrub: 1.5,
      },
    })

    // Percentage counter
    const card = bar.closest('.card')
    if (card) {
      const nameEl = card.querySelector<HTMLElement>('.font-800')
      if (nameEl) {
        const counterEl = document.createElement('span')
        counterEl.className = 'text-mono text-[var(--color-accent)] text-[9px] block mb-1'
        counterEl.textContent = '0%'
        nameEl.parentElement?.insertBefore(counterEl, nameEl)

        const obj = { val: 0 }
        gsap.to(obj, {
          val: targetNum,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: bar,
            start: 'top 90%',
            end: 'top 50%',
            scrub: 1.5,
          },
          onUpdate: () => {
            counterEl.textContent = Math.round(obj.val) + '%'
          },
        })
      }
    }
  })
}

// ── Contact ──
function initContactAnimations() {
  const section = document.getElementById('contact')
  if (!section) return

  // Label scramble
  const label = section.querySelector<HTMLElement>('.section-label')
  if (label) {
    const target = label.textContent || 'Contact'
    setupScrambleDecode(label, target, section, { start: 'top 85%', stagger: 0.03 })
  }

  // "Let's" line mask
  const lets = section.querySelector<HTMLElement>('h2 span:first-child')
  if (lets) {
    const split = SplitText.create(lets, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      filter: 'blur(4px)',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'top 35%',
        scrub: 1.5,
      },
    })
  }

  // "build." line mask with accent dot bounce
  const build = section.querySelector<HTMLElement>('h2 span:last-child')
  if (build) {
    const split = SplitText.create(build, { type: 'lines', mask: 'lines' })
    gsap.from(split.lines, {
      yPercent: 110,
      filter: 'blur(4px)',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 1.5,
      },
    })
  }

  // Supporting text word stagger
  const desc = section.querySelector<HTMLElement>('p')
  if (desc) {
    const text = desc.textContent || ''
    const words = text.split(' ')
    desc.innerHTML = words.map((w) => `<span class="inline-block">${w}</span>`).join(' ')
    const wordEls = desc.querySelectorAll('span')
    gsap.from(wordEls, {
      opacity: 0,
      y: 15,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        end: 'top 30%',
        scrub: 1.5,
      },
    })
  }

  // CTA button slide up + border draw
  const cta = section.querySelector<HTMLElement>('.btn')
  if (cta) {
    gsap.fromTo(cta,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'top 25%',
          scrub: 1.5,
        },
      }
    )
  }
}

// ── Section Transitions ──
function initSectionTransitions() {
  // Hero → Manifesto: diagonal wipe (animate section clip-path)
  const philosophy = document.getElementById('philosophy')
  if (philosophy) {
    gsap.fromTo(philosophy,
      { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        ease: 'none',
        scrollTrigger: {
          trigger: philosophy,
          start: 'top bottom',
          end: 'top 50%',
          scrub: 1.5,
        },
      }
    )
  }

  // Focus → Projects: vertical blinds
  const projects = document.getElementById('projects')
  if (projects) {
    const blindsContainer = document.createElement('div')
    blindsContainer.className = 'transition-blinds'
    for (let i = 0; i < 12; i++) {
      const blind = document.createElement('div')
      blind.className = 'blind-strip'
      blind.style.width = (100 / 12) + '%'
      blindsContainer.appendChild(blind)
    }
    projects.prepend(blindsContainer)

    const strips = blindsContainer.querySelectorAll<HTMLElement>('.blind-strip')
    gsap.fromTo(strips,
      { scaleY: 1 },
      {
        scaleY: 0,
        transformOrigin: 'top',
        stagger: 0.02,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: projects,
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
        },
      }
    )
  }

  // Tech → Contact: accent flash
  const contact = document.getElementById('contact')
  if (contact) {
    const flashLine = document.createElement('div')
    flashLine.className = 'transition-flash-line'
    contact.prepend(flashLine)

    gsap.fromTo(flashLine,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: contact,
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
        },
      }
    )
  }
}

// ── Generic Scroll Reveals ──
function initScrollReveals() {
  // All remaining .gsap-reveal elements that aren't handled by specific sections
  const reveals = document.querySelectorAll<HTMLElement>('.gsap-reveal:not([data-handled])')
  reveals.forEach((el) => {
    // Skip if already inside a section that has its own animations
    if (el.closest('#hero, #philosophy, #focus, #projects, #stack, #contact')) return

    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'top 60%',
          scrub: 1.5,
        },
      }
    )
  })
}

// ── Interactive Effects (non-scrub, mouse-driven) ──
function initInteractiveEffects() {
  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach((el) => {
    createMagneticEffect(el as HTMLElement)
  })

  // 3D tilt on feature cards
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const card = el as HTMLElement
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      gsap.to(card, {
        rotateY: x * 8,
        rotateX: -y * 8,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
      })
    })

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      })
    })
  })
}
