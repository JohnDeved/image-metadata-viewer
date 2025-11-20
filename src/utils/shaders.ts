export const MINT_SHADER_FRAGMENT = `precision lowp float;
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
