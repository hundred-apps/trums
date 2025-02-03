import type { CheckboxValueType } from "element-plus"

export type SelectionCellProps = {
    value: boolean
    intermediate?: boolean
    onChange: (value: CheckboxValueType) => void
}