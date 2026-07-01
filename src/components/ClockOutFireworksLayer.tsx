import React, { useEffect, useRef } from "react";

interface ClockOutFireworksLayerProps {
  isMobile: boolean;
}

interface LaunchState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  radius: number;
  color: string;
  trail: Array<{x: number; y: number}>;
}

interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  alpha: number;
}

interface FireworkConfig {
  launchIntervalMinMs: number;
  launchIntervalMaxMs: number;
  burstRadiusMin: number;
  burstRadiusMax: number;
  launchRadius: number;
  particleCountMin: number;
  particleCountMax: number;
  maxLaunches: number;
  maxParticles: number;
  gravity: number;
  launchSpeedMin: number;
  launchSpeedMax: number;
}

interface CanvasBounds {
  width: number;
  height: number;
  dpr: number;
}

const PALETTE = ["#fff4dc", "#ffbe7a", "#ffd45c", "#f6b1a2", "#ff8e7f"];
const DESKTOP_CONFIG: FireworkConfig = {
  launchIntervalMinMs: 760,
  launchIntervalMaxMs: 1720,
  burstRadiusMin: 112,
  burstRadiusMax: 188,
  launchRadius: 2.8,
  particleCountMin: 12,
  particleCountMax: 18,
  maxLaunches: 2,
  maxParticles: 84,
  gravity: 38,
  launchSpeedMin: 460,
  launchSpeedMax: 620,
};
const MOBILE_CONFIG: FireworkConfig = {
  launchIntervalMinMs: 980,
  launchIntervalMaxMs: 1880,
  burstRadiusMin: 68,
  burstRadiusMax: 122,
  launchRadius: 2.4,
  particleCountMin: 7,
  particleCountMax: 11,
  maxLaunches: 1,
  maxParticles: 40,
  gravity: 46,
  launchSpeedMin: 360,
  launchSpeedMax: 510,
};
const TARGET_FRAME_MS = 1000 / 24;
const INITIAL_BOUNDS: CanvasBounds = {
  width: 0,
  height: 0,
  dpr: 1,
};

