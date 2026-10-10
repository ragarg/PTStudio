import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import RenderTypeSelector from './UI/RenderTypeSelector';
import ObjectSelector from './UI/ObjectSelector';
import useEventRetranslation from './Events';
import ObjectSettings from './UI/ObjectSettings';
import type { ObjectData } from '@tsraycaster/pt-engine';
import RenderBridge from './worker/RenderBridge';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bridgeRef = useRef<RenderBridge | null>(null);
  const bridgeCleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [selectObjectID, setSelectObjectID] = useState<number | null>(null);
  const [selectObject, setSelectObject] = useState<ObjectData | null>(null);
  const [workerError, setWorkerError] = useState<string | null>(null);
  useEventRetranslation(bridgeRef, canvasRef, ready);

  const setObjectCb = useCallback((value: number) => {
    bridgeRef.current?.getObject(value);
    setSelectObjectID(value);
  }, []);

  const onPositionChange = useCallback((position: Float32Array) => {
    if (selectObjectID !== null) bridgeRef.current?.setPosition(selectObjectID, position);
  }, [selectObjectID]);

  const onScaleChange = useCallback((scale: Float32Array) => {
    if (selectObjectID !== null) bridgeRef.current?.setScale(selectObjectID, scale);
  }, [selectObjectID]);

  const onMaterialIndexChange = useCallback((materialIndex: number) => {
    if (selectObjectID !== null) bridgeRef.current?.setMaterial(selectObjectID, materialIndex);
  }, [selectObjectID]);

  useEffect(() => {
    if (bridgeCleanupTimeoutRef.current !== null) {
      clearTimeout(bridgeCleanupTimeoutRef.current);
      bridgeCleanupTimeoutRef.current = null;
    }

    const scheduleBridgeCleanup = (bridge: RenderBridge) => {
      bridgeCleanupTimeoutRef.current = setTimeout(() => {
        if (bridgeRef.current === bridge) {
          bridge.terminate();
          bridgeRef.current = null;
        }
        bridgeCleanupTimeoutRef.current = null;
      }, 0);
    };

    let bridge = bridgeRef.current;
    let shouldInitialize = false;
    let initializationCanvas: HTMLCanvasElement | null = null;
    let width = 0;
    let height = 0;
    if (!bridge) {
      const canvas = canvasRef.current;
      const canvasCell = canvas?.parentElement;
      if (!canvas || !canvasCell) return;

      const bounds = canvasCell.getBoundingClientRect();
      width = Math.max(1, Math.floor(bounds.width));
      height = Math.max(1, Math.floor(bounds.height));
      canvas.width = width;
      canvas.height = height;
      initializationCanvas = canvas;

      bridge = new RenderBridge();
      bridgeRef.current = bridge;
      shouldInitialize = true;
    }

    const currentBridge = bridge;
    const unsubscribe = currentBridge.subscribe((event) => {
      if (event.type === 'error') {
        setWorkerError(event.error.message);
        console.error('[RenderBridge]', event.error);
        return;
      }

      switch (event.type) {
        case 'ready':
          setReady(true);
          setWorkerError(null);
          currentBridge.render();
          currentBridge.getObjects();
          return;
        case 'objectLoaded':
          currentBridge.getObjects();
          return;
        case 'setObjects':
          setObjects(event.objects);
          return;
        case 'setObject':
          setSelectObject(event.object);
          return;
      }
    });
    if (shouldInitialize) {
      if (!initializationCanvas) throw new Error('Canvas is unavailable during worker initialization.');
      currentBridge.initialize(
        initializationCanvas.transferControlToOffscreen(),
        width,
        height,
      );
      
    }

    return () => {
      unsubscribe();
      scheduleBridgeCleanup(currentBridge);
    };
  }, []);

  return (
    <div className="app-shell">
      <main className="canvas-cell" aria-label="Область просмотра сцены">
        <canvas
          ref={canvasRef}
          aria-label="3D-сцена"
        />
      </main>

      <aside className="editor-panel" aria-label="Панель редактора">
        <header className="editor-header">
          <div>
            <p className="eyebrow">TS RAYCASTER</p>
            <h1>Редактор сцены</h1>
          </div>
          <span className={`status-indicator${workerError ? ' is-error' : ready ? ' is-ready' : ''}`} role={workerError ? 'alert' : undefined}>
            {workerError ?? (ready ? 'Готово' : 'Загрузка')}
          </span>
        </header>

        <section className="editor-section">
          <h2>Объекты</h2>
          <div className="editor-placeholder">
            <span className="placeholder-icon" aria-hidden="true">＋</span>
            <p>Настройки объектов сцены появятся здесь</p>
            <ObjectSelector objects={objects} onChange={setObjectCb}></ObjectSelector>
          </div>
        </section>

        <RenderTypeSelector onModeChange={(mode) => bridgeRef.current?.setMode(mode)}></RenderTypeSelector>

        <section className="editor-section properties-section">
          <h2>Параметры</h2>
          <ObjectSettings object={selectObject} onPositionChange={onPositionChange} onScaleChange={onScaleChange} onMaterialIndexChange={onMaterialIndexChange}></ObjectSettings>
        </section>
      </aside>

      <footer className="status-bar" aria-label="Строка состояния редактора">
        <div className="status-bar-group">
          <span className={`status-dot${ready ? ' is-ready' : ''}`} aria-hidden="true" />
          <span>{ready ? 'Сцена готова' : 'Инициализация сцены'}</span>
          <span className="status-divider" aria-hidden="true" />
          {/* <span>Интегратор: {renderMode === 0 ? 'PT' : 'BDPT'}</span> */}
        </div>
        <div className="status-bar-group controls-hint">
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> перемещение</span>
          <span><kbd>Q</kbd>/<kbd>E</kbd> высота</span>
          <span>Перетаскивание мышью — обзор</span>
        </div>
      </footer>
    </div>
  );
}