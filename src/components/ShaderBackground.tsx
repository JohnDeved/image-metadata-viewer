import React, { useEffect, useRef, memo } from 'react'
import { useStore } from '../store'

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
      const sh = `precision lowp float;
    uniform vec3 iR; uniform float iT; uniform vec4 iM;

    // Optimized Noise (Hash-less permutation for speed)
    vec3 pm(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.2113248654, 0.3660254037, -0.577350269, 0.02439024);
      vec2 i = floor(v + dot(v, C.yy)), x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = pm(pm(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m*m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0, h = abs(x) - 0.5, ox = floor(x + 0.5), a0 = x - ox;
      m *= 1.792842914 - 0.853734721 * (a0*a0 + h*h);
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy/iR.xy; 
        uv.x *= iR.x/iR.y; 
        vec2 sc = uv; 
        sc.x -= iT * 0.01; // Even slower drift
        
        vec2 id = floor(sc * 10.0); // Reduced grid resolution for performance
        vec2 gv = fract(sc * 10.0) - 0.5;
        
        float minD = 100.0;
        float inf = 0.0;
        
        vec2 m = iM.xy/iR.xy; 
        m.x *= iR.x/iR.y; 
        m.x -= iT * 0.01; // Match drift speed
        
        for(int k=0; k<4; k++) { // Reduced from 9 to 4 for performance
            vec2 off = vec2(mod(float(k), 2.0)-0.5, floor(float(k)/2.0)-0.5);
            vec2 wPos = (id + off + 0.5) / 10.0;
            
            // 1. FLUID MOVEMENT
            float t = iT * 0.02;
            float n = snoise(wPos * 1.5 + t) + snoise(wPos * 3.0 - t * 1.2) * 0.5;
            vec2 fOff = vec2(cos(n * 2.5 + t), sin(n * 2.5 + t)) * 0.06;
            
            // 2. MOUSE INFLUENCE
            vec2 dir = wPos - m;
            float distSq = dot(dir, dir); 
            float infl = 0.0;
            
            // Use iM.w as influence multiplier (0.0 = no effect, 1.0 = full effect)
            if(distSq < 0.36 && iM.w > 0.01) {
                 float dist = sqrt(distSq);
                 infl = smoothstep(0.6, 0.0, dist) * iM.w; // Multiply by influence
                 infl *= infl; 
            }
            
            // 3. VISIBILITY (Twinkle)
            float visNoise = snoise(wPos * 0.8 + iT * 0.6 + 100.0);
            float vis = 0.4 + 0.6 * smoothstep(-0.4, 0.4, visNoise);
            
            // 4. GEOMETRY
            float len = mix(0.0, 0.12 + sin(t * 0.5 + n * 5.0) * 0.03, infl) * vis;
            float rad = mix(0.02, 0.008, infl) * vis;
            
            // 5. ROTATION 
            vec2 rDir = normalize(dir); 
            vec2 rndDir = vec2(cos(n*0.5), sin(n*0.5)); 
            vec2 finalDir = normalize(mix(rndDir, rDir, infl));
            
            // 6. POSITION & SDF
            vec2 p = gv - off - fOff * 3.0 - rDir * infl * 0.1 * 10.0;
            vec2 rotP = vec2(dot(p, finalDir), dot(p, vec2(-finalDir.y, finalDir.x)));
            
            vec2 pa = rotP - vec2(-len, 0.0);
            vec2 ba = vec2(len, 0.0) - vec2(-len, 0.0);
            float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
            float d = length(pa - ba * h) - rad;
            
            if(d < minD) { minD = d; inf = infl; }
        }
        
        // Background Color: Slate-950 (#020617)
        // R: 2/255 = 0.0078
        // G: 6/255 = 0.0235
        // B: 23/255 = 0.0902
        vec3 bg = vec3(0.0078, 0.0235, 0.0902);

        // Mint Theme Colors
        // Teal-500: #14b8a6 -> (0.078, 0.721, 0.651)
        // Teal-300: #5eead4 -> (0.369, 0.918, 0.831)
        vec3 shapeCol1 = vec3(0.078, 0.721, 0.651); 
        vec3 shapeCol2 = vec3(0.369, 0.918, 0.831);
        
        vec3 shapeColor = mix(shapeCol1, shapeCol2, inf);
        
        // Mix background and shape based on SDF
        vec3 col = mix(bg, shapeColor, smoothstep(0.008, -0.008, minD));
        
        gl_FragColor = vec4(col, 1.0);
    }`

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
        c.style.width = window.innerWidth + 'px'
        c.style.height = window.innerHeight + 'px'
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

