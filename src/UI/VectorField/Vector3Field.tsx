import { useCallback } from "react";
import Value from "./Value";
import styles from './VectorField.module.css';

export interface Vector3FieldProps {
    vec: Float32Array,
    onValueChange?: (index:number, value: number) => void;
}

export default function Vector3Field({
    vec,
    onValueChange
}: Vector3FieldProps) {
    const x = +vec[0].toFixed(4);
    const y = +vec[1].toFixed(4);
    const z = +vec[2].toFixed(4);
    const XChange = useCallback((value: number) => {
        onValueChange?.(0, value);
    }, [onValueChange]);
    const YChange = useCallback((value: number) => {
        onValueChange?.(1, value);
    }, [onValueChange]);
    const ZChange = useCallback((value: number) => {
        onValueChange?.(2, value);
    }, [onValueChange]);
    return (
        <div className={styles.vector3Field}>
            <Value label={"x"} value={x} onValueChange={XChange}></Value>
            <Value label={"y"} value={y} onValueChange={YChange}></Value>
            <Value label={"z"} value={z} onValueChange={ZChange}></Value>
        </div>
    );
}