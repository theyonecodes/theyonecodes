export class CustomCursor {
  private cursor: HTMLElement
  private follower: HTMLElement
  private rafId: number = 0
  private mouseX: number = 0
  private mouseY: number = 0
  private cursorX: number = 0
  private cursorY: number = 0
  private isHovering: boolean = false

  constructor() {
    this.cursor = document.createElement('div')
    this.cursor.className = 'custom-cursor-dot'
    this.cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: #00ff88;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, background 0.3s;
      mix-blend-mode: difference;
    `

    this.follower = document.createElement('div')
    this.follower.className = 'custom-cursor-ring'
    this.follower.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, border-color 0.3s, background 0.3s;
    `

    document.body.appendChild(this.cursor)
    document.body.appendChild(this.follower)
    this.bindEvents()
    this.animate()
  }

  private bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    })

    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0'
      this.follower.style.opacity = '0'
    })

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1'
      this.follower.style.opacity = '1'
    })

    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.isHovering = true
        this.cursor.style.width = '16px'
        this.cursor.style.height = '16px'
        this.cursor.style.background = 'transparent'
        this.cursor.style.border = '2px solid #00ff88'
        this.follower.style.width = '60px'
        this.follower.style.height = '60px'
        this.follower.style.borderColor = 'rgba(0, 255, 136, 0.3)'
        this.follower.style.background = 'rgba(0, 255, 136, 0.05)'
      })
      el.addEventListener('mouseleave', () => {
        this.isHovering = false
        this.cursor.style.width = '8px'
        this.cursor.style.height = '8px'
        this.cursor.style.background = '#00ff88'
        this.cursor.style.border = 'none'
        this.follower.style.width = '40px'
        this.follower.style.height = '40px'
        this.follower.style.borderColor = 'rgba(255,255,255,0.15)'
        this.follower.style.background = 'transparent'
      })
    })
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate)

    this.cursorX += (this.mouseX - this.cursorX) * 0.15
    this.cursorY += (this.mouseY - this.cursorY) * 0.15

    this.cursor.style.left = `${this.cursorX}px`
    this.cursor.style.top = `${this.cursorY}px`
    this.follower.style.left = `${this.mouseX}px`
    this.follower.style.top = `${this.mouseY}px`
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
    this.cursor.remove()
    this.follower.remove()
  }
}
