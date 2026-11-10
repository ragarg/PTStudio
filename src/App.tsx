import { useEffect, useRef, type RefObject } from 'react';
import styles from './App.module.css';
import { useEditorStore } from './stores/editorStore';
import useEventRetranslation from './Events';
import RenderBridge from './core/worker/RenderBridge';
import RightPanel from './UI/RigthPanel/RightPanel';
import Status from './UI/StatusPanel/Status';
import LeftPanel from './UI/LeftPanel/LeftPanel';

function useBridgeInit(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const ready = useEditorStore((state) => state.ready);
  const attach = useEditorStore((state) => state.attach);
  const detach = useEditorStore((state) => state.detach);
  const bridgeRef = useRef<RenderBridge | null>(null);
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEventRetranslation(bridgeRef, canvasRef, ready);

  useEffect(() => {
    if (cleanupTimeoutRef.current !== null) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }

    let bridge = bridgeRef.current;
    if (!bridge) {
      const canvas = canvasRef.current;
      const canvasCell = canvas?.parentElement;
      if (!canvas || !canvasCell) {
        throw new Error('Canvas is unavailable during worker initialization.');
      }

      const bounds = canvasCell.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      canvas.width = width;
      canvas.height = height;
      const offscreenCanvas = canvas.transferControlToOffscreen();
      bridge = new RenderBridge();
      bridgeRef.current = bridge;
      attach(bridge);
      bridge.initialize(offscreenCanvas, width, height);
      
    } else {
      attach(bridge);
    }

    const activeBridge = bridge;
    return () => {
      cleanupTimeoutRef.current = setTimeout(() => {
        if (bridgeRef.current !== activeBridge) return;
        detach();
        bridgeRef.current = null;
        cleanupTimeoutRef.current = null;
      }, 0);
    };
  }, [attach, canvasRef, detach]);
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useEditorStore((state) => state.ready);
  const error = useEditorStore((state) => state.error);
  useBridgeInit(canvasRef);

  return (
    <div className={styles.appShell}>
      <main className={styles.workspace}>
        <LeftPanel />
        <section className={styles.canvasCell} aria-label="Область просмотра сцены">
          <header className={styles.canvasToolbar}>
            <h1>Viewport</h1>
            <span className={`${styles.viewportStatus}${error ? ` ${styles.isError}` : ready ? ` ${styles.isReady}` : ''}`}>
              {error ?? (ready ? 'Готово' : 'Загрузка')}
            </span>
          </header>
          <div className={styles.viewport}>
            <canvas ref={canvasRef} aria-label="3D-сцена" />
          </div>
        </section>
        <RightPanel />
      </main>
      <Status />
    </div>
  );
}
