import React, { useEffect, useRef, memo } from 'react'
import { useStore } from '../store'
import { MINT_SHADER_FRAGMENT } from '../utils/shaders'

const isLowPowerMode = () => {
  if (typeof globalThis === 'undefined') return false
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true
  const conn = (globalThis.navigator as (Navigator & { connection?: { saveData?: boolean } }) | undefined)
    ?.connection
  if (conn?.saveData) return true
  const deviceMem = (globalThis.navigator as (Navigator & { deviceMemory?: number }) | undefined)
    ?.deviceMemory
  return typeof deviceMem === 'number' && deviceMem < 4
}

export const ShaderBackground: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDetailView = useStore(state => state.isDetailView)
  const isDetailViewRef = useRef(isDetailView)
  const disabled = isLowPowerMode()

  useEffect(() => {
    isDetailViewRef.current = isDetailView
  }, [isDetailView])

  useEffect(() => {
    if (disabled) return

    const c = canvasRef.current
    if (!c) return

    const gl = c.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    const prog = gl.createProgram()
    const vs = gl.createShader(gl.VERTEX_SHADER)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (!prog || !vs || !fs) return

    gl.shaderSource(vs, `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`)
    gl.shaderSource(fs, MINT_SHADER_FRAGMENT)
    gl.compileShader(vs)
    gl.compileShader(fs)

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(fs))
    }

    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    interface MouseState {
      x: number
      y: number
      tx: number
      ty: number
      influence: number
    }
    let m: MouseState = { x: 0, y: 0, tx: 0, ty: 0, influence: 1 }
    let dpr = 1
    let animationFrameId = 0
    const startTime = Date.now()

    const uR = gl.getUniformLocation(prog, 'iR')
    const uT = gl.getUniformLocation(prog, 'iT')
    const uM = gl.getUniformLocation(prog, 'iM')

    const setSize = () => {
      const renderScale = 0.75
      dpr = Math.min(globalThis.devicePixelRatio || 1, 1.5) * renderScale
      c.width = Math.floor(globalThis.innerWidth * dpr)
      c.height = Math.floor(globalThis.innerHeight * dpr)
      c.style.width = `${globalThis.innerWidth}px`
      c.style.height = `${globalThis.innerHeight}px`
      gl.viewport(0, 0, c.width, c.height)
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (isDetailViewRef.current) return
      const t = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent)
      m.tx = t.clientX * dpr
      m.ty = c.height - t.clientY * dpr
    }

    const loop = () => {
      const targetInfluence = isDetailViewRef.current ? 0 : 1
      m.influence += (targetInfluence - m.influence) * 0.05
      if (!isDetailViewRef.current) {
        m.x += (m.tx - m.x) * 0.12
        m.y += (m.ty - m.y) * 0.12
      }

      const time = (Date.now() - startTime) * 0.001
      gl.uniform3f(uR, c.width, c.height, 1)
      gl.uniform1f(uT, time)
      gl.uniform4f(uM, m.x, m.y, 0, m.influence)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationFrameId = requestAnimationFrame(loop)
    }

    setSize()
    globalThis.addEventListener('resize', setSize)
    globalThis.addEventListener('mousemove', onMove)
    globalThis.addEventListener('touchmove', onMove)
    loop()

    return () => {
      globalThis.removeEventListener('resize', setSize)
      globalThis.removeEventListener('mousemove', onMove)
      globalThis.removeEventListener('touchmove', onMove)
      cancelAnimationFrame(animationFrameId)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-16 left-0 right-0 bottom-0 w-full h-full pointer-events-none z-0"
    />
  )
})
