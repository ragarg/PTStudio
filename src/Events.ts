import { useEffect, type RefObject } from 'react';
import type RenderBridge from './core/worker/RenderBridge';

const CAMERA_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'KeyQ', 'KeyE', 'Space',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

export default function useEventRetranslation(
  bridgeRef: RefObject<RenderBridge | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  ready: boolean,
) {
  useEffect(() => {
    const bridge = bridgeRef.current;
    const canvas = canvasRef.current;
    if (!ready || !bridge || !canvas) return;

    const keyDown = (e: KeyboardEvent) => {
      if (CAMERA_KEYS.has(e.code)) e.preventDefault();
      bridge.sendInput({
        eventType: 'keydown',
        code: e.code,
        key: e.key,
      });
    };

    const keyUp = (e: KeyboardEvent) => {
      bridge.sendInput({
        eventType: 'keyup',
        code: e.code,
        key: e.key,
      });
    };

    const sendPointerEvent = (eventType: 'mousedown' | 'mousemove' | 'mouseup', e: PointerEvent) => {
      bridge.sendInput({
        eventType,
        coord: { x: e.clientX, y: e.clientY },
        button: e.button,
      });
    };

    const pointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      sendPointerEvent('mousedown', e);
    };
    const pointerMove = (e: PointerEvent) => sendPointerEvent('mousemove', e);
    const pointerUp = (e: PointerEvent) => {
      sendPointerEvent('mouseup', e);
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      bridge.sendResize({
        eventType: 'resize',
        width,
        height,
        dpr: window.devicePixelRatio,
      });
    });

    resizeObserver.observe(canvas);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      resizeObserver.disconnect();
    };
  }, [bridgeRef, canvasRef, ready]);
}