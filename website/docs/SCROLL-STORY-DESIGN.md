# Scroll Story Design Document

## TheyOne Codes Portfolio — Advanced Scroll Animation System

---

## Overview

This document defines the complete scroll-based storytelling system for the TheyOne Codes portfolio. Every scroll pixel controls an animation frame — like scrubbing through a video timeline. Scrolling down plays forward, scrolling up plays in reverse.

**Core principle:** All major animations use `scrub: true` on GSAP ScrollTrigger, which ties animation progress directly to scroll position. This creates a fully reversible, user-controlled cinematic experience.

**Tech stack:**
- GSAP 3.15 (includes SplitText, ScrollTrigger, MotionPathPlugin — all free)
- Lenis smooth scroll (synced to GSAP ticker)
- Three.js / WebGL (hero background, lazy-loaded)
- Astro static site (GitHub Pages deployment)

---

## The Story Arc

The site reads like a 5-act film. Each section is a "scene" with its own mood, pacing, and visual language. Section transitions are "cuts" between scenes.

```
ACT I: THE VOID → THE DECLARATION     (Hero)
  ↓ clip-path diagonal wipe transition
ACT II: THE PRINCIPLES                (Manifesto)
  ↓ horizontal line sweep transition
ACT III: THE CRAFT                    (Focus + Featured Projects)
  ↓ vertical blinds transition
ACT IV: THE ARSENAL                   (Tech Stack)
  ↓ scale-explode transition
ACT V: THE INVITATION                 (Contact + Footer)
```

---

## Loading Screen → Hero (The Void)

### Current
Ring draws, text cycles ("Initializing" → "Loading" → "Almost Ready"), fades to black.

### New: Terminal Boot with Iris Wipe

```
Phase 1 (0-0.8s):   Ring draws (keep existing)
Phase 2 (0.8-1.5s): Text scrambles through random glyphs → resolves to "Initializing system..."
Phase 3 (1.5-2.0s): Text changes to "Loading modules..."
Phase 4 (2.0-2.5s): Loading screen does a CENTER-CROP clip-path animation
                     (circle shrinks from full-screen to a point, revealing hero underneath)
Phase 5 (2.5s+):    Hero elements begin their reveal sequence
```

**Key technique:** The loading screen doesn't fade — it clips away via `clip-path: circle(0% at 50% 50%)`. This is an iris wipe (like classic film editing). The hero content is rendered underneath but hidden by the loading overlay.

**Implementation:**
- Loading screen div gets `clip-path` animated via GSAP
- Circle starts at `clip-path: circle(150% at 50% 50%)` (covers everything)
- Animates to `clip-path: circle(0% at 50% 50%)` (disappears, revealing hero)
- Duration: 0.8s, ease: `power3.inOut`

**Scramble text effect:**
- Text content is replaced character-by-character with random glyphs
- Resolves one character at a time from left to right
- Character set: `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*`
- Uses GSAP stagger on individual character spans

**Reverse behavior:** N/A (loading screen is one-shot, never re-appears).

---

## Hero (The Declaration)

### Current
Characters translate Y from 110% to 0. Word-by-word blur reveal on tagline.

### New: Multi-Layer Parallax Reveal with Line Masks

#### Layer structure (back to front):
```
Layer 0 (z-0):   WebGL reactive mesh (existing, keep)
Layer 1 (z-1):   Hero gradient — parallax at 0.3x scroll speed
Layer 2 (z-2):   Floating accent lines — 3 diagonal lines, parallax at 0.5x
Layer 3 (z-3):   Main typography
Layer 4 (z-4):   Tagline + CTAs
```

#### Typography animation (replaces current char split):
Uses GSAP SplitText (free in 3.15) instead of manual character splitting.

