# Design Tokens Documentation

## Overview
This document explains the design token system used across TheyOne Codes projects. We've migrated from a Fibonacci-based spacing system to semantic naming for better maintainability and developer experience.

## Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--g-xxs` | 2px | Smallest spacing (e.g., icon spacing, tight borders) |
| `--g-xs` | 3px | Very small spacing (e.g., icon padding, tight gaps) |
| `--g-sm` | 5px | Small spacing (e.g., button padding, component gaps) |
| `--g-md` | 8px | Medium spacing (e.g., card padding, section gaps) |
| `--g-lg` | 13px | Large spacing (e.g., section padding, major gaps) |
| `--g-xl` | 21px | Extra large spacing (e.g., major section padding) |
| `--g-xxl` | 34px | Extra extra large spacing (e.g., hero section padding) |
| `--g-xxxl` | 55px | Largest spacing (e.g., page-level padding) |

## Usage Guidelines

### ✅ Use semantic tokens
- Use `--g-sm` instead of `--g3`
- Use `--g-md` instead of `--g4`
- Use `--g-lg` instead of `--g5`

### ✅ Use CSS animations
- Prefer CSS animations over JavaScript libraries
- Use `@media (prefers-reduced-motion: no-preference)` for animations
- Use IntersectionObserver for scroll-triggered animations

### ✅ Use prefers-reduced-motion
- Always respect `prefers-reduced-motion` media query
- Disable animations when user has requested reduced motion
- Use `animation-duration: 0.01ms !important` for reduced motion

### ✅ Avoid ego effects
- No custom cursors
- No unnecessary scroll animations
- No heavy 3D scenes on all devices

### ✅ Keep it simple
- Use 4-6 spacing tokens max
- Avoid complex design systems
- Prefer native browser features

## Examples

### Good
```css
.card {
  padding: var(--g-md);
  margin-bottom: var(--g-lg);
}

@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 0.3s ease;
  }
  
  .card:hover {
    transform: translateY(-2px);
  }
}
```

### Bad
```css
.card {
  padding: var(--g4);
  margin-bottom: var(--g5);
}

// Using GSAP for simple animations
import gsap from 'gsap';
gsap.to('.card', { y: -2, duration: 0.3 });
```

## Verification

To ensure compliance:
1. Run `grep -r "--g[1-8]" src/` to verify no old tokens remain
2. Run `grep -r "gsap" src/` to verify no GSAP usage remains
3. Run `grep -r "lenis" src/` to verify no Lenis usage remains
4. Run `grep -r "three" src/` to verify no Three.js usage remains

## Next Steps
- Add linting rules to prevent regression
- Create design token usage checklist for code reviews
- Document this in the team wiki

> "Design tokens are not just about colors and spacing - they're about communication. Semantic names help developers understand intent, not just values."