export class ParticleBackground {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private mouse = { x: 0, y: 0 }
  private rafId = 0
  private width = 0
  private height = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    this.createParticles()
    this.bindEvents()
    this.animate()
  }

  private resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  private createParticles() {
    const count = Math.min(Math.floor((this.width * this.height) / 12000), 200)
    this.particles = []

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7 ? '#22D3EE' : Math.random() > 0.5 ? '#F5CA40' : '#E8E0D0',
      })
    }
  }

  private bindEvents() {
    window.addEventListener('resize', () => {
      this.resize()
      this.createParticles()
    })

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate)
    this.ctx.clearRect(0, 0, this.width, this.height)

    for (const p of this.particles) {
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = this.width
      if (p.x > this.width) p.x = 0
      if (p.y < 0) p.y = this.height
      if (p.y > this.height) p.y = 0

      const dx = this.mouse.x - p.x
      const dy = this.mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 150) {
        const force = (150 - dist) / 150
        p.vx -= (dx / dist) * force * 0.02
        p.vy -= (dy / dist) * force * 0.02
      }

      p.vx *= 0.99
      p.vy *= 0.99

      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = p.color
      this.ctx.globalAlpha = p.opacity
      this.ctx.fill()
    }

    this.ctx.globalAlpha = 1

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i]
        const b = this.particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          this.ctx.beginPath()
          this.ctx.moveTo(a.x, a.y)
          this.ctx.lineTo(b.x, b.y)
          this.ctx.strokeStyle = `rgba(34, 211, 238, ${0.03 * (1 - dist / 100)})`
          this.ctx.lineWidth = 0.5
          this.ctx.stroke()
        }
      }
    }
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
  }
}
