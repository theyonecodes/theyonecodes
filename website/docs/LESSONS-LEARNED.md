# Implementation Lessons Learned

## Phase 1: Loading Screen

### What worked
- `clip-path: circle()` is perfect for iris wipe — GPU-accelerated, no layout thrashing
- Scramble text with `is:inline` script keeps it independent from Astro bundling (Sentry)
- Keeping the SVG ring draw gives visual feedback during the scramble phase

### Gotchas
- `is:inline` scripts cannot use ES module imports — must be vanilla JS
- Loading screen MUST use `clip-path` not `opacity` for the reveal — `opacity` fade doesn't create the cinematic iris effect
- The loading screen CSS must NOT have `transition` on clip-path initially — only add the transition class when the animation starts, otherwise the initial `clip-path: circle(150%)` snaps to the animation frame

### Performance
- Loading screen blocks scroll via `document.body.style.overflow = 'hidden'`
- Must restore scroll after iris wipe completes (in the setTimeout callback)

## Phase 2: Hero (In Progress)

### Architecture decisions
- SplitText from GSAP 3.15 is free — no npm install needed, just `import { SplitText } from 'gsap/SplitText'`
- `mask: "lines"` on SplitText wraps each line in overflow:hidden — cleanest reveal
- `autoSplit: true` + `onSplit()` handles responsive re-splitting on resize

### Color fill technique
- Start with `-webkit-text-stroke: 1px var(--color-text-2)` and `color: transparent`
- Animate a pseudo-element or clip-path to sweep fill from transparent → color
- Alternative: animate `color` from transparent → color on scrub (simpler)

### Pin vs scrub tradeoff
- Pin: section stays fixed while scroll drives animation — gives "hero stays, content reveals" feel
- Scrub without pin: section scrolls normally, animations tied to position — more natural scroll
- Decision: Use scrub WITHOUT pin for hero — keeps the natural scroll feel, avoids jarring pin/unpin

### Floating accent lines
- 3 diagonal lines with varying opacity (0.08-0.15) create depth
- Each has `will-change: transform` for GPU acceleration
- Parallax at 0.5x speed via scrub-linked translateY

## Cross-Cutting Lessons

### scrub vs toggleActions
- `scrub: true` = animation progress = scroll progress (reversible)
- `toggleActions: 'play none none none'` = fire once on enter (NOT reversible)
- For reversible animations: always use `scrub`
- For one-shot reveals (like section labels): can use `toggleActions`

### Section transitions
- Must be `position: absolute` pseudo-elements on the NEXT section
- clip-path polygon animations are GPU-accelerated
- Each transition needs `z-index: 5` to sit above content but below the grain overlay (z-9999)

### Reduced motion
- Must check `prefersReducedMotion()` BEFORE setting up any scrub animations
- Under reduced motion: skip ALL ScrollTrigger setup, just make everything visible
- The CSS `.gsap-reveal-ready` class approach works well — only hides elements when GSAP is active
