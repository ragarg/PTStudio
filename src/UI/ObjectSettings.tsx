import { useState } from "react";
import { TYPE_MESH, TYPE_PLANE, TYPE_SPHERE, type ObjectData } from "@tsraycaster/pt-engine";
import Vector3Field from "./VectorField/Vector3Field";

interface ObjectSettingsProps {
    object: ObjectData | null;
    onPositionChange?: (position: Float32Array) => void;
    onScaleChange?: (scale: Float32Array) => void;
    onMaterialIndexChange?: (materialIndex: number) => void;
}

interface ObjectSettingsDraft {
    source: ObjectData;
    position: Float32Array;
    scale: Float32Array;
    materialIndex: number;
}

export default function ObjectSettings({
    object,
    onPositionChange,
    onScaleChange,
    onMaterialIndexChange,
}: ObjectSettingsProps) {
    const [draftState, setDraftState] = useState<ObjectSettingsDraft | null>(
        object ? {
            source: object,
            position: object.translation,
            scale: object.scale,
            materialIndex: object.materialIndex,
        } : null
    );
    const draft = object
        ? draftState?.source === object
            ? draftState
            : {
                source: object,
                position: object.translation,
                scale: object.scale,
                materialIndex: object.materialIndex,
            }
        : null;

    if (!object || !draft) {
        return <p className="section-hint">Выберите объект, чтобы настроить его свойства.</p>;
    }

    const objectType = object.primitiveType === TYPE_SPHERE
        ? "Сфера"
        : object.primitiveType === TYPE_PLANE
            ? "Плоскость"
            : object.primitiveType === TYPE_MESH
                ? "Mesh"
                : `Неизвестный тип (${object.primitiveType})`;

    const updatePosition = (index: number, value: number) => {
        const position = draft.position;
        position[index] = value;
        setDraftState({ ...draft, position });
        onPositionChange?.(position);
    };

    const updateScale = (index: number, value: number) => {
        const scale = draft.scale;
        scale[index] = value;
        setDraftState({ ...draft, scale });
        onScaleChange?.(scale);
    };

    const updateMaterialIndex = (value: number) => {
        const materialIndex = Math.max(0, Math.floor(value));
        setDraftState({ ...draft, materialIndex });
        onMaterialIndexChange?.(materialIndex);
    };

    return (
        <div className="object-settings">
            <dl className="object-settings__metadata">
                <div>
                    <dt>Тип</dt>
                    <dd>{objectType}</dd>
                </div>
                <div>
                    <dt>ID объекта</dt>
                    <dd>{object.id}</dd>
                </div>
            </dl>

            <label className="object-settings__field">
                <span>Индекс материала</span>
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={draft.materialIndex}
                    onChange={(event) => updateMaterialIndex(Number(event.currentTarget.value) || 0)}
                />
            </label>

            <fieldset className="object-settings__transform">
                <legend>Позиция</legend>
                <Vector3Field vec={draft.position} onValueChange={updatePosition}></Vector3Field>
                <legend>Масштаб</legend>
                <Vector3Field vec={draft.scale} onValueChange={updateScale}></Vector3Field>
            </fieldset>
        </div>
    );
}