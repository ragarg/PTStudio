import { Circle, Layers3, Square, Triangle } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import styles from "./LeftPanel.module.css";

export default function LeftPanel() {
  const objects = useEditorStore((state) => state.objects);
  const selectedId = useEditorStore((state) => state.selectedId);
  const select = useEditorStore((state) => state.select);
  const objectList = Array.from(objects.values());

  return (
    <aside className={styles.outliner} aria-label="Список объектов сцены">
      <header className={styles.header}>
        <Layers3 size={17} aria-hidden="true" />
        <h2>Outliner</h2>
      </header>

      <div className={styles.objectTree} role="list" aria-label="Объекты сцены">
        {objectList.length > 0 ? objectList.map((object) => {
          const Icon = object.primitiveType === 0
            ? Circle
            : object.primitiveType === 1
              ? Square
              : Triangle;
          const isSelected = object.UUID === selectedId;

          return (
            <button
              key={object.UUID}
              className={`${styles.objectRow}${isSelected ? ` ${styles.selected}` : ""}`}
              type="button"
              role="listitem"
              aria-pressed={isSelected}
              onClick={() => select(object.UUID)}
            >
              <Icon className={styles.objectIcon} size={16} aria-hidden="true" />
              <span className={styles.objectName}>{object.name}</span>
            </button>
          );
        }) : (
          <p className={styles.emptyState}>Объекты загружаются…</p>
        )}
      </div>

      <footer className={styles.footer}>
        {objectList.length} {objectList.length === 1 ? "объект" : "объектов"}
      </footer>
    </aside>
  );
}
