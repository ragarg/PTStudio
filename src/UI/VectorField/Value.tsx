interface ValueProps {
    label: string;
    value: number,
    onValueChange?: (value: number) => void;
}

export default function Value({
    label,
    value,
    onValueChange
}: ValueProps) {
    const valueChange = (value: number) => {
        onValueChange?.(value);
    }
    return (
        <label aria-label={`label`}>
            <span aria-hidden="true">{label}</span>
            <input
                type="number"
                step="0.001"
                value={value}
                onChange={(event) => {
                    const value = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(value)) valueChange(value);
                }}
            />
        </label>
    );
}