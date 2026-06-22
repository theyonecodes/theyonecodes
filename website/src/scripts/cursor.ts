export class CustomCursor {
  private cursor: HTMLElement
  private follower: HTMLElement
  private rafId: number = 0
  private mouseX: number = 0
  private mouseY: number = 0
  private cursorX: number = 0
  private cursorY: number = 0

  constructor() {
    this.cursor = document.createElement('div')
    this.cursor.className = 'custom-cursor-dot'
    this.cursor.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: #8B5CF6;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, background 0.3s, border 0.3s;
      mix-blend-mode: difference;
    `

    this.follower = document.createElement('div')
    this.follower.className = 'custom-cursor-ring'
    this.follower.style.cssText = `
      position: fixed;
      width: 36px;
      height: 36px;
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, background 0.3s;
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

    document.querySelectorAll('a, button, [data-cursor], .magnetic').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.cursor.style.width = '14px'
        this.cursor.style.height = '14px'
        this.cursor.style.background = 'transparent'
        this.cursor.style.border = '1.5px solid #8B5CF6'
        this.follower.style.width = '52px'
        this.follower.style.height = '52px'
        this.follower.style.borderColor = 'rgba(139, 92, 246, 0.3)'
        this.follower.style.background = 'rgba(139, 92, 246, 0.05)'
      })
      el.addEventListener('mouseleave', () => {
        this.cursor.style.width = '6px'
        this.cursor.style.height = '6px'
        this.cursor.style.background = '#8B5CF6'
        this.cursor.style.border = 'none'
        this.follower.style.width = '36px'
        this.follower.style.height = '36px'
        this.follower.style.borderColor = 'rgba(139, 92, 246, 0.2)'
        this.follower.style.background = 'transparent'
      })
    })
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate)

    this.cursorX += (this.mouseX - this.cursorX) * 0.12
    this.cursorY += (this.mouseY - this.cursorY) * 0.12

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