```
1. Section pins when hero enters viewport (scrub: true)

2. "Building" — LINE MASK REVEAL
   - SplitText splits into lines
   - Each line wrapped in overflow:hidden container
   - Text slides up through mask (yPercent: 110 → 0)
   - Stagger: 0.15s per line (3 lines total)
   - Duration: 1.5s per line

3. "autonomous" — COLOR FILL REVEAL
   - Text starts as outline-only (text-stroke visible, fill transparent)
   - As you scroll, fill color animates from transparent → color
   - Uses clip-path: inset() that sweeps left-to-right
   - Creates a "liquid fill" effect

4. "systems." — SCALE + BLUR EMERGE
   - Starts at scale(1.3) with filter: blur(10px)
   - Scrolls to scale(1) blur(0)
   - Accent dot fades in last with elastic bounce

5. Tagline — WORD STAGGER with individual Y offsets
   - SplitText splits into words
   - Each word starts at y: 30, opacity: 0
   - Stagger: 0.04s per word
   - Ease: power3.out

6. CTAs — SLIDE UP with stagger
   - Both buttons start at y: 40, opacity: 0
   - Stagger: 0.1s
```

#### Floating accent lines:
```
3 diagonal lines (1px wide, accent color, varying opacity 0.1-0.3)
- Start off-screen (translateY: 100px)
- Scroll-linked parallax moves them at 0.5x speed
- Creates depth illusion behind the typography
```

**Pin duration:** Hero section pins for 1.5x viewport height of scroll distance, then unpins.

**Reverse:** Scrolling back up reverses all animations — text de-reveals, CTAs slide back down, the hero comes back into full view.

---

## Section Transitions (Between Every Section)

### Transition 1: Hero → Manifesto (Diagonal Wipe)

```
As hero scrolls out:
1. A pseudo-element on the manifesto section animates clip-path
2. Starts as: polygon(0 0, 0 0, 0 100%, 0 100%)  (invisible)
3. Scrubs to:   polygon(0 0, 100% 0, 100% 100%, 0 100%)  (fully visible)
4. The wipe moves left-to-right as you scroll
5. Behind the wipe, the manifesto content is already positioned

Duration: Synchronized to ~300px of scroll
```

### Transition 2: Manifesto → Focus (Horizontal Line Sweep)

```
A horizontal accent line (1px, full-width) sweeps from left to right.
clip-path: inset(0 100% 0 0) → inset(0 0 0 0)
```

### Transition 3: Focus → Projects (Vertical Blinds)

```
12 vertical strips that open left-to-right like venetian blinds.
Each strip animates scaleY(1) → scaleY(0) with stagger 0.02s.
Duration: ~400px of scroll
```

### Transition 4: Projects → Tech Stack (Scale Explode)

```
The last project card "explodes" outward:
- Scale: 1 → 1.5 with opacity: 1 → 0
- Brief flash of accent color at low opacity
Duration: ~200px of scroll
```

### Transition 5: Tech Stack → Contact (Accent Flash)

```
A full-width accent line expands from center:
1. scaleX(0) → scaleX(1) at 1px height
2. Then scaleY fills screen with accent at 5% opacity
3. Fades to reveal contact section
```

**All transitions use `scrub: true` and reverse when scrolling up.**

---

## Manifesto (The Principles)

### Current
4 cards in a 2x2 grid, each with watermark numbers, hover effects.

### New: Staggered Parallax Cards with Counter Animation

#### Section header:
```
"Philosophy" label — SCRAMBLE DECODE
  - Characters start as random glyphs
  - Resolve one by one to "PHILOSOPHY"
  - Duration: 0.8s, stagger: 0.03s
  - Triggers at top 85% of viewport

"The Principles" — LINE MASK REVEAL
  - SplitText splits into lines
  - Each line slides up through overflow:hidden mask
  - Scrub: true (reversible)
```

#### Cards (2x2 grid):
```
Each card has THREE animation layers:

1. Card container:
   - Enters from a DIFFERENT direction per card:
     Card 1: from left (x: -80)
     Card 2: from right (x: 80)
     Card 3: from bottom (y: 80)
     Card 4: from scale (scale: 0.85)
   - All with opacity: 0 → 1
   - Stagger: 0.12s between cards
   - Scrub: true

2. Background number (01-04):
   - Counter animation: number counts up from 00 → target
   - Color shifts from text-3 → accent as card enters
   - Parallax: moves at 0.7x scroll speed (floats behind card)

3. Card inner content:
   - Title: line-mask reveal (slides up through mask)
   - Description: word-by-word fade (stagger 0.03s)
   - Divider line: scaleX(0) → scaleX(1) from left
```

