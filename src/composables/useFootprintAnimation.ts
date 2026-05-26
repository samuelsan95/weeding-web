import { ref, onMounted, onUnmounted } from 'vue'

// ─── Configuration ───────────────────────────────────────────────────────────
const SCROLL_THRESHOLD = 80
// Lateral distance (px) from the path center line to each foot
const LATERAL_OFFSET = 35
const FADE_SPEED = 0.001
const INITIAL_OPACITY = 0.85
const FOOTPRINT_WIDTH = 64
const FOOTPRINT_HEIGHT = 80
const ARC_SAMPLES_PER_SEGMENT = 40

const LEFT_FOOTPRINT_PATH = '/src/assets/left-foot.png'
const RIGHT_FOOTPRINT_PATH = '/src/assets/right-foot.png'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Point {
  x: number
  y: number
}

interface CubicBezierSegment {
  p0: Point
  p1: Point
  p2: Point
  p3: Point
}

interface Footprint {
  x: number
  pageY: number       // absolute page coordinate (does not change after placement)
  opacity: number
  isLeft: boolean
  rotation: number
  scale: number
}

interface ArcLengthEntry {
  t: number
  length: number
}

// ─── Cubic Bézier math ───────────────────────────────────────────────────────

function bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3
}

function evalBezier(seg: CubicBezierSegment, t: number): Point {
  return {
    x: bezierPoint(seg.p0.x, seg.p1.x, seg.p2.x, seg.p3.x, t),
    y: bezierPoint(seg.p0.y, seg.p1.y, seg.p2.y, seg.p3.y, t),
  }
}

function bezierDerivative(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2)
}

function bezierSpeed(seg: CubicBezierSegment, t: number): number {
  const dx = bezierDerivative(seg.p0.x, seg.p1.x, seg.p2.x, seg.p3.x, t)
  const dy = bezierDerivative(seg.p0.y, seg.p1.y, seg.p2.y, seg.p3.y, t)
  return Math.sqrt(dx * dx + dy * dy)
}

function buildArcLengthTable(seg: CubicBezierSegment, samples: number): ArcLengthEntry[] {
  const table: ArcLengthEntry[] = [{ t: 0, length: 0 }]
  let cumulative = 0
  const dt = 1 / samples
  for (let i = 1; i <= samples; i++) {
    const t = i * dt
    const prevT = (i - 1) * dt
    const midT = (prevT + t) / 2
    cumulative += bezierSpeed(seg, midT) * dt
    table.push({ t, length: cumulative })
  }
  return table
}

function tForLength(table: ArcLengthEntry[], targetLength: number): number {
  const total = table[table.length - 1].length
  if (targetLength <= 0) return 0
  if (targetLength >= total) return 1
  let lo = 0
  let hi = table.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (table[mid].length < targetLength) lo = mid
    else hi = mid
  }
  const segLen = table[hi].length - table[lo].length
  const frac = segLen > 0 ? (targetLength - table[lo].length) / segLen : 0
  return table[lo].t + frac * (table[hi].t - table[lo].t)
}

function segmentTotalLength(table: ArcLengthEntry[]): number {
  return table[table.length - 1].length
}

// ─── Path definition ─────────────────────────────────────────────────────────
// X is relative to viewport width, Y is relative to document scroll height.

