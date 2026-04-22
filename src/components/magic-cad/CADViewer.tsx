'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewcube, Stage, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ── Simple OpenSCAD parser that creates Three.js geometry from code ──
// This covers the most common primitives and boolean operations
function parseScadToGeometry(scadCode: string): THREE.BufferGeometry {
  // Extract parameter values
  const params: Record<string, number> = {};
  const lines = scadCode.split('\n');
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\d.]+)\s*;/);
    if (match) {
      params[match[1]] = parseFloat(match[2]);
    }
  }

  // Helper: resolve a value that might be a variable name or number
  const resolve = (val: string): number => {
    const trimmed = val.trim();
    if (params[trimmed] !== undefined) return params[trimmed];
    const num = parseFloat(trimmed);
    return isNaN(num) ? 10 : num;
  };

  // Look for primitive calls — cube, sphere, cylinder
  const geometries: THREE.BufferGeometry[] = [];
  const code = scadCode.replace(/\/\/[^\n]*/g, ''); // strip comments

  // Match cube([x,y,z]) or cube(size)
  const cubeRegex = /cube\s*\(\s*\[\s*([^,\]]+)\s*,\s*([^,\]]+)\s*,\s*([^,\]]+)\s*\]/g;
  let m: RegExpExecArray | null;
  while ((m = cubeRegex.exec(code)) !== null) {
    const w = resolve(m[1]);
    const h = resolve(m[2]);
    const d = resolve(m[3]);
    geometries.push(new THREE.BoxGeometry(w, h, d));
  }

  const cubeSimple = /cube\s*\(\s*([a-zA-Z_][\w]*|\d+\.?\d*)\s*[,)]/g;
  while ((m = cubeSimple.exec(code)) !== null) {
    // Skip if already matched by array version
    const size = resolve(m[1]);
    geometries.push(new THREE.BoxGeometry(size, size, size));
  }

  // Match sphere(r=X) or sphere(d=X) or sphere(X)
  const sphereRegex = /sphere\s*\(\s*(?:r\s*=\s*)?([a-zA-Z_][\w]*|\d+\.?\d*)\s*[,)]/g;
  while ((m = sphereRegex.exec(code)) !== null) {
    const r = resolve(m[1]);
    geometries.push(new THREE.SphereGeometry(r, 32, 32));
  }

  const sphereDRegex = /sphere\s*\(\s*d\s*=\s*([a-zA-Z_][\w]*|\d+\.?\d*)\s*[,)]/g;
  while ((m = sphereDRegex.exec(code)) !== null) {
    const d = resolve(m[1]);
    geometries.push(new THREE.SphereGeometry(d / 2, 32, 32));
  }

  // Match cylinder(h=X, r=Y) or cylinder(h=X, r1=Y, r2=Z) or cylinder(h, r)
  const cylRegex = /cylinder\s*\([^)]*h\s*=\s*([a-zA-Z_][\w]*|\d+\.?\d*)[^)]*r\s*=\s*([a-zA-Z_][\w]*|\d+\.?\d*)/g;
  while ((m = cylRegex.exec(code)) !== null) {
    const h = resolve(m[1]);
    const r = resolve(m[2]);
    geometries.push(new THREE.CylinderGeometry(r, r, h, 32));
  }

  const cylR1R2 = /cylinder\s*\([^)]*h\s*=\s*([a-zA-Z_][\w]*|\d+\.?\d*)[^)]*r1\s*=\s*([a-zA-Z_][\w]*|\d+\.?\d*)[^)]*r2\s*=\s*([a-zA-Z_][\w]*|\d+\.?\d*)/g;
  while ((m = cylR1R2.exec(code)) !== null) {
    const h = resolve(m[1]);
    const r1 = resolve(m[2]);
    const r2 = resolve(m[3]);
    geometries.push(new THREE.CylinderGeometry(r2, r1, h, 32));
  }

  // If no recognized primitives, create a default cube based on params
  if (geometries.length === 0) {
    const w = params['width'] || params['w'] || params['size'] || params['length'] || 30;
    const h = params['height'] || params['h'] || params['size'] || 30;
    const d = params['depth'] || params['d'] || params['size'] || params['thickness'] || 20;
    geometries.push(new THREE.BoxGeometry(w, h, d));
  }

  // Merge all geometries
  if (geometries.length === 1) {
    const geo = geometries[0];
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }

  // Simple merge: offset each geometry slightly
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];

  geometries.forEach((geo, i) => {
    geo.computeVertexNormals();
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    const offset = i * 0.01; // tiny offset to avoid z-fighting

    for (let j = 0; j < pos.count; j++) {
      positions.push(pos.getX(j) + offset, pos.getY(j), pos.getZ(j));
      normals.push(norm.getX(j), norm.getY(j), norm.getZ(j));
    }
  });

  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.center();
  merged.computeVertexNormals();
  return merged;
}

// ── Rotating model component ──
function Model({ geometry, color }: { geometry: THREE.BufferGeometry; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.3}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

// ── Grid floor ──
function GridFloor() {
  return (
    <gridHelper
      args={[200, 20, '#1e1e3a', '#1e1e3a']}
      position={[0, -50, 0]}
    />
  );
}

// ── Main CADViewer component ──
export default function CADViewer({ scadCode }: { scadCode: string }) {
  const [modelColor] = useState('#6366f1');

  const geometry = useMemo(() => {
    try {
      return parseScadToGeometry(scadCode);
    } catch {
      return new THREE.BoxGeometry(20, 20, 20);
    }
  }, [scadCode]);

  // Compute bounding box to set camera distance
  const cameraDistance = useMemo(() => {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    if (!bb) return 100;
    const size = new THREE.Vector3();
    bb.getSize(size);
    return Math.max(size.x, size.y, size.z) * 2.5;
  }, [geometry]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows>
        <color attach="background" args={['#0f0f1a']} />
        <fog attach="fog" args={['#0f0f1a', cameraDistance * 2, cameraDistance * 5]} />

        <PerspectiveCamera
          makeDefault
          position={[cameraDistance * 0.7, cameraDistance * 0.5, cameraDistance * 0.7]}
          fov={45}
          near={0.1}
          far={cameraDistance * 10}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[50, 80, 50]} intensity={1.2} castShadow color="#e0e7ff" />
        <directionalLight position={[-30, 40, -30]} intensity={0.3} color="#818cf8" />
        <directionalLight position={[0, -20, 40]} intensity={0.2} color="#06b6d4" />
        <pointLight position={[0, 60, 0]} intensity={0.5} color="#c084fc" />

        <Stage environment={null} intensity={0.3}>
          <Model geometry={geometry} color={modelColor} />
        </Stage>

        <GridFloor />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={cameraDistance * 0.3}
          maxDistance={cameraDistance * 4}
        />

        <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
          <GizmoViewcube />
        </GizmoHelper>
      </Canvas>

      {/* Info overlay */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 16,
          display: 'flex',
          gap: 8,
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            fontSize: '0.65rem',
            color: '#a5b4fc',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Live Preview
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.2)',
            fontSize: '0.65rem',
            color: '#67e8f9',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Three.js
        </div>
      </div>
    </div>
  );
}