**Hover enhancement (non-scrub, mouse-driven):**
```
- Card lifts translateY(-6px)
- Background number scales to 1.1, more opaque
- Accent glow appears at bottom edge
- Border transitions to accent color
```

---

## Focus (What I Build)

### Current
3 stacked cards with terminal-style decorations.

### New: Alternating Direction Reveals with Typewriter Code Decorations

#### Cards:
```
Card 1 (System Optimization):
  - Entire card slides in from LEFT (x: -100)
  - Code decoration typewriter: "> build --system-optimization"
    types character by character
  - Tags cascade in from bottom with stagger

Card 2 (Security Auditing):
  - Entire card slides in from RIGHT (x: 100)
  - Code decoration types: "> build --security-auditing"
  - Tags cascade

Card 3 (Developer Productivity):
  - Entire card scales up from 0.9 (scale: 0.9 → 1)
  - Code decoration types: "> build --developer-productivity"
  - Tags cascade

All with scrub: true (reversible)
```

#### Depth effect (inner parallax):
```
Each card has subtle inner parallax:
- The number/period on the left moves at 0.8x speed
- The main content moves at 1x speed
- The arrow on the right moves at 1.2x speed
Creates a parallax depth illusion within each card.
```

#### Code decoration (typewriter):
```
Custom typewriter function:
1. Split text into individual character spans
2. Initially all hidden (opacity: 0)
3. GSAP stagger reveals characters: opacity 0 → 1
4. Duration per char: 0.05s
5. Triggers when card enters viewport
6. On reverse: characters delete in reverse order
```

---

## Projects (Featured Work) — HORIZONTAL SCROLL GALLERY

### Current
3 cards in a vertical grid with 3D tilt on hover.

### New: Pinned Horizontal Scroll Gallery

This is the BIG setpiece. The projects section transforms into a pinned horizontal scroll experience.

#### Structure:
```html
<div class="projects-horizon">
  <div class="horizon-track">
    <div class="horizon-panel">[Project 1: Windows-Super-Smooth]</div>
    <div class="horizon-panel">[Project 2: CISO-Auditor]</div>
    <div class="horizon-panel">[Project 3: universal-browser-backup]</div>
  </div>
  <div class="horizon-progress">
    <div class="progress-fill"></div>
  </div>
</div>
```

#### GSAP horizontal scroll:
```js
const track = document.querySelector('.horizon-track')
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.projects-horizon',
    pin: true,
    scrub: 1,
    end: () => '+=' + track.scrollWidth,
  }
})
```

#### Each project panel (full viewport):
```
Left side (60%): Project info
  - Project name: LARGE typography, line-mask reveal
  - Pitch line: typewriter decode effect
  - PROBLEM / APPROACH / RESULT: staggered word reveals
  - Tags: cascade from bottom

Right side (40%): Abstract SVG representation
  - Windows-Super-Smooth: Performance meter SVG with animated needle
  - CISO-Auditor: Shield SVG with animated check marks
  - Browser Backup: Browser window SVG with data flowing into box
```

#### Panel transitions:
```
- Panel 1 enters from right (x: 100% → 0%)
- Panel 2 enters as panel 1 exits left
- Panel 3 enters as panel 2 exits left
- Progress bar fills proportionally (0% → 33% → 66% → 100%)
```

#### Progress indicator:
```
Fixed at bottom of pinned section
- Thin line (2px height) with accent color fill
- Width: 0% → 100% as you scroll through panels
- Small dot at fill tip with glow effect
```

**After horizontal section:** "All Repos" header and dynamic GitHub grid remain in normal vertical flow.

---

