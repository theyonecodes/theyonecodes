import * as THREE from 'three'

export class ThreeScene {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private clock: THREE.Clock
  private meshes: THREE.Mesh[] = []
  private particles: THREE.Points | null = null
  private rafId: number = 0
  private mouseX: number = 0
  private mouseY: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.clock = new THREE.Clock()

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x030303)

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.z = 8

    this.createLights()
    this.createMeshes()
    this.createParticles()

    this.bindEvents()
    this.animate()
  }

  private createLights() {
    const ambient = new THREE.AmbientLight(0x222244, 0.5)
    this.scene.add(ambient)

    const dirLight = new THREE.DirectionalLight(0x00ff88, 0.8)
    dirLight.position.set(5, 5, 5)
    this.scene.add(dirLight)

    const dirLight2 = new THREE.DirectionalLight(0x7c5cfc, 0.4)
    dirLight2.position.set(-5, -3, -5)
    this.scene.add(dirLight2)

    const pointLight = new THREE.PointLight(0x00ff88, 0.3, 20)
    pointLight.position.set(0, 0, 2)
    this.scene.add(pointLight)
  }

  private createMeshes() {
    const geometries = [
      new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32),
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.TorusGeometry(1.5, 0.3, 32, 64),
    ]

    const materials = [
      new THREE.MeshPhysicalMaterial({
        color: 0x00ff88,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x7c5cfc,
        metalness: 0.5,
        roughness: 0.2,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x00ff88,
        metalness: 0.2,
        roughness: 0.6,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
      }),
    ]

    geometries.forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, materials[i])
      mesh.position.set(
        (i - 1) * 3.5,
        Math.sin(i * 1.5) * 0.5,
        -2 - i * 2
      )
      mesh.scale.setScalar(0.8 + i * 0.2)
      this.scene.add(mesh)
      this.meshes.push(mesh)
    })
  }

  private createParticles() {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const colorA = new THREE.Color(0x00ff88)
    const colorB = new THREE.Color(0x7c5cfc)

    for (let i = 0; i < count; i++) {
      const radius = 15
      positions[i * 3] = (Math.random() - 0.5) * radius * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2

      const mix = Math.random()
      const c = colorA.clone().lerp(colorB, mix)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  private bindEvents() {
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
    }

    const onMouse = (e: MouseEvent) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate)
    const t = this.clock.getElapsedTime()

    this.meshes.forEach((mesh, i) => {
      mesh.rotation.x = t * 0.15 + i * 0.5
      mesh.rotation.y = t * 0.2 + i * 0.3
      mesh.position.y += Math.sin(t * 0.3 + i * 1.5) * 0.001
    })

    if (this.particles) {
      this.particles.rotation.y = t * 0.02
      this.particles.rotation.x = Math.sin(t * 0.01) * 0.05
    }

    this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.02
    this.camera.position.y += (-this.mouseY * 0.3 - this.camera.position.y) * 0.02
    this.camera.lookAt(0, 0, 0)

    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
    this.renderer.dispose()
    this.meshes.forEach((m) => {
      m.geometry.dispose()
      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => mat.dispose())
      } else {
        m.material.dispose()
      }
    })
    if (this.particles) {
      this.particles.geometry.dispose()
      this.particles.material.dispose()
    }
  }
}
