import { useState } from 'react';
import type { RenderMode } from '../worker/RenderBridge';

export default function RenderTypeSelector({ onModeChange }: { onModeChange: (mode: RenderMode) => void }) {
    const [renderMode, setRenderMode] = useState(0);
    return (
        <section className="editor-section render-controls">
          <h2>Рендеринг</h2>
          <button
            className="secondary-button"
            // disabled={!ready}
            onClick={() => {
              const nextMode = renderMode === 0 ? 1 : 0;
              setRenderMode(nextMode);
              onModeChange(nextMode);
            }}
          >
            Интегратор: {renderMode === 0 ? 'Albedo': 'PT'}
          </button>
        </section>
    );
  }