## Tech Stack (The Arsenal)

### Current
Flat grid of 10 cards with skill bars.

### New: Dashboard-Style Reveal with Center-Expand Clip

#### Layout (enhanced):
```
Row 1 (3 large cards):  Python | Rust | TypeScript    (core trio)
Row 2 (3 medium cards): Bash | Linux | Go
Row 3 (4 small cards):  Git | Docker | WebGL | Astro
```

#### Each tech card:
```
1. Card appears via clip-path center-expand:
   inset(50% 50% 50% 50%) → inset(0 0 0 0)
   (expands from center, like a diamond opening)

2. Inside the card:
   - Terminal label ("> python") types in with scramble decode
   - Tech name scales from 0.8 → 1 with opacity
   - Skill bar fills (scrub-linked)
   - Subtle glow pulse on accent bar when fully filled

3. Stagger: Each card opens 0.08s after previous
   (Reading order: left-to-right, top-to-bottom)
```

#### Skill bars (enhanced):
```
1. Bar has gradient fill (accent → accent-alt)
2. Fill is scrub-linked (scroll controls percentage)
3. At fill tip, a small glowing dot pulses
4. Percentage number counts up as bar fills (0% → 95%)
```

#### Grid background:
```
Existing .grid-bg lines now have subtle animation:
- Grid lines fade in with stagger as you enter section
- Creates a "blueprint emerging" effect
```

---

## Contact (The Invitation)

### Current
"Let's build." massive text, GitHub CTA.

### New: Cinematic Final Reveal

#### "Let's build." animation:
```
LINE MASK REVEAL:
- "Let's" slides up through mask from yPercent: 110
- 0.15s delay
- "build." slides up through mask from yPercent: 110
- Accent dot on "build." does scale bounce: 0 → 1.5 → 1 (elastic ease)
- All scrub-linked

Text starts slightly blurred (filter: blur(4px))
and unblurs as it reveals (scrub-linked).
```

#### Supporting text:
```
"All my work is public..." — word-by-word stagger, fade up
```

#### CTA button:
```
Slides up from y: 30 with accent border animation:
- Border draws itself using clip-path on pseudo-element
- Button text does subtle scramble decode on entry
```

---

## Technical Implementation

### GSAP SplitText (replaces manual splitting)

```js
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(SplitText, ScrollTrigger)
```

**What SplitText provides:**
- `SplitText.create(element, { type: 'chars,words,lines' })` — splits text into addressable spans
- `mask: "lines"` — wraps lines in overflow:hidden containers for clean reveals
- `autoSplit: true` — re-splits on resize for responsive text
- `onSplit()` — callback for creating animations after split
- Built-in accessibility: `aria-label` on parent, `aria-hidden` on split spans
- `revert()` — restores original HTML

### Scrub Configuration

Every major animation uses `scrub: true`:
```js
scrollTrigger: {
  trigger: el,
  start: 'top 80%',
  end: 'bottom 20%',
  scrub: 1.5,  // 1.5s smoothing for butter feel
}
```

- `scrub: true` = exact sync with scroll
- `scrub: 1.5` = 1.5s smoothing for butter feel
- Forward scroll = animation plays forward
- Reverse scroll = animation reverses

### Section Transitions via Clip-Path

Each transition is a pseudo-element on the NEXT section that animates `clip-path` via scrub:

```css
.section-transition::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-bg);
  z-index: 5;
  pointer-events: none;
}
```

GSAP scrubs the clip-path property from hidden to revealed.

### Horizontal Scroll for Projects

```js
const track = document.querySelector('.horizon-track')
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.projects-horizon',
    pin: true,
    scrub: 1,
    end: () => '+=' + track.scrollWidth,
  }
})
```

### Performance Guardrails

