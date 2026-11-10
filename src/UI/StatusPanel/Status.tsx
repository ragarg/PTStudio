import { useEditorStore } from "../../stores/editorStore";
import styles from "./Status.module.css";

export default function Status() {
  const ready = useEditorStore((state) => state.ready);
  const error = useEditorStore((state) => state.error);

  return (
    <footer className={styles.statusBar} aria-label="Строка состояния редактора">
      <div className={styles.statusMessage}>
        <span
          className={`${styles.statusDot}${ready ? ` ${styles.isReady}` : ""}${error ? ` ${styles.isError}` : ""}`}
          aria-hidden="true"
        />
        <span role={error ? "alert" : undefined}>
          {error ?? (ready ? "Сцена готова" : "Инициализация сцены")}
        </span>
      </div>
      <div className={styles.controlsHint} aria-label="Управление камерой">
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> перемещение</span>
        <span><kbd>Q</kbd>/<kbd>E</kbd> высота</span>
        <span>Перетаскивание мышью — обзор</span>
      </div>
    </footer>
  );
}
