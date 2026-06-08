'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function DeveloperCredit() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.z = 4

    // Floating particles
    const count = 120
    const positions = new Float32Array(count * 3)
    const velocities: number[] = []
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
      velocities.push((Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.002)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.045, transparent: true, opacity: 0.7 })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // Connecting lines geometry (updated each frame)
    const lineMat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.12 })
    const lineGeo = new THREE.BufferGeometry()
    const linePositions = new Float32Array(count * count * 6)
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lines)

    let animId: number
    const pos = geo.attributes.position as THREE.BufferAttribute

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Move particles
      for (let i = 0; i < count; i++) {
        pos.array[i * 3]     += velocities[i * 2]
        pos.array[i * 3 + 1] += velocities[i * 2 + 1]
        if (Math.abs(pos.array[i * 3])     > 7)  velocities[i * 2]     *= -1
        if (Math.abs(pos.array[i * 3 + 1]) > 3)  velocities[i * 2 + 1] *= -1
      }
      pos.needsUpdate = true

      // Draw connecting lines between nearby particles
      let lineIdx = 0
      const lp = lineGeo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = pos.array[i*3]   - pos.array[j*3]
          const dy = pos.array[i*3+1] - pos.array[j*3+1]
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 1.8 && lineIdx + 5 < lp.array.length) {
            lp.array[lineIdx++] = pos.array[i*3]
            lp.array[lineIdx++] = pos.array[i*3+1]
            lp.array[lineIdx++] = pos.array[i*3+2]
            lp.array[lineIdx++] = pos.array[j*3]
            lp.array[lineIdx++] = pos.array[j*3+1]
            lp.array[lineIdx++] = pos.array[j*3+2]
          }
        }
      }
      lp.needsUpdate = true
      lineGeo.setDrawRange(0, lineIdx / 3)

      points.rotation.y += 0.0008
      lines.rotation.y   += 0.0008
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{
      position: 'relative',
      borderTop: '1px solid #1a2535',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1726 50%, #0a0f1a 100%)',
      overflow: 'hidden',
    }}>
      {/* Three.js canvas background */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '900px', margin: '0 auto',
        padding: '36px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
      }}>

        {/* Label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
          color: '#4b6080', fontFamily: 'sans-serif',
        }}>
          <div style={{ width: '32px', height: '1px', background: '#c9a84c', opacity: 0.5 }} />
          Designed & Built by
          <div style={{ width: '32px', height: '1px', background: '#c9a84c', opacity: 0.5 }} />
        </div>

        {/* Name */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            margin: 0,
            fontSize: 'clamp(22px, 4vw, 32px)',
            fontWeight: '700',
            fontFamily: '"Playfair Display", Georgia, serif',
            background: 'linear-gradient(90deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}>
            Daniel Zaim
          </h3>
          <p style={{
            margin: '6px 0 0',
            fontSize: '13px',
            color: '#4b6080',
            letterSpacing: '1px',
            fontFamily: 'sans-serif',
          }}>
            Full-Stack Developer · App Inventor
          </p>
        </div>

        {/* Contact pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center',
        }}>
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"/>
                </svg>
              ),
              label: '+373 62 170 705',
              href: 'tel:+37362170705',
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              ),
              label: 'danielzaimappinventor@gmail.com',
              href: 'mailto:danielzaimappinventor@gmail.com',
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.01 15.58 2 15.2 2 12s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92C8.27 2.17 8.68 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.36-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32A6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.84a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
                </svg>
              ),
              label: '@zdanu._',
              href: 'https://instagram.com/zdanu._',
            },
          ].map(({ icon, label, href }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px',
                borderRadius: '100px',
                border: '1px solid #1e2d42',
                background: 'rgba(201,168,76,0.06)',
                color: '#8a9ab5',
                textDecoration: 'none',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#c9a84c'
                e.currentTarget.style.color = '#c9a84c'
                e.currentTarget.style.background = 'rgba(201,168,76,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e2d42'
                e.currentTarget.style.color = '#8a9ab5'
                e.currentTarget.style.background = 'rgba(201,168,76,0.06)'
              }}
            >
              {icon}
              {label}
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
