import type { JSX } from "vue/jsx-runtime";

export type KanbanProp = {
    name: string;
    tasks: (() => JSX.Element)[];
    onDrop: (event: DragEvent) => void
}