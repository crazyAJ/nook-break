import React, { useEffect, useMemo, useRef } from "react";
import {
  type ClockOutAnimalKey,
  getClockOutAnimalSpriteUrl,
  getShuffledClockOutAnimalKeys,
  preloadClockOutAnimalSprites,
} from "../lib/clockOutAnimalSprites";
import { getEventPoint, observeElementRect } from "../lib/browserCompat";

interface ClockOutCelebrationSceneProps {
  isMobile: boolean;
}

type ActorMode = "queue" | "interactive" | "returning";

type ReturnState =
  | null
  | {
      kind: "snap";
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      startedAt: number;
      durationMs: number;
      targetProgress: number;
    }
  | {
      kind: "fall";
      vy: number;
      floorY: number;
      targetX: number;
      targetProgress: number;
    };

interface ActorState {
  id: number;
  slotIndex: number;
  key: ClockOutAnimalKey;
  progress: number;
  speed: number;
  edgePadding: number;
  size: number;
  mode: ActorMode;
  swapState: {
    startedAt: number;
    nextKey: ClockOutAnimalKey;
    nextSize: number;
  } | null;
  returnState: ReturnState;
  manualX: number;
  manualY: number;
  currentX: number;
  currentY: number;
  facingScale: number;
}

interface SceneBounds {
  width: number;
  height: number;
}

interface ProjectionResult {
  x: number;
  y: number;
  progress: number;
  distance: number;
}

interface DragState {
  actorId: number;
  pointerId: number | null;
  source: "pointer" | "mouse" | "touch";
  offsetX: number;
  offsetY: number;
}

const DESKTOP_VISIBLE_COUNT = 6;
const MOBILE_VISIBLE_COUNT = 3;
const DESKTOP_SPEED = 0.03;
const MOBILE_SPEED = 0.037;
const DESKTOP_EDGE_PADDING = 60;
const MOBILE_EDGE_PADDING = 42;
const DESKTOP_SIZE_PATTERN = [84, 90, 86, 92];
const MOBILE_SIZE_PATTERN = [64, 68, 66];
const DESKTOP_START_GAP = 0.068;
const MOBILE_START_GAP = 0.11;
const DESKTOP_REVEAL_DELAY_MS = 920;
const MOBILE_REVEAL_DELAY_MS = 1180;
const SWAP_INTERVAL_MS = 5000;
const TRANSITION_DURATION_MS = 760;
const ROTATE_Y_PERSPECTIVE_PX = 760;
const SNAP_DURATION_MS = 180;
const FALL_GRAVITY = 2800;
const INITIAL_BOUNDS: SceneBounds = {
  width: 0,
  height: 0,
};

