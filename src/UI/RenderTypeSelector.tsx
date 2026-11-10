import { useEditorStore } from '../stores/editorStore';
import styles from './RenderTypeSelector.module.css';

export default function RenderTypeSelector() {
    const ready = useEditorStore((state) => state.ready);
    const renderMode = useEditorStore((state) => state.renderMode);
    const setRenderMode = useEditorStore((state) => state.setRenderMode);
    return (
        <section className={styles.renderControls}>
          <h3 className={styles.title}>Интегратор</h3>
          <button
            className={styles.toggle}
            disabled={!ready}
            aria-pressed={renderMode === 1}
            onClick={() => {
              const nextMode = renderMode === 0 ? 1 : 0;
              setRenderMode(nextMode);
            }}
          >
            {renderMode === 0 ? 'Albedo' : 'Path tracing'}
          </button>
        </section>
    );
  }