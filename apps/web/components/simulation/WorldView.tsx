"use client";

import { useEffect, useRef } from "react";

import { DEMO_SCENARIO } from "../../lib/demo-scenario";

export type WorldCameraMode = "fps" | "tps";

interface WorldViewProps {
  mode: WorldCameraMode;
  player: { east: number; north: number };
  fov: number;
  reducedMotion: boolean;
  replayActive: boolean;
}

export function WorldView({
  mode,
  player,
  fov,
  reducedMotion,
  replayActive,
}: WorldViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let stopped = false;
    let animationFrame = 0;
    let renderer: import("three").WebGLRenderer | null = null;

    Promise.all([import("three"), import("cesium")]).then(([THREE, Cesium]) => {
      if (stopped) {
        return;
      }
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x07131e);
      scene.fog = new THREE.Fog(0x07131e, 450, 1_800);

      const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 3_000);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      const origin = Cesium.Cartesian3.fromDegrees(
        DEMO_SCENARIO.center.longitude,
        DEMO_SCENARIO.center.latitude,
      );
      const enu = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const inverseEnu = Cesium.Matrix4.inverse(enu, new Cesium.Matrix4());
      const targetFixed = Cesium.Cartesian3.fromDegrees(
        DEMO_SCENARIO.evacuationTarget.longitude,
        DEMO_SCENARIO.evacuationTarget.latitude,
      );
      const targetLocal = Cesium.Matrix4.multiplyByPoint(
        inverseEnu,
        targetFixed,
        new Cesium.Cartesian3(),
      );

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1_800, 1_800),
        new THREE.MeshStandardMaterial({ color: 0x182431, roughness: 0.96 }),
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x354453 });
      for (let index = -2; index <= 2; index += 1) {
        const horizontal = new THREE.Mesh(
          new THREE.BoxGeometry(1_400, 0.25, 15),
          roadMaterial,
        );
        horizontal.position.set(0, 0.2, index * 160);
        scene.add(horizontal);
        const vertical = new THREE.Mesh(
          new THREE.BoxGeometry(15, 0.25, 1_400),
          roadMaterial,
        );
        vertical.position.set(index * 190, 0.2, 0);
        scene.add(vertical);
      }

      const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x8292a0 });
      for (let row = -3; row <= 3; row += 1) {
        for (let column = -3; column <= 3; column += 1) {
          if (Math.abs(row) <= 2 && Math.abs(column) <= 2 && (row + column) % 3 === 0) {
            continue;
          }
          const height = 35 + ((row * row + column * column) % 4) * 18;
          const building = new THREE.Mesh(
            new THREE.BoxGeometry(72, height, 68),
            buildingMaterial,
          );
          building.position.set(column * 190 + 80, height / 2, -(row * 160 + 70));
          scene.add(building);
        }
      }

      const target = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 11, 55, 18),
        new THREE.MeshStandardMaterial({ color: 0xcdf68b }),
      );
      target.position.set(targetLocal.x, 27.5, -targetLocal.y);
      scene.add(target);

      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(1_800, 1_000),
        new THREE.MeshStandardMaterial({
          color: 0x287da0,
          transparent: true,
          opacity: replayActive ? 0.42 : 0,
          roughness: 0.3,
        }),
      );
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, replayActive ? 1.4 : -2, 430);
      scene.add(water);

      scene.add(new THREE.HemisphereLight(0xc9e9ff, 0x182028, 2.4));
      const sun = new THREE.DirectionalLight(0xffffff, 2.5);
      sun.position.set(-300, 700, -400);
      scene.add(sun);

      function resize() {
        if (!canvas || !renderer) {
          return;
        }
        const width = Math.max(canvas.clientWidth, 1);
        const height = Math.max(canvas.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }

      function render() {
        if (stopped || !renderer) {
          return;
        }
        resize();
        const y = mode === "fps" ? 1.72 : 22;
        const back = mode === "fps" ? 0 : 38;
        camera.position.set(player.east, y, -player.north + back);
        camera.lookAt(player.east, mode === "fps" ? 1.65 : 3, -player.north - 45);
        if (replayActive && !reducedMotion) {
          water.position.y = 1.4 + Math.sin(performance.now() / 900) * 0.12;
        }
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(render);
      }

      render();
    });

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
      renderer?.dispose();
    };
  }, [fov, mode, player.east, player.north, reducedMotion, replayActive]);

  return (
    <div className="world-frame">
      <canvas className="world-canvas" ref={canvasRef} aria-label={`${mode.toUpperCase()} 3Dビュー`} />
      <div className="world-note">3D街区・津波水面はMVP用のillustrative fixture</div>
    </div>
  );
}