function buildPath(vw: number, docHeight: number): { segments: CubicBezierSegment[]; tables: ArcLengthEntry[][]; totalLength: number } {
  const xMin = vw < 768 ? vw * 0.15 : vw * 0.25
  const xMax = vw < 768 ? vw * 0.85 : vw * 0.75
  const xMid = (xMin + xMax) / 2
  const xRange = xMax - xMin

  const segments: CubicBezierSegment[] = [
    {
      p0: { x: xMin,           y: docHeight * 0.02 },
      p1: { x: xMid - xRange * 0.1, y: docHeight * 0.01 },
      p2: { x: xMid + xRange * 0.1, y: docHeight * 0.01 },
      p3: { x: xMax,           y: docHeight * 0.12 },
    },
    {
      p0: { x: xMax,           y: docHeight * 0.12 },
      p1: { x: xMax + xRange * 0.05, y: docHeight * 0.22 },
      p2: { x: xMid,           y: docHeight * 0.30 },
      p3: { x: xMin,           y: docHeight * 0.38 },
    },
    {
      p0: { x: xMin,           y: docHeight * 0.38 },
      p1: { x: xMin - xRange * 0.05, y: docHeight * 0.48 },
      p2: { x: xMid,           y: docHeight * 0.55 },
      p3: { x: xMax,           y: docHeight * 0.60 },
    },
    {
      p0: { x: xMax,           y: docHeight * 0.60 },
      p1: { x: xMax + xRange * 0.05, y: docHeight * 0.68 },
      p2: { x: xMid,           y: docHeight * 0.75 },
      p3: { x: xMin,           y: docHeight * 0.80 },
    },
    {
      p0: { x: xMin,           y: docHeight * 0.80 },
      p1: { x: xMin - xRange * 0.05, y: docHeight * 0.86 },
      p2: { x: xMid,           y: docHeight * 0.92 },
      p3: { x: xMax,           y: docHeight * 0.95 },
    },
    {
      p0: { x: xMax,           y: docHeight * 0.95 },
      p1: { x: xMax + xRange * 0.05, y: docHeight * 0.97 },
      p2: { x: xMid,           y: docHeight * 0.98 },
      p3: { x: xMin,           y: docHeight * 1.00 },
    },
  ]

  const tables = segments.map((seg) => buildArcLengthTable(seg, ARC_SAMPLES_PER_SEGMENT))
  let totalLength = 0
  for (const table of tables) totalLength += segmentTotalLength(table)

  return { segments, tables, totalLength }
}

