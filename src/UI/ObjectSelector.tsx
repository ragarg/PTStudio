import type { ObjectData } from "@tsraycaster/pt-engine";
import Dropdown, { type Option } from "./Dropdown";

interface ObjectSelectorProps {
    objects: ObjectData[],
    onChange: (value: number) => void;
    // defaultValue: number | null
}

export default function ObjectSelector({objects, onChange}: ObjectSelectorProps) {

    const options: Option[] = [];

    objects.forEach((object, i) => {
        options.push({
            value: i,
            label: object.name
        })
    });

    return (
        <div>
            <Dropdown value={null} onChange={onChange} options={options} />
        </div>
    );
}