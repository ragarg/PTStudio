import Vector3Field from "../../VectorField/Vector3Field";
import { useEditorStore } from "../../../stores/editorStore";
import Dropdown, { type Option } from "../../Dropdown";
import styles from "./SettingsFields.module.css";
import Value from "../../VectorField/Value";

export default function MaterialPanel() {
    const selectedId = useEditorStore((s) => s.selectedId);
    const materialUUID = useEditorStore((s) =>
        selectedId ? s.objects.get(selectedId)?.materialUUID ?? null : null
    );
    const materials = useEditorStore((s) => s.materials);
    const materialParams = useEditorStore((s) =>
        selectedId ? s.materialParams ?? null : null
    );
    const setMaterialParams = useEditorStore((s) => s.setMaterialParams);
    const getMateriaParams = useEditorStore((s) => s.getMateriaParams);
    const selectMaterial = useEditorStore((s) => s.setMaterial);

    const options: Option[] = Array.from(materials.values(), (mat) => ({
            value: mat.UUID,
            label: mat.name
    }));

    const updateVector = (key: "albedo" | "emission", index: number, value: number) => {
        if (!materialParams) return;

        const vector = new Float32Array(materialParams[key]);
        vector[index] = value;
        setMaterialParams({ ...materialParams, [key]: vector });
    };

    const updateScalar = (
        key: "metallic" | "roughnessX" | "roughnessY" | "transmission" | "ior",
        value: number
    ) => {
        if (!materialParams) return;
        setMaterialParams({ ...materialParams, [key]: value });
    };

    if (!selectedId || !materialUUID) {
        return <p className={styles.hint}>Выберите объект, чтобы настроить его свойства.</p>;
    }

    return (
        <div className={styles.objectSettings}>
            <label className={styles.field}>
                <span>Материал</span>
                <Dropdown
                    value={materialUUID}
                    onChange={(value) => {
                        if (value !== null) {
                            selectMaterial(value);
                            getMateriaParams(value);
                        }
                    }}
                    options={options}
                />
            </label>

            <fieldset className={styles.transform}>
                <legend>Albedo</legend>
                <Vector3Field
                    vec={materialParams?.albedo ?? new Float32Array([1, 1, 1])}
                    onValueChange={(index, value) => updateVector("albedo", index, value)}
                />
                <legend>Emissive</legend>
                <Vector3Field
                    vec={materialParams?.emission ?? new Float32Array([0, 0, 0])}
                    onValueChange={(index, value) => updateVector("emission", index, value)}
                />
                <legend>Ior</legend>
                <Value
                    label=""
                    value={materialParams?.ior ?? 0}
                    onValueChange={(value) => updateScalar("ior", value)}
                />
                <legend>Metallic</legend>
                <Value
                    label=""
                    value={materialParams?.metallic ?? 0}
                    onValueChange={(value) => updateScalar("metallic", value)}
                />
                <legend>RoughnessX</legend>
                <Value
                    label=""
                    value={materialParams?.roughnessX ?? 0}
                    onValueChange={(value) => updateScalar("roughnessX", value)}
                />
                <legend>RoughnessY</legend>
                <Value
                    label=""
                    value={materialParams?.roughnessY ?? 0}
                    onValueChange={(value) => updateScalar("roughnessY", value)}
                />
                <legend>Transmission</legend>
                <Value
                    label=""
                    value={materialParams?.transmission ?? 0}
                    onValueChange={(value) => updateScalar("transmission", value)}
                />
            </fieldset>
        </div>
    );
}