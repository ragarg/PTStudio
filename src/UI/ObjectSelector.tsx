import Dropdown, { type Option } from "./Dropdown";
import { useEditorStore } from "../stores/editorStore";

export default function ObjectSelector() {

    const objects = useEditorStore((s) => s.objects);
    const selectedId = useEditorStore((s) => s.selectedId);
    const select = useEditorStore((s) => s.select);

    const options: Option[] = [];

    objects.forEach((object) => {
        options.push({
            value: object.UUID,
            label: object.name
        })
    });

    return (
        <Dropdown value={selectedId} onChange={select} options={options} />
    );
}