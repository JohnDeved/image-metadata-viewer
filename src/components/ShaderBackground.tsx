import React, { useEffect, useRef, memo } from 'react'
import { useStore } from '../store'
import { MINT_SHADER_FRAGMENT } from '../utils/shaders'

export const ShaderBackground: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDetailView = useStore((state) => state.isDetailView)
  const isDetailViewRef = useRef(isDetailView)

  useEffect(() => {
    isDetailViewRef.current = isDetailView
  }, [isDetailView])


    useEffect(() => {
      const c = canvasRef.current
      if (!c) return

      // OPTIMIZATION: Use alpha: false for better performance (no compositing)
      const gl = c.getContext('webgl', { alpha: false, antialias: false })
      if (!gl) return

      const prog = gl.createProgram()
      const vs = gl.createShader(gl.VERTEX_SHADER)
      const fs = gl.createShader(gl.FRAGMENT_SHADER)

      if (!prog || !vs || !fs) return

      // --- Optimized Shader ---
      // Background is hardcoded to match Slate-950 (#020617) to simulate transparency
      // while keeping the performance benefits of an opaque canvas.
      const sh = MINT_SHADER_FRAGMENT

      // --- Setup ---
      gl.shaderSource(vs, `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`)
      gl.shaderSource(fs, sh)
      gl.compileShader(vs)
      gl.compileShader(fs)

      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(fs))
      }

      gl.attachShader(prog, vs)
      gl.attachShader(prog, fs)
      gl.linkProgram(prog)
      gl.useProgram(prog)

      // --- Buffers ---
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

      // --- State & Loop ---
      interface MouseState {
        x: number
        y: number
        tx: number
        ty: number
        influence: number
      }
      let m: MouseState = { x: 0, y: 0, tx: 0, ty: 0, influence: 1 }
      let dpr = 1
      let animationFrameId: number
      let startTime = Date.now()

      const uR = gl.getUniformLocation(prog, 'iR')
      const uT = gl.getUniformLocation(prog, 'iT')
      const uM = gl.getUniformLocation(prog, 'iM')

      const setSize = () => {
        // PERFORMANCE: Cap DPR and use resolution scaling for optimal fullscreen performance
        // renderScale < 1 renders fewer pixels then scales up (huge perf gain)
        const renderScale = 0.75 // Render at 75% resolution
        dpr = Math.min(window.devicePixelRatio || 1, 1.5) * renderScale

        c.width = Math.floor(window.innerWidth * dpr)
        c.height = Math.floor(window.innerHeight * dpr)
        c.style.width = `${window.innerWidth}px`
        c.style.height = `${window.innerHeight}px`
        gl.viewport(0, 0, c.width, c.height)
      }

      setSize()
      window.addEventListener('resize', setSize)

      const onMove = (e: MouseEvent | TouchEvent) => {
        if (isDetailViewRef.current) return // Don't track cursor in detail view
        const t = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent)
        m.tx = t.clientX * dpr
        m.ty = c.height - t.clientY * dpr
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('touchmove', onMove)

      const loop = () => {
        // Smoothly fade out mouse tracking in detail view instead of instant cutoff
        const targetInfluence = isDetailViewRef.current ? 0 : 1
        const currentInfluence = m.influence
        m.influence = currentInfluence + (targetInfluence - currentInfluence) * 0.05

        // Only update mouse position when NOT in detail view
        // This freezes the effect in place when entering detail view
        if (!isDetailViewRef.current) {
          m.x += (m.tx - m.x) * 0.12
          m.y += (m.ty - m.y) * 0.12
        }

        const time = (Date.now() - startTime) * 0.001

        gl.uniform3f(uR, c.width, c.height, 1)
        gl.uniform1f(uT, time)
        // Pass influence in w component to fade effect without moving coordinates
        gl.uniform4f(uM, m.x, m.y, 0, m.influence)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        animationFrameId = requestAnimationFrame(loop)
      }

      loop()

      return () => {
        window.removeEventListener('resize', setSize)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('touchmove', onMove)
        cancelAnimationFrame(animationFrameId)
        gl.deleteProgram(prog)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        gl.deleteBuffer(buffer)
      }
    }, []) // Empty deps - never recreate WebGL context, use ref for state

    return (
      <canvas
        ref={canvasRef}
        className="fixed top-16 left-0 right-0 bottom-0 w-full h-full pointer-events-none z-0"
      />
    )
  })