function pointAndAngleAtLength(
  segments: CubicBezierSegment[],
  tables: ArcLengthEntry[][],
  totalLength: number,
  length: number
): { x: number; y: number; angle: number } {
  const clamped = Math.max(0, Math.min(length, totalLength))
  let accumulated = 0
  for (let i = 0; i < segments.length; i++) {
    const segLen = segmentTotalLength(tables[i])
    if (clamped <= accumulated + segLen) {
      const localLength = clamped - accumulated
      const t = tForLength(tables[i], localLength)
      const pt = evalBezier(segments[i], t)
      const dx = bezierDerivative(segments[i].p0.x, segments[i].p1.x, segments[i].p2.x, segments[i].p3.x, t)
      const dy = bezierDerivative(segments[i].p0.y, segments[i].p1.y, segments[i].p2.y, segments[i].p3.y, t)
      return { x: pt.x, y: pt.y, angle: Math.atan2(dy, dx) }
    }
    accumulated += segLen
  }
  const lastSeg = segments[segments.length - 1]
  const pt = evalBezier(lastSeg, 1)
  const dx = bezierDerivative(lastSeg.p0.x, lastSeg.p1.x, lastSeg.p2.x, lastSeg.p3.x, 1)
  const dy = bezierDerivative(lastSeg.p0.y, lastSeg.p1.y, lastSeg.p2.y, lastSeg.p3.y, 1)
  return { x: pt.x, y: pt.y, angle: Math.atan2(dy, dx) }
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useFootprintAnimation() {
  const canvas = ref<HTMLCanvasElement | null>(null)
  const isReady = ref(false)
  const activeFootprints = ref<Footprint[]>([])

  let ctx: CanvasRenderingContext2D | null = null
  let dpr = 1
  let leftFootImg: HTMLImageElement | null = null
  let rightFootImg: HTMLImageElement | null = null
  let imagesLoaded = false

  let pathSegments: CubicBezierSegment[] = []
  let pathTables: ArcLengthEntry[][] = []
  let pathTotalLength = 0

  let lastScrollY = 0
  let cumulativeScroll = 0
  let isLeftFoot = true

  let animationFrameId: number | null = null
  let scrolling = false
  let scrollEndTimeout: ReturnType<typeof setTimeout> | null = null

  function getDocHeight(): number {
    return document.documentElement.scrollHeight
  }

  function rebuildPath() {
    const path = buildPath(window.innerWidth, getDocHeight())
    pathSegments = path.segments
    pathTables = path.tables
    pathTotalLength = path.totalLength
  }

  function setupCanvas() {
    if (!canvas.value) return
    ctx = canvas.value.getContext('2d')
    if (!ctx) return
    dpr = window.devicePixelRatio || 1
    canvas.value.width = window.innerWidth * dpr
    canvas.value.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function preloadImages(): Promise<void> {
    return new Promise((resolve, reject) => {
      let loaded = 0
      const onLoad = () => { loaded++; if (loaded === 2) { imagesLoaded = true; resolve() } }
      const onError = () => reject(new Error('Footprint image failed to load'))
      leftFootImg = new Image()
      leftFootImg.onload = onLoad
      leftFootImg.onerror = onError
      leftFootImg.src = LEFT_FOOTPRINT_PATH
      rightFootImg = new Image()
      rightFootImg.onload = onLoad
      rightFootImg.onerror = onError
      rightFootImg.src = RIGHT_FOOTPRINT_PATH
    })
  }

  function placeFootprint() {
    if (!imagesLoaded || !leftFootImg || !rightFootImg) return

    const scrollable = getDocHeight() - window.innerHeight
    const scrollProgress = scrollable > 0 ? window.scrollY / scrollable : 0
    const currentPathLength = scrollProgress * pathTotalLength
    const { x, y, angle } = pointAndAngleAtLength(pathSegments, pathTables, pathTotalLength, currentPathLength)

    // Offset each foot laterally from the path center line.
    // The perpendicular to the path direction (angle) is (sin(angle), -cos(angle)).
    const perpX = Math.sin(angle)
    const perpY = -Math.cos(angle)
    const sign = isLeftFoot ? -1 : 1
    const footX = x + sign * perpX * LATERAL_OFFSET
    const footY = y + sign * perpY * LATERAL_OFFSET

    const rotation = angle + Math.PI / 2

    activeFootprints.value.push({
      x: footX,
      pageY: footY,
      opacity: INITIAL_OPACITY,
      isLeft: isLeftFoot,
      rotation: rotation * (180 / Math.PI),
      scale: 0.85 + Math.random() * 0.3,
    })

    isLeftFoot = !isLeftFoot
  }

  function animate() {
    if (!ctx || !leftFootImg || !rightFootImg) {
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    const scrollY = window.scrollY
    const vh = window.innerHeight

    // Fade footprints
    for (let i = activeFootprints.value.length - 1; i >= 0; i--) {
      activeFootprints.value[i].opacity -= FADE_SPEED
      if (activeFootprints.value[i].opacity <= 0) {
        activeFootprints.value.splice(i, 1)
      }
    }

    // Always redraw while scrolling or when footprints exist (they shift with scroll)
    ctx.clearRect(0, 0, window.innerWidth, vh)

    for (const fp of activeFootprints.value) {
      // Convert absolute page Y to viewport-relative for the fixed canvas
      const viewportY = fp.pageY - scrollY

      // Skip rendering if outside the visible viewport
      if (viewportY < -FOOTPRINT_HEIGHT || viewportY > vh + FOOTPRINT_HEIGHT) continue

      const img = fp.isLeft ? leftFootImg : rightFootImg
      if (!img || !img.complete) continue

      ctx.save()
      ctx.translate(fp.x, viewportY)
      ctx.rotate((fp.rotation * Math.PI) / 180)
      ctx.scale(fp.scale, fp.scale)
      ctx.globalAlpha = Math.max(0, fp.opacity)
      ctx.drawImage(img, -FOOTPRINT_WIDTH / 2, -FOOTPRINT_HEIGHT / 2, FOOTPRINT_WIDTH, FOOTPRINT_HEIGHT)
      ctx.restore()
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  function handleScroll() {
    scrolling = true
    if (scrollEndTimeout) clearTimeout(scrollEndTimeout)
    scrollEndTimeout = setTimeout(() => { scrolling = false }, 150)

    const currentScrollY = window.scrollY
    if (currentScrollY > lastScrollY) {
      cumulativeScroll += currentScrollY - lastScrollY
      while (cumulativeScroll >= SCROLL_THRESHOLD) {
        placeFootprint()
        cumulativeScroll -= SCROLL_THRESHOLD
      }
    }
    lastScrollY = currentScrollY
  }

  let resizeTimeout: ReturnType<typeof setTimeout> | null = null

  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      setupCanvas()
      rebuildPath()
    }, 200)
  }

  async function init() {
    setupCanvas()
    rebuildPath()
    try {
      await preloadImages()
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })
      animate()
      isReady.value = true
    } catch (error) {
      console.error('Failed to initialize footprint animation:', error)
    }
  }

  onMounted(() => { init() })

  onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    if (resizeTimeout) clearTimeout(resizeTimeout)
    if (scrollEndTimeout) clearTimeout(scrollEndTimeout)
  })

  return { canvas, isReady, activeFootprints }
}
