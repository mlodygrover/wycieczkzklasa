import React, { Suspense, useRef, useMemo } from 'react';
// Usunięto import 'styled-components'
// Importy potrzebne dla LiquidDistortion
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Zaimportuj komponent, który stworzyliśmy wcześniej
// Usunięto import './LiquidDistortion' - kod zostanie wklejony poniżej

// --- Kod komponentu LiquidDistortion (wklejony) ---

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform sampler2D u_noiseTexture;
  uniform float u_time;
  uniform float u_distortionStrength;
  uniform vec2 u_resolution;
  uniform vec2 u_imageResolution;

  vec2 getCoverUv(vec2 uv, vec2 canvasRes, vec2 textureRes) {
    vec2 ratio = canvasRes / textureRes;
    float r = max(ratio.x, ratio.y);
    vec2 newUv = (uv - 0.5) * ratio / r + 0.5;
    return newUv;
  }

  void main() {
    vec2 noiseUv = (vUv * 0.2) + (u_time * 0.02);
    vec4 noise = texture2D(u_noiseTexture, noiseUv);
    vec2 distortion = vec2(noise.r, noise.g) * 2.0 - 1.0;
    distortion *= u_distortionStrength;
    vec2 coverUv = getCoverUv(vUv, u_resolution, u_imageResolution);
    vec2 distortedUv = coverUv + distortion;
    vec4 color = texture2D(u_texture, distortedUv);
    gl_FragColor = color;
  }
`;

// Scena dla LiquidDistortion
function Scene({ imageUrl, distortionStrength, noiseUrl }) {
  const shaderRef = useRef();
  const { size } = useThree();
  const texture = useTexture(imageUrl);
  const noiseTexture = useTexture(noiseUrl);
  noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_distortionStrength: { value: distortionStrength },
    u_texture: { value: texture },
    u_noiseTexture: { value: noiseTexture },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_imageResolution: { value: new THREE.Vector2(texture.image.width, texture.image.height) },
  }), [texture, noiseTexture, size, distortionStrength]);

  useFrame((state) => {
    const { clock } = state;
    if (shaderRef.current) {
      shaderRef.current.uniforms.u_time.value = clock.getElapsedTime();
      shaderRef.current.uniforms.u_resolution.value.set(size.width, size.height);
    }
  });

  return (
    <Plane args={[size.width, size.height]}>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </Plane>
  );
}

// Komponent LiquidDistortion
export const LiquidDistortion = ({ 
  imageUrl, 
  distortionStrength = 0.03 
}) => {
  // POPRAWKA: Poprzedni URL (storage.googleapis.com) wygasł lub jest niedostępny.
  // Zmieniono na stabilny zasób (mapa normalna wody) z oficjalnego repozytorium three.js,
  // który będzie działał tak samo dobrze jako tekstura "szumu" (noise).
  const noiseUrl = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_1_M_Normal.jpg";

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, borderRadius: 'inherit' }}>
      <Suspense fallback={null}>
        <Scene 
          imageUrl={imageUrl} 
          distortionStrength={distortionStrength}
          noiseUrl={noiseUrl}
        />
      </Suspense>
    </Canvas>
  );
};

// --- Koniec wklejonego kodu LiquidDistortion ---


// --- Obiekt stylów (zamiast styled-components) ---

const styles = {
  heroWrapper: {
    width: '100%',
    height: '600px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#111',
  },
  backgroundVideo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '100%',
    minHeight: '100%',
    width: 'auto',
    height: 'auto',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    objectFit: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    inset: '0',
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 2,
  },
  foregroundCard: {
    width: '300px',
    height: '600px',
    position: 'relative',
    zIndex: 3,
    overflow: 'hidden',
    borderRadius: '24px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    position: 'relative',
    zIndex: 10,
    padding: '1.5rem',
    color: 'white',
    textShadow: '0 1px 5px rgba(0,0,0,0.4)',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  }
};

// --- Główny Komponent ---

export function VideoHeroWithCard() {
  // Przykładowy, darmowy link do zapętlonego wideo
  const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-white-particles-moving-across-a-black-background-3907-large.mp4";
  
  // Przykładowy obrazek tła dla karty (LiquidDistortion)
  const imageUrl = "https://images.unsplash.com/photo-1541701494587-cb58502866ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

  return (
    <div style={styles.heroWrapper}>
      {/* --- WARSTWA 1: TŁO WIDEO --- */}
      <video
        style={styles.backgroundVideo}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline // Ważne dla poprawnego działania na iOS
      />
      <div style={styles.videoOverlay} />

      {/* --- WARSTWA 2: KARTA NA PIERWSZYM PLANIE --- */}
      <div style={styles.foregroundCard}>
        
        {/* WARSTWA 2a: TŁO KARTY (LiquidDistortion) */}
        <LiquidDistortion 
          imageUrl={imageUrl}
          distortionStrength={0.07} // Możesz dostosować siłę
        />

        {/* WARSTWA 2b: TREŚĆ KARTY (z-index: 10) */}
        <div style={styles.cardContent}>
          <h2>Karta na Wierzchu</h2>
          <p>To jest przykładowa treść.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            Tłem tej karty jest komponent LiquidDistortion, 
            podczas gdy tłem całej sekcji jest zapętlony film.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoHeroWithCard;