export const ClockOutFireworksLayer: React.FC<ClockOutFireworksLayerProps> = ({
  isMobile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const hiddenRef = useRef(false);
  const boundsRef = useRef<CanvasBounds>(INITIAL_BOUNDS);

  useEffect(() => {
    const hostElement = hostRef.current;
    const canvasElement = canvasRef.current;
    if (!hostElement || !canvasElement) {
      return;
    }

    const context = canvasElement.getContext("2d");
    if (!context) {
      return;
    }

    const config = isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
    const launches: LaunchState[] = [];
    const particles: ParticleState[] = [];
    let animationFrameId = 0;
    let lastFrameAt = performance.now();
    let motionTimeMs = 0;
    let nextLaunchAt = 0;
    let sceneWasActive = false;

    const updateCanvasBounds = () => {
      const width = hostElement.clientWidth;
      const height = hostElement.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.25);
      boundsRef.current = {width, height, dpr};
      canvasElement.width = Math.max(1, Math.round(width * dpr));
      canvasElement.height = Math.max(1, Math.round(height * dpr));
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleVisibilityChange = () => {
      hiddenRef.current = document.visibilityState !== "visible";
      lastFrameAt = performance.now();
    };

    const queueNextLaunch = (baseTimeMs: number, extraDelayMs = 0) => {
      nextLaunchAt =
        baseTimeMs +
        extraDelayMs +
        randomBetween(config.launchIntervalMinMs, config.launchIntervalMaxMs);
    };

    const createParticle = (
      x: number,
      y: number,
      speed: number,
      angle: number,
      color: string,
      radius: number,
      life: number,
    ): ParticleState => ({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      radius,
      color,
      alpha: 1,
    });

    const spawnBurst = (x: number, y: number, color: string) => {
      const burstRadius = randomBetween(config.burstRadiusMin, config.burstRadiusMax);
      const particleCount = randomInt(config.particleCountMin, config.particleCountMax);

      for (let index = 0; index < particleCount; index += 1) {
        if (particles.length >= config.maxParticles) {
          break;
        }
        const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.12;
        const speed = burstRadius * randomBetween(0.72, 1.08);
        particles.push(
          createParticle(
            x,
            y,
            speed,
            angle,
            color,
            randomBetween(isMobile ? 1.4 : 1.8, isMobile ? 2.2 : 3),
            randomBetween(680, 1040),
          ),
        );
      }
    };

    const createLaunch = () => {
      if (launches.length >= config.maxLaunches) {
        return;
      }

      const {width, height} = boundsRef.current;
      if (width <= 0 || height <= 0) {
        return;
      }

      let targetX = randomBetween(width * 0.12, width * 0.88);
      let targetY = randomBetween(height * 0.12, height * 0.48);
      if (targetX > width - 128 && targetY < 112) {
        targetX = randomBetween(width * 0.12, width * 0.62);
        targetY = randomBetween(height * 0.16, height * 0.48);
      }

      const startX = clamp(targetX + randomBetween(-52, 52), 24, width - 24);
      const startY = height + randomBetween(22, 60);
      const durationMs = randomBetween(260, 520);
      const vy = -randomBetween(config.launchSpeedMin, config.launchSpeedMax);
      const vx = (targetX - startX) / (durationMs / 1000);

      launches.push({
        x: startX,
        y: startY,
        vx,
        vy,
        targetY,
        radius: config.launchRadius,
        color: PALETTE[randomInt(0, PALETTE.length - 1)],
        trail: [],
      });
    };

    const drawFrame = () => {
      const {width, height} = boundsRef.current;
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        if (particle.alpha <= 0) {
          continue;
        }

        context.globalAlpha = particle.alpha * 0.88;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      launches.forEach((launch) => {
        if (launch.trail.length > 1) {
          context.globalAlpha = 0.56;
          context.strokeStyle = launch.color;
          context.lineWidth = isMobile ? 1.6 : 2;
          context.beginPath();
          context.moveTo(launch.trail[0].x, launch.trail[0].y);
          for (let index = 1; index < launch.trail.length; index += 1) {
            context.lineTo(launch.trail[index].x, launch.trail[index].y);
          }
          context.stroke();
        }

        context.globalAlpha = 0.22;
        context.fillStyle = launch.color;
        context.beginPath();
        context.arc(launch.x, launch.y, launch.radius * 2.8, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = 0.96;
        context.beginPath();
        context.arc(launch.x, launch.y, launch.radius, 0, Math.PI * 2);
        context.fill();
      });

      context.shadowBlur = 0;
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (hiddenRef.current) {
        lastFrameAt = now;
        animationFrameId = window.requestAnimationFrame(tick);
        return;
      }

      const elapsedMs = now - lastFrameAt;
      if (elapsedMs < TARGET_FRAME_MS) {
        animationFrameId = window.requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = Math.min(elapsedMs / 1000, 0.05);
      lastFrameAt = now;
      motionTimeMs += elapsedMs;

      if (motionTimeMs >= nextLaunchAt) {
        createLaunch();
        if (!isMobile && Math.random() < 0.12) {
          queueNextLaunch(motionTimeMs, randomBetween(160, 280));
        } else {
          queueNextLaunch(motionTimeMs);
        }
      }

      for (let index = launches.length - 1; index >= 0; index -= 1) {
        const launch = launches[index];
        launch.x += launch.vx * deltaSeconds;
        launch.y += launch.vy * deltaSeconds;
        launch.trail.push({x: launch.x, y: launch.y});
        if (launch.trail.length > 5) {
          launch.trail.shift();
        }

        if (launch.y <= launch.targetY) {
          spawnBurst(launch.x, launch.y, launch.color);
          launches.splice(index, 1);
        }
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= elapsedMs;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }
        particle.vx *= 0.984;
        particle.vy = particle.vy * 0.984 + config.gravity * deltaSeconds;
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        const decay = clamp01(particle.life / particle.maxLife);
        particle.alpha = decay * decay * 0.96;
      }

      const sceneIsActive = launches.length > 0 || particles.length > 0;
      if (sceneIsActive) {
        drawFrame();
      } else if (sceneWasActive) {
        const {width, height} = boundsRef.current;
        context.clearRect(0, 0, width, height);
      }
      sceneWasActive = sceneIsActive;

      animationFrameId = window.requestAnimationFrame(tick);
    };

    updateCanvasBounds();
    handleVisibilityChange();
    queueNextLaunch(0, randomBetween(160, 320));
    const resizeObserver = new ResizeObserver(updateCanvasBounds);
    resizeObserver.observe(hostElement);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMobile]);

  return (
    <div
      ref={hostRef}
      data-layout="clockout-modal-fireworks-layer"
      className="absolute inset-0 z-[5] overflow-hidden pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-[0.92]"
        aria-hidden="true"
      />
    </div>
  );
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}
