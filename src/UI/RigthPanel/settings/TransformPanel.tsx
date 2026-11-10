import Vector3Field from "../../VectorField/Vector3Field";
import { useEditorStore } from "../../../stores/editorStore";
import styles from "./SettingsFields.module.css";

export default function TransformPanel() {
    const selectedId = useEditorStore((s) => s.selectedId);
    const position = useEditorStore((s) =>
        selectedId ? s.transform?.translation ?? null : null
    );
    const scale = useEditorStore((s) =>
        selectedId ? s.transform?.scale ?? null : null
    );

    const setPosition = useEditorStore((s) => s.setPosition);
    const setScale = useEditorStore((s) => s.setScale);

    if (!selectedId || !position || !scale) {
        return <p className={styles.hint}>Выберите объект, чтобы настроить его свойства.</p>;
    }


    return (
        <div className={styles.objectSettings}>
            <fieldset className={styles.transform}>
                <legend>Позиция</legend>
                <Vector3Field
                    vec={position}
                    onValueChange={(index, value) => setPosition(index, value)}
                />
                <legend>Масштаб</legend>
                <Vector3Field
                    vec={scale}
                    onValueChange={(index, value) => setScale(index, value)}
                />
            </fieldset>
        </div>
    );
}