| Rule | Implementation |
|------|---------------|
| GPU-accelerated only | Use transform, opacity, filter — no layout triggers |
| will-change | Set on all animated elements |
| prefers-reduced-motion | All scrub animations become instant reveals |
| Lazy-load WebGL | Behind hero, gated by `isCapableDevice()` |
| SplitText autoSplit | Handles responsive text reflow |
| Particle cap | Max 150 particles |
| Lenis duration | Reduced to 1.0s from 1.2s (snappier) |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* All GSAP scrub animations skip */
  .gsap-reveal-ready .gsap-reveal,
  .gsap-reveal-ready .gsap-reveal-left,
  .gsap-reveal-ready .gsap-reveal-scale {
    opacity: 1;
    transform: none;
  }

  /* Section transitions become instant */
  .section-transition::before {
    display: none;
  }

  /* Horizontal scroll becomes vertical */
  .projects-horizon {
    overflow: visible;
  }
  .horizon-track {
    transform: none !important;
  }
}
```

---

## Reverse Animation Behavior

Every scrub-based animation naturally reverses when scrolling up:

| Section | Forward (scroll down) | Reverse (scroll up) |
|---------|----------------------|---------------------|
| Loading screen | Iris wipe reveals hero | N/A (one-shot) |
| Hero text | Characters slide up into view | Characters slide back down, disappear |
| Section wipes | Clip reveals next section | Clip hides section, reveals previous |
| Cards | Enter from different directions | Exit back to their origin |
| Typewriter text | Types forward | Deletes in reverse |
| Tech bars | Fill left-to-right | Drain right-to-left, numbers count down |
| Horizontal gallery | Panels slide left | Panels slide right, back to first |
| "Let's build." | Text reveals upward | Text de-reveals downward |
| Accent border | Draws left-to-right | Undraws right-to-left |

---

## Animation Inventory

| # | Animation | Section | Trigger | Technique | Scrub? | Reversible? |
|---|-----------|---------|---------|-----------|--------|-------------|
| 1 | Loading ring draw | Loading | On load (50ms) | stroke-dashoffset | No | No (one-shot) |
| 2 | Loading text scramble | Loading | On load | Random glyphs → resolve | No | No (one-shot) |
| 3 | Loading iris wipe | Loading→Hero | On load (2s) | clip-path circle | No | No (one-shot) |
| 4 | Hero WebGL shader | Hero | Continuous | requestAnimationFrame | No | N/A |
| 5 | Hero line mask reveal | Hero | Scroll | SplitText + yPercent | Yes | Yes |
| 6 | Hero color fill | Hero | Scroll | clip-path inset | Yes | Yes |
| 7 | Hero scale+blur emerge | Hero | Scroll | scale + filter | Yes | Yes |
| 8 | Hero tagline word stagger | Hero | Scroll | SplitText + opacity | Yes | Yes |
| 9 | Hero CTA slide up | Hero | Scroll | y + opacity | Yes | Yes |
| 10 | Hero floating lines | Hero | Scroll | Parallax (0.5x) | Yes | Yes |
| 11 | Diagonal wipe transition | Hero→Manifesto | Scroll | clip-path polygon | Yes | Yes |
| 12 | Manifesto label scramble | Manifesto | Scroll | Random glyphs → resolve | Yes | Yes |
| 13 | Manifesto title line mask | Manifesto | Scroll | SplitText + yPercent | Yes | Yes |
| 14 | Manifesto card reveals | Manifesto | Scroll | Multi-direction + opacity | Yes | Yes |
| 15 | Manifesto number counter | Manifesto | Scroll | Counter animation | Yes | Yes |
| 16 | Manifesto card content | Manifesto | Scroll | SplitText word stagger | Yes | Yes |
| 17 | Line sweep transition | Manifesto→Focus | Scroll | clip-path inset | Yes | Yes |
| 18 | Focus card reveals | Focus | Scroll | Alternating x/scale | Yes | Yes |
| 19 | Focus typewriter text | Focus | Scroll | Char stagger | Yes | Yes |
| 20 | Focus tag cascade | Focus | Scroll | y + opacity stagger | Yes | Yes |
| 21 | Focus inner parallax | Focus | Scroll | Multi-speed transforms | Yes | Yes |
| 22 | Vertical blinds transition | Focus→Projects | Scroll | scaleY strips | Yes | Yes |
| 23 | Projects horizontal scroll | Projects | Scroll | x translate + pin | Yes | Yes |
| 24 | Project panel content | Projects | Scroll | SplitText + stagger | Yes | Yes |
| 25 | Project SVG animations | Projects | Scroll | SVG attribute anim | Yes | Yes |
| 26 | Projects progress bar | Projects | Scroll | width fill | Yes | Yes |
| 27 | Scale explode transition | Projects→Tech | Scroll | scale + opacity | Yes | Yes |
| 28 | Tech card center-expand | TechStack | Scroll | clip-path inset | Yes | Yes |
| 29 | Tech terminal scramble | TechStack | Scroll | Random glyphs → resolve | Yes | Yes |
| 30 | Tech skill bar fill | TechStack | Scroll | width + counter | Yes | Yes |
| 31 | Tech grid fade-in | TechStack | Scroll | opacity stagger | Yes | Yes |
| 32 | Accent flash transition | Tech→Contact | Scroll | scaleX + scaleY | Yes | Yes |
| 33 | Contact line mask reveal | Contact | Scroll | SplitText + yPercent | Yes | Yes |
| 34 | Contact blur-to-clear | Contact | Scroll | filter blur | Yes | Yes |
| 35 | Contact word stagger | Contact | Scroll | SplitText word fade | Yes | Yes |
| 36 | Contact border draw | Contact | Scroll | clip-path pseudo | Yes | Yes |
| 37 | Dock show/hide | Global | Scroll position | y + opacity | No | N/A |
| 38 | Dock mask hover | Global | Mouse | x translate | No | No |
| 39 | Magnetic buttons | Global | Mouse | x/y follow | No | No |
| 40 | 3D tilt on cards | Global | Mouse | rotateX/Y | No | No |
| 41 | Custom cursor | Global | Continuous | lerp tracking | No | N/A |
| 42 | Particle background | Global | Continuous | requestAnimationFrame | No | N/A |
| 43 | Smooth scroll (Lenis) | Global | User scroll | physics-based | No | N/A |

---

## File Changes Required

| File | Change |
|------|--------|
| `gsap-setup.ts` | Complete rewrite — SplitText, scrub timelines, section transitions, horizontal scroll, pinning, scramble effects, typewriter, counter animations |
| `global.css` | Add transition pseudo-elements, clip-path utilities, horizontal gallery styles, dashboard grid, floating accent lines, scramble/typewriter base styles |
| `Hero.astro` | Add depth layers, floating accent lines, restructure for pinning, add color-fill text layer |
| `Manifesto.astro` | Add parallax depth, counter animations, staggered card directions, scramble decode on label |
| `Focus.astro` | Add alternating reveals, typewriter code decorations, inner parallax layers |
| `Projects.astro` | Transform to horizontal scroll gallery, add SVG project diagrams, progress indicator |
| `TechStack.astro` | Transform to dashboard layout, center-expand clip reveals, enhanced skill bars with counter |
| `Contact.astro` | Enhance final reveal, add blur-to-clear effect, border draw animation |
| `LoadingScreen.astro` | Replace fade with clip-path circle wipe, add scramble text effect |
| `index.astro` | Add section transition pseudo-elements and DOM structure for pinning/horizontal scroll |

---

## Implementation Order

1. **Loading screen** — Iris wipe + scramble text (quick win, dramatic impact)
2. **Hero** — SplitText, line masks, color fill, pin (the centerpiece)
3. **Section transitions** — Add transition elements between all sections
4. **Manifesto** — Multi-direction cards, counter animation, scramble decode
5. **Focus** — Alternating reveals, typewriter, inner parallax
6. **Projects** — Horizontal scroll gallery (biggest structural change)
7. **Tech Stack** — Dashboard layout, center-expand, enhanced bars
8. **Contact** — Final cinematic reveal
9. **Polish** — Reduced motion, performance tuning, cross-browser testing
