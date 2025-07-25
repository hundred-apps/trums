import type { ChecklistAttribute } from "./checklist"
import type { Inventory } from "./inventory"
import type { User } from "./user"

export type TemplateChecklist = {
    unique_id: string|null,
    name: string,
    is_hour_meter: boolean,
    is_kilo_meter: boolean,
    hour_meter: number,
    kilo_meter: number,
    meter: string[],
    version: number,
    created_at: number,
    updated_at: number,
    created_by: number,
    template_checklist_item: TemplateChecklistItem[],
    template_checklist_inventory: TemplateInventories[],
    people?: User,
}

export type TemplateChecklistItem = {
    unique_id: string|null,
    template_checklist_id: string|null,
    checklist_id: string,
    checklist: ChecklistAttribute|null,
    checklist_name: string,
    checklist_version: number,
    is_new?: boolean,
}

export type TemplateInventories = {
    unique_id: string|null,
    template_checklist_id: string|null,
    inventory_id: string|null,
    inventory_name: string,
    inventory_version: number,
    inventory: Inventory|null,
    is_new?: boolean,
    checked?: boolean,
}