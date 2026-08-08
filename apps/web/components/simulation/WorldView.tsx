"use client";

import { useEffect, useRef } from "react";

import { DEMO_SCENARIO } from "../../lib/demo-scenario";

export type WorldCameraMode = "fps" | "tps";
export type WorldPhase =
  | "pre_event"
  | "shaking"
  | "evacuation"
  | "hazard_replay"
  | "resolved";

interface WorldViewProps {
  mode: WorldCameraMode;
  player: { east: number; north: number };
  fov: number;
  reducedMotion: boolean;
  replayActive: boolean;
  phase: WorldPhase;
  simulationTimeMs: number;
}

export function WorldView(props: WorldViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const activeCanvas = canvas;

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

      const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 3_000);
      renderer = new THREE.WebGLRenderer({ canvas: activeCanvas, antialias: true });
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

      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x182431,
        roughness: 0.96,
      });
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1_800, 1_800),
        groundMaterial,
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
      const damagedMaterial = new THREE.MeshStandardMaterial({ color: 0xa98270 });
      let damagedBuilding: import("three").Mesh | null = null;
      for (let row = -3; row <= 3; row += 1) {
        for (let column = -3; column <= 3; column += 1) {
          if (
            Math.abs(row) <= 2 &&
            Math.abs(column) <= 2 &&
            (row + column) % 3 === 0
          ) {
            continue;
          }
          const height = 35 + ((row * row + column * column) % 4) * 18;
          const isDamageFixture = row === 1 && column === -2;
          const building = new THREE.Mesh(
            new THREE.BoxGeometry(72, height, 68),
            isDamageFixture ? damagedMaterial : buildingMaterial,
          );
          building.position.set(
            column * 190 + 80,
            height / 2,
            -(row * 160 + 70),
          );
          if (isDamageFixture) {
            damagedBuilding = building;
          }
          scene.add(building);
        }
      }

      const target = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 11, 55, 18),
        new THREE.MeshStandardMaterial({ color: 0xcdf68b }),
      );
      target.position.set(targetLocal.x, 27.5, -targetLocal.y);
      scene.add(target);

      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(90, 4, 7),
        new THREE.MeshStandardMaterial({ color: 0xe09b69 }),
      );
      barrier.position.set(-145, 2.1, -5);
      barrier.visible = false;
      scene.add(barrier);

      const npcMaterial = new THREE.MeshStandardMaterial({ color: 0xd8e1e8 });
      const npcs = Array.from({ length: 18 }, (_, index) => {
        const npc = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.42, 1.05, 4, 8),
          npcMaterial,
        );
        const lane = index % 3;
        const row = Math.floor(index / 3);
        npc.userData.startEast = -250 + lane * 7;
        npc.userData.startNorth = -210 - row * 15;
        npc.userData.delayMs = index * 2_000;
        npc.position.set(
          npc.userData.startEast,
          1,
          -npc.userData.startNorth,
        );
        scene.add(npc);
        return npc;
      });

      const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x287da0,
        transparent: true,
        opacity: 0,
        roughness: 0.3,
      });
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(1_800, 1_000),
        waterMaterial,
      );
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -2, 430);
      scene.add(water);

      scene.add(new THREE.HemisphereLight(0xc9e9ff, 0x182028, 2.4));
      const sun = new THREE.DirectionalLight(0xffffff, 2.5);
      sun.position.set(-300, 700, -400);
      scene.add(sun);

      function resize() {
        if (!renderer) {
          return;
        }
        const width = Math.max(activeCanvas.clientWidth, 1);
        const height = Math.max(activeCanvas.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
      }

      function render() {
        if (stopped || !renderer) {
          return;
        }

        const current = propsRef.current;
        resize();
        camera.fov = current.fov;
        camera.updateProjectionMatrix();

        const eyeHeight = current.mode === "fps" ? 1.72 : 22;
        const cameraBack = current.mode === "fps" ? 0 : 38;
        camera.position.set(
          current.player.east,
          eyeHeight,
          -current.player.north + cameraBack,
        );
        camera.lookAt(
          current.player.east,
          current.mode === "fps" ? 1.65 : 3,
          -current.player.north - 45,
        );

        const afterShaking =
          current.phase === "evacuation" ||
          current.phase === "hazard_replay" ||
          current.phase === "resolved";
        if (damagedBuilding) {
          damagedBuilding.rotation.z =
            current.phase === "shaking" ? 0.035 : afterShaking ? 0.09 : 0;
        }
        barrier.visible = afterShaking;

        const evacuationElapsed = Math.max(current.simulationTimeMs - 60_000, 0);
        for (const npc of npcs) {
          const npcElapsed = Math.max(
            evacuationElapsed - Number(npc.userData.delayMs),
            0,
          );
          const progress = Math.min(npcElapsed / 360_000, 1);
          const startEast = Number(npc.userData.startEast);
          const startNorth = Number(npc.userData.startNorth);
          npc.position.x = startEast + (targetLocal.x - startEast) * progress;
          npc.position.z = -(startNorth + (targetLocal.y - startNorth) * progress);
        }

        waterMaterial.opacity = current.replayActive ? 0.42 : 0;
        water.position.y = current.replayActive ? 1.4 : -2;
        if (current.replayActive && !current.reducedMotion) {
          water.position.y += Math.sin(performance.now() / 900) * 0.12;
        }

        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(render);
      }

      render();
    });

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div className="world-frame">
      <canvas
        className="world-canvas"
        ref={canvasRef}
        role="img"
        aria-label={`${props.mode.toUpperCase()} 3Dビュー。街区・NPC・道路閉塞・津波水面はいずれもMVP用合成表現です。`}
      />
      <div className="world-note">
        3D街区・NPC・建物損傷・道路閉塞・津波水面はMVP用の合成/illustrative fixture
      </div>
    </div>
  );
}