export const ClockOutCelebrationScene: React.FC<ClockOutCelebrationSceneProps> = ({
  isMobile,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slotWrapperRefs = useRef<Array<HTMLDivElement | null>>([]);
  const slotFlipperRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frontImageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const backImageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const boundsRef = useRef<SceneBounds>(INITIAL_BOUNDS);
  const sequence = useMemo(() => getShuffledClockOutAnimalKeys(), []);
  const visibleCount = isMobile ? MOBILE_VISIBLE_COUNT : DESKTOP_VISIBLE_COUNT;
  const renderSlots = useMemo(
    () => Array.from({length: visibleCount}, (_, index) => index),
    [visibleCount],
  );

  useEffect(() => {
    void preloadClockOutAnimalSprites();
  }, []);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement || sequence.length === 0) {
      return;
    }

    const speed = isMobile ? MOBILE_SPEED : DESKTOP_SPEED;
    const edgePadding = isMobile ? MOBILE_EDGE_PADDING : DESKTOP_EDGE_PADDING;
    const sizePattern = isMobile ? MOBILE_SIZE_PATTERN : DESKTOP_SIZE_PATTERN;
    const startGap = isMobile ? MOBILE_START_GAP : DESKTOP_START_GAP;
    const revealDelayMs = isMobile ? MOBILE_REVEAL_DELAY_MS : DESKTOP_REVEAL_DELAY_MS;

    let actors: ActorState[] = [];
    let queueActorIds: number[] = [];
    let nextSequenceIndex = 0;
    let nextActorId = 0;
    let nextStartProgress = 0.06;
    let motionTimeMs = 0;
    let nextRevealAt = 0;
    let nextSwapAt = Number.POSITIVE_INFINITY;
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let dragState: DragState | null = null;
    let skipNextSwapTick = false;

    const getActorById = (actorId: number) =>
      actors.find((actor) => actor.id === actorId) ?? null;

    const getActorBySlot = (slotIndex: number) =>
      actors.find((actor) => actor.slotIndex === slotIndex) ?? null;

    const updateBounds = () => {
      boundsRef.current = {
        width: containerElement.clientWidth,
        height: containerElement.clientHeight,
      };
    };

    const removeFromQueue = (actorId: number) => {
      queueActorIds = queueActorIds.filter((id) => id !== actorId);
      if (queueActorIds.length === 0) {
        nextSwapAt = Number.POSITIVE_INFINITY;
      }
    };

    const insertIntoQueueByProgress = (actorId: number, progress: number) => {
      const actor = getActorById(actorId);
      if (!actor) {
        return;
      }

      removeFromQueue(actorId);

      if (queueActorIds.length === 0) {
        queueActorIds = [actorId];
        nextSwapAt = motionTimeMs + SWAP_INTERVAL_MS;
        return;
      }

      let insertAfterIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      queueActorIds.forEach((queueActorId, index) => {
        const queueActor = getActorById(queueActorId);
        if (!queueActor) {
          return;
        }
        const distance = normalizeProgress(queueActor.progress - progress);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          insertAfterIndex = index;
        }
      });

      queueActorIds.splice(insertAfterIndex + 1, 0, actorId);
      if (nextSwapAt === Number.POSITIVE_INFINITY) {
        nextSwapAt = motionTimeMs + SWAP_INTERVAL_MS;
      } else if (nextSwapAt <= motionTimeMs) {
        skipNextSwapTick = true;
      }
    };

    const rejoinActorImmediately = (
      actor: ActorState,
      projection: ProjectionResult,
    ) => {
      actor.mode = "queue";
      actor.returnState = null;
      actor.swapState = null;
      actor.progress = projection.progress;
      actor.manualX = projection.x;
      actor.manualY = projection.y;
      actor.currentX = projection.x;
      actor.currentY = projection.y;
      insertIntoQueueByProgress(actor.id, projection.progress);
    };

    const beginSnapReturn = (actor: ActorState, projection: ProjectionResult, now: number) => {
      actor.mode = "returning";
      actor.swapState = null;
      actor.returnState = {
        kind: "snap",
        fromX: actor.manualX,
        fromY: actor.manualY,
        toX: projection.x,
        toY: projection.y,
        startedAt: now,
        durationMs: SNAP_DURATION_MS,
        targetProgress: projection.progress,
      };
    };

    const beginFallReturn = (actor: ActorState) => {
      const floorProjection = getBottomEdgeProjection(
        actor.manualX,
        boundsRef.current.width,
        boundsRef.current.height,
        actor.edgePadding,
      );
      actor.mode = "returning";
      actor.swapState = null;
      actor.returnState = {
        kind: "fall",
        vy: 0,
        floorY: floorProjection.y,
        targetX: floorProjection.x,
        targetProgress: floorProjection.progress,
      };
    };

    const releaseInteractiveActor = (actor: ActorState, now: number) => {
      const {width, height} = boundsRef.current;
      if (width <= 0 || height <= 0) {
        return;
      }
      const nearestEdge = projectPointToPerimeter(
        actor.manualX,
        actor.manualY,
        width,
        height,
        actor.edgePadding,
      );

      if (nearestEdge.distance > actor.size) {
        beginFallReturn(actor);
        return;
      }

      beginSnapReturn(actor, nearestEdge, now);
    };

    const enterInteractiveActor = (actor: ActorState) => {
      if (actor.mode !== "queue") {
        return;
      }
      removeFromQueue(actor.id);
      actor.mode = "interactive";
      actor.swapState = null;
      actor.returnState = null;
      actor.manualX = actor.currentX;
      actor.manualY = actor.currentY;
    };

    const updateActorManualPosition = (actor: ActorState, nextX: number, nextY: number) => {
      const clampedPosition = clampToSafeBounds(
        nextX,
        nextY,
        actor.size,
        boundsRef.current.width,
        boundsRef.current.height,
      );
      actor.manualX = clampedPosition.x;
      actor.manualY = clampedPosition.y;
    };

    const beginActorInteraction = (
      actor: ActorState,
      point: {clientX: number; clientY: number},
      source: DragState["source"],
      pointerId: number | null,
    ) => {
      if (actor.mode === "queue") {
        enterInteractiveActor(actor);
      }

      const interactiveActor = getActorById(actor.id);
      if (!interactiveActor || interactiveActor.mode !== "interactive") {
        return false;
      }

      dragState = {
        actorId: interactiveActor.id,
        pointerId,
        source,
        offsetX: point.clientX - interactiveActor.manualX,
        offsetY: point.clientY - interactiveActor.manualY,
      };
      return true;
    };

    const updateDraggedActor = (point: {clientX: number; clientY: number}) => {
      if (!dragState) {
        return false;
      }

      const actor = getActorById(dragState.actorId);
      if (!actor || actor.mode !== "interactive") {
        return false;
      }

      updateActorManualPosition(
        actor,
        point.clientX - dragState.offsetX,
        point.clientY - dragState.offsetY,
      );
      return true;
    };

    const finishActorInteraction = (now: number) => {
      if (!dragState) {
        return false;
      }

      const actor = getActorById(dragState.actorId);
      dragState = null;
      if (!actor || actor.mode !== "interactive") {
        return false;
      }

      releaseInteractiveActor(actor, now);
      return true;
    };

    const spawnActor = () => {
      const key = sequence[nextSequenceIndex];
      const size = sizePattern[nextActorId % sizePattern.length];
      const slotIndex = actors.length;
      if (slotIndex >= visibleCount) {
        return;
      }

      const actor: ActorState = {
        id: nextActorId,
        slotIndex,
        key,
        progress: nextStartProgress,
        speed,
        edgePadding,
        size,
        mode: "queue",
        swapState: null,
        returnState: null,
        manualX: 0,
        manualY: 0,
        currentX: 0,
        currentY: 0,
        facingScale: 1,
      };

      actors = [...actors, actor];
      queueActorIds.push(actor.id);
      nextActorId += 1;
      nextSequenceIndex = (nextSequenceIndex + 1) % sequence.length;
      nextStartProgress = normalizeProgress(nextStartProgress - startGap);
    };

    const startQueueSwap = (motionNow: number) => {
      const headActorId = queueActorIds[0];
      if (headActorId === undefined) {
        nextSwapAt = Number.POSITIVE_INFINITY;
        return;
      }

      const headActor = getActorById(headActorId);
      if (!headActor || headActor.mode !== "queue" || headActor.swapState !== null) {
        return;
      }

      const nextKey = sequence[nextSequenceIndex];
      const nextSize = sizePattern[nextActorId % sizePattern.length];
      nextActorId += 1;
      nextSequenceIndex = (nextSequenceIndex + 1) % sequence.length;

      headActor.swapState = {
        startedAt: motionNow,
        nextKey,
        nextSize,
      };
      nextSwapAt = motionNow + SWAP_INTERVAL_MS;
    };

    const attachInteractionHandlers = () => {
      const cleanups: Array<() => void> = [];

      slotWrapperRefs.current.forEach((wrapperElement, slotIndex) => {
        if (!wrapperElement) {
          return;
        }

        const handleMouseEnter = (event: MouseEvent) => {
          if (isMobile || event.buttons !== 0) {
            return;
          }
          const actor = getActorBySlot(slotIndex);
          if (!actor || actor.mode !== "queue") {
            return;
          }
          enterInteractiveActor(actor);
        };

        const handleMouseLeave = () => {
          if (isMobile) {
            return;
          }
          const actor = getActorBySlot(slotIndex);
          if (!actor || actor.mode !== "interactive") {
            return;
          }
          if (dragState?.actorId === actor.id) {
            return;
          }
          const projection = projectPointToPerimeter(
            actor.manualX,
            actor.manualY,
            boundsRef.current.width,
            boundsRef.current.height,
            actor.edgePadding,
          );
          rejoinActorImmediately(actor, projection);
        };

        const handleMouseDown = (event: MouseEvent) => {
          const actor = getActorBySlot(slotIndex);
          const point = getEventPoint(event);
          if (!actor || point === null) {
            return;
          }

          if (beginActorInteraction(actor, point, "mouse", null)) {
            event.preventDefault();
          }
        };

        const handleTouchStart = (event: TouchEvent) => {
          const actor = getActorBySlot(slotIndex);
          const point = getEventPoint(event);
          if (!actor || point === null) {
            return;
          }

          if (beginActorInteraction(actor, point, "touch", null)) {
            event.preventDefault();
          }
        };

        const handlePointerDown = (event: PointerEvent) => {
          if (event.pointerType === "mouse" || event.pointerType === "touch") {
            return;
          }

          const actor = getActorBySlot(slotIndex);
          const point = getEventPoint(event);
          if (!actor || point === null) {
            return;
          }

          if (beginActorInteraction(actor, point, "pointer", event.pointerId)) {
            try {
              wrapperElement.setPointerCapture(event.pointerId);
            } catch {
              // Safari 对 capture 支持不稳定，失败时继续走 window 级事件托底。
            }
            event.preventDefault();
          }
        };

        wrapperElement.addEventListener("mouseenter", handleMouseEnter);
        wrapperElement.addEventListener("mouseleave", handleMouseLeave);
        wrapperElement.addEventListener("mousedown", handleMouseDown);
        wrapperElement.addEventListener("touchstart", handleTouchStart, {passive: false});
        wrapperElement.addEventListener("pointerdown", handlePointerDown);

        cleanups.push(() => {
          wrapperElement.removeEventListener("mouseenter", handleMouseEnter);
          wrapperElement.removeEventListener("mouseleave", handleMouseLeave);
          wrapperElement.removeEventListener("mousedown", handleMouseDown);
          wrapperElement.removeEventListener("touchstart", handleTouchStart);
          wrapperElement.removeEventListener("pointerdown", handlePointerDown);
        });
      });

      const handleMouseMove = (event: MouseEvent) => {
        if (!dragState || dragState.source !== "mouse") {
          return;
        }

        const point = getEventPoint(event);
        if (point === null) {
          return;
        }

        if (updateDraggedActor(point)) {
          event.preventDefault();
        }
      };

      const handleMouseUp = () => {
        if (!dragState || dragState.source !== "mouse") {
          return;
        }
        finishActorInteraction(performance.now());
      };

      const handleTouchMove = (event: TouchEvent) => {
        if (!dragState || dragState.source !== "touch") {
          return;
        }

        const point = getEventPoint(event);
        if (point === null) {
          return;
        }

        if (updateDraggedActor(point)) {
          event.preventDefault();
        }
      };

      const handleTouchEndOrCancel = () => {
        if (!dragState || dragState.source !== "touch") {
          return;
        }
        finishActorInteraction(performance.now());
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (
          !dragState ||
          dragState.source !== "pointer" ||
          dragState.pointerId !== event.pointerId
        ) {
          return;
        }

        const point = getEventPoint(event);
        if (point === null) {
          return;
        }

        if (updateDraggedActor(point)) {
          event.preventDefault();
        }
      };

      const handlePointerEndOrCancel = (event: PointerEvent) => {
        if (
          !dragState ||
          dragState.source !== "pointer" ||
          dragState.pointerId !== event.pointerId
        ) {
          return;
        }
        finishActorInteraction(performance.now());
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, {passive: false});
      window.addEventListener("touchend", handleTouchEndOrCancel);
      window.addEventListener("touchcancel", handleTouchEndOrCancel);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerEndOrCancel);
      window.addEventListener("pointercancel", handlePointerEndOrCancel);

      cleanups.push(() => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEndOrCancel);
        window.removeEventListener("touchcancel", handleTouchEndOrCancel);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEndOrCancel);
        window.removeEventListener("pointercancel", handlePointerEndOrCancel);
      });

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    };

    const updateActorStyles = (visualNow: number, motionNow: number) => {
      const {width, height} = boundsRef.current;
      const activeSlots = new Set<number>();

      actors.forEach((actor, index) => {
        const wrapperElement = slotWrapperRefs.current[actor.slotIndex];
        const flipperElement = slotFlipperRefs.current[actor.slotIndex];
        const frontImageElement = frontImageRefs.current[actor.slotIndex];
        const backImageElement = backImageRefs.current[actor.slotIndex];
        if (!wrapperElement || !flipperElement || !frontImageElement || !backImageElement) {
          return;
        }
        activeSlots.add(actor.slotIndex);

        let displayX = actor.manualX;
        let displayY = actor.manualY;
        let facingScale = actor.facingScale;

        if (actor.mode === "queue") {
          const frame = getPerimeterFrame(
            actor.progress,
            width,
            height,
            actor.edgePadding,
          );
          const bobOffset =
            Math.sin(visualNow / 220 + index * 0.9) * (isMobile ? 2 : 3);
          displayX = frame.x;
          displayY = frame.y + bobOffset;
          facingScale = frame.directionX < 0 ? -1 : 1;
        }

        actor.currentX = displayX;
        actor.currentY = displayY;
        actor.facingScale = facingScale;

        const visualState = getActorVisualState(
          actor,
          motionNow,
          visualNow,
          dragState?.actorId === actor.id,
        );
        const currentSpriteKey =
          actor.swapState !== null && visualState.revealNextSprite
            ? actor.swapState.nextKey
            : actor.key;
        const currentSpriteSize =
          actor.swapState !== null && visualState.revealNextSprite
            ? actor.swapState.nextSize
            : actor.size;
        const currentSpriteUrl = getClockOutAnimalSpriteUrl(currentSpriteKey);
        const nextSpriteKey =
          actor.swapState !== null ? actor.swapState.nextKey : actor.key;
        const nextSpriteSize =
          actor.swapState !== null ? actor.swapState.nextSize : actor.size;
        const nextSpriteUrl = getClockOutAnimalSpriteUrl(nextSpriteKey);

        if (frontImageElement.dataset.spriteUrl !== currentSpriteUrl) {
          frontImageElement.src = currentSpriteUrl;
          frontImageElement.dataset.spriteUrl = currentSpriteUrl;
        }

        if (backImageElement.dataset.spriteUrl !== nextSpriteUrl) {
          backImageElement.src = nextSpriteUrl;
          backImageElement.dataset.spriteUrl = nextSpriteUrl;
        }

        const frontWidth = `${currentSpriteSize}px`;
        if (frontImageElement.style.width !== frontWidth) {
          frontImageElement.style.width = frontWidth;
        }

        const backWidth = `${nextSpriteSize}px`;
        if (backImageElement.style.width !== backWidth) {
          backImageElement.style.width = backWidth;
        }

        wrapperElement.style.opacity = "1";
        wrapperElement.style.visibility = "visible";
        wrapperElement.style.zIndex =
          dragState?.actorId === actor.id
            ? `${visibleCount * 4 + actor.id + 1}`
            : actor.mode === "queue"
            ? `${actor.slotIndex + 1}`
            : `${visibleCount * 2 + actor.id + 1}`;
        wrapperElement.style.transform =
          `translate3d(${displayX}px, ${displayY}px, 0) translate(-50%, -50%) scaleX(${facingScale})`;
        wrapperElement.style.cursor =
          actor.mode === "interactive" ? (dragState?.actorId === actor.id ? "grabbing" : "grab") : "default";
        flipperElement.style.opacity = "1";
        flipperElement.style.transform =
          `translate(-50%, -50%) rotate(${visualState.rotateDeg}deg) scale(${visualState.scale}) rotateY(${visualState.rotateYDeg}deg)`;
      });

      slotWrapperRefs.current.forEach((wrapperElement, slotIndex) => {
        if (!wrapperElement || activeSlots.has(slotIndex)) {
          return;
        }

        wrapperElement.style.opacity = "0";
        wrapperElement.style.visibility = "hidden";
        wrapperElement.style.zIndex = "0";
      });
    };

    const animate = (now: number) => {
      if (disposed) {
        return;
      }

      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      motionTimeMs += deltaSeconds * 1000;

      let completedSwapActorId: number | null = null;
      const rejoinQueueItems: Array<{id: number; progress: number}> = [];

      actors = actors.map((actor) => {
        if (actor.mode === "queue") {
            const nextProgress = normalizeProgress(
            actor.progress + deltaSeconds * actor.speed,
          );

          if (actor.swapState === null) {
            return {
              ...actor,
              progress: nextProgress,
            };
          }

          const swapElapsedMs = motionTimeMs - actor.swapState.startedAt;
          const hasCompletedSwap = swapElapsedMs >= TRANSITION_DURATION_MS;

          if (hasCompletedSwap) {
            completedSwapActorId = actor.id;
          }

          return {
            ...actor,
            progress: nextProgress,
            key: hasCompletedSwap ? actor.swapState.nextKey : actor.key,
            size: hasCompletedSwap ? actor.swapState.nextSize : actor.size,
            swapState: hasCompletedSwap ? null : actor.swapState,
          };
        }

        if (actor.returnState?.kind === "snap") {
          const snapProgress = clamp01(
            (now - actor.returnState.startedAt) / actor.returnState.durationMs,
          );
          const easedProgress = easeOutCubic(snapProgress);
          const nextManualX = lerp(actor.returnState.fromX, actor.returnState.toX, easedProgress);
          const nextManualY = lerp(actor.returnState.fromY, actor.returnState.toY, easedProgress);

          if (snapProgress >= 1) {
            rejoinQueueItems.push({
              id: actor.id,
              progress: actor.returnState.targetProgress,
            });
            return {
              ...actor,
              mode: "queue",
              progress: actor.returnState.targetProgress,
              returnState: null,
              manualX: actor.returnState.toX,
              manualY: actor.returnState.toY,
              currentX: actor.returnState.toX,
              currentY: actor.returnState.toY,
            };
          }

          return {
            ...actor,
            manualX: nextManualX,
            manualY: nextManualY,
            currentX: nextManualX,
            currentY: nextManualY,
          };
        }

        if (actor.returnState?.kind === "fall") {
          const nextVy = actor.returnState.vy + FALL_GRAVITY * deltaSeconds;
          const nextManualY = Math.min(
            actor.returnState.floorY,
            actor.manualY + nextVy * deltaSeconds,
          );

          if (nextManualY >= actor.returnState.floorY) {
            rejoinQueueItems.push({
              id: actor.id,
              progress: actor.returnState.targetProgress,
            });
            return {
              ...actor,
              mode: "queue",
              progress: actor.returnState.targetProgress,
              returnState: null,
              manualX: actor.returnState.targetX,
              manualY: actor.returnState.floorY,
              currentX: actor.returnState.targetX,
              currentY: actor.returnState.floorY,
            };
          }

          return {
            ...actor,
            manualX: actor.returnState.targetX,
            manualY: nextManualY,
            currentX: actor.returnState.targetX,
            currentY: nextManualY,
            returnState: {
              ...actor.returnState,
              vy: nextVy,
            },
          };
        }

        return actor;
      });

      rejoinQueueItems.forEach((item) => {
        insertIntoQueueByProgress(item.id, item.progress);
      });

      if (completedSwapActorId !== null) {
        removeFromQueue(completedSwapActorId);
        queueActorIds.push(completedSwapActorId);
      }

      while (actors.length < visibleCount && motionTimeMs >= nextRevealAt) {
        spawnActor();
        nextRevealAt += revealDelayMs;
      }

      if (queueActorIds.length > 0 && nextSwapAt === Number.POSITIVE_INFINITY) {
        nextSwapAt = motionTimeMs + SWAP_INTERVAL_MS;
      }

      if (queueActorIds.length > 0 && motionTimeMs >= nextSwapAt) {
        if (skipNextSwapTick) {
          skipNextSwapTick = false;
          nextSwapAt = motionTimeMs + SWAP_INTERVAL_MS;
        } else {
          startQueueSwap(motionTimeMs);
        }
      }

      updateActorStyles(now, motionTimeMs);
      frameId = window.requestAnimationFrame(animate);
    };

    const stopObservingBounds = observeElementRect(containerElement, updateBounds);
    const detachPointerHandlers = attachInteractionHandlers();

    slotWrapperRefs.current.forEach((wrapperElement) => {
      if (!wrapperElement) {
        return;
      }

      wrapperElement.style.opacity = "0";
      wrapperElement.style.visibility = "hidden";
    });

    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      stopObservingBounds();
      detachPointerHandlers();
      slotWrapperRefs.current = [];
      slotFlipperRefs.current = [];
      frontImageRefs.current = [];
      backImageRefs.current = [];
    };
  }, [isMobile, sequence, visibleCount]);

  return (
    <div
      ref={containerRef}
      data-layout="clockout-modal-sprite-scene"
      className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
    >
      {renderSlots.map((slotIndex) => (
        <div
          key={`clockout-slot-${slotIndex}`}
          ref={(element) => {
            slotWrapperRefs.current[slotIndex] = element;
          }}
          className="absolute left-0 top-0 select-none will-change-transform pointer-events-auto touch-none"
          style={{
            visibility: "hidden",
            opacity: 0,
            perspective: `${ROTATE_Y_PERSPECTIVE_PX}px`,
            touchAction: "none",
          }}
        >
          <div
            ref={(element) => {
              slotFlipperRefs.current[slotIndex] = element;
            }}
            className="absolute left-1/2 top-1/2 will-change-transform [transform-style:preserve-3d]"
            style={{
              opacity: 1,
              transform: "translate(-50%, -50%) rotate(0deg) scale(1) rotateY(0deg)",
            }}
          >
            <img
              ref={(element) => {
                frontImageRefs.current[slotIndex] = element;
              }}
              alt=""
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 select-none will-change-transform [backface-visibility:hidden]"
              style={{
                width: 0,
                maxWidth: "none",
                transform: "translate(-50%, -50%) rotateY(0deg)",
              }}
              draggable={false}
            />
            <img
              ref={(element) => {
                backImageRefs.current[slotIndex] = element;
              }}
              alt=""
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 select-none will-change-transform [backface-visibility:hidden]"
              style={{
                width: 0,
                maxWidth: "none",
                transform: "translate(-50%, -50%) rotateY(180deg)",
              }}
              draggable={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

function normalizeProgress(value: number) {
  return ((value % 1) + 1) % 1;
}

function getActorVisualState(
  actor: ActorState,
  now: number,
  visualNow: number,
  isDragging: boolean,
) {
  let scale = 1;
  let rotateDeg = 0;
  let rotateYDeg = 0;
  let revealNextSprite = false;

  if (actor.mode === "interactive") {
    const sway = Math.sin(visualNow / 110 + actor.id * 0.75);
    scale = 1.18 + Math.abs(Math.sin(visualNow / 180 + actor.id * 0.35)) * 0.03;
    if (isDragging) {
      scale += 0.02;
    }
    rotateDeg = sway * (isDragging ? 12 : 9);
  }

  if (actor.swapState !== null) {
    const swapProgress = clamp01(
      (now - actor.swapState.startedAt) / TRANSITION_DURATION_MS,
    );
    const easedProgress = easeInOutCubic(swapProgress);
    const pinch = Math.sin(Math.PI * easedProgress);
    scale *= 1 - pinch * 0.04;
    rotateDeg += Math.sin(easedProgress * Math.PI * 2) * 4;
    rotateYDeg = easedProgress * 900;
    revealNextSprite = rotateYDeg >= 180;
  }

  return {
    scale,
    rotateDeg,
    rotateYDeg,
    revealNextSprite,
  };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function clampToSafeBounds(
  x: number,
  y: number,
  size: number,
  width: number,
  height: number,
) {
  const inset = size / 2;
  return {
    x: clamp(x, inset, Math.max(inset, width - inset)),
    y: clamp(y, inset, Math.max(inset, height - inset)),
  };
}

function getPerimeterFrame(
  progress: number,
  width: number,
  height: number,
  padding: number,
) {
  const left = padding;
  const right = Math.max(left, width - padding);
  const top = padding;
  const bottom = Math.max(top, height - padding);
  const horizontal = Math.max(1, right - left);
  const vertical = Math.max(1, bottom - top);
  const perimeter = horizontal * 2 + vertical * 2;
  let distance = progress * perimeter;

  if (distance <= horizontal) {
    return {
      x: left + distance,
      y: top,
      directionX: 1,
    };
  }

  distance -= horizontal;
  if (distance <= vertical) {
    return {
      x: right,
      y: top + distance,
      directionX: 1,
    };
  }

  distance -= vertical;
  if (distance <= horizontal) {
    return {
      x: right - distance,
      y: bottom,
      directionX: -1,
    };
  }

  distance -= horizontal;
  return {
    x: left,
    y: bottom - Math.min(distance, vertical),
    directionX: -1,
  };
}

function projectPointToPerimeter(
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
): ProjectionResult {
  const left = padding;
  const right = Math.max(left, width - padding);
  const top = padding;
  const bottom = Math.max(top, height - padding);
  const horizontal = Math.max(1, right - left);
  const vertical = Math.max(1, bottom - top);
  const perimeter = horizontal * 2 + vertical * 2;

  const projectedTopX = clamp(x, left, right);
  const projectedRightY = clamp(y, top, bottom);
  const projectedBottomX = clamp(x, left, right);
  const projectedLeftY = clamp(y, top, bottom);

  const candidates = [
    {
      x: projectedTopX,
      y: top,
      progress: (projectedTopX - left) / perimeter,
    },
    {
      x: right,
      y: projectedRightY,
      progress: (horizontal + (projectedRightY - top)) / perimeter,
    },
    {
      x: projectedBottomX,
      y: bottom,
      progress:
        (horizontal + vertical + (right - projectedBottomX)) / perimeter,
    },
    {
      x: left,
      y: projectedLeftY,
      progress:
        (horizontal + vertical + horizontal + (bottom - projectedLeftY)) /
        perimeter,
    },
  ];

  return candidates.reduce<ProjectionResult>((best, candidate) => {
    const distance = Math.hypot(x - candidate.x, y - candidate.y);
    if (distance < best.distance) {
      return {
        ...candidate,
        distance,
      };
    }
    return best;
  }, {
    x: candidates[0].x,
    y: candidates[0].y,
    progress: candidates[0].progress,
    distance: Math.hypot(x - candidates[0].x, y - candidates[0].y),
  });
}

function getBottomEdgeProjection(
  x: number,
  width: number,
  height: number,
  padding: number,
): ProjectionResult {
  const left = padding;
  const right = Math.max(left, width - padding);
  const top = padding;
  const bottom = Math.max(top, height - padding);
  const horizontal = Math.max(1, right - left);
  const vertical = Math.max(1, bottom - top);
  const perimeter = horizontal * 2 + vertical * 2;
  const projectedX = clamp(x, left, right);

  return {
    x: projectedX,
    y: bottom,
    progress: (horizontal + vertical + (right - projectedX)) / perimeter,
    distance: 0,
  };
}
