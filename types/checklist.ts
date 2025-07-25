export type ChecklistAttribute = {
    unique_id: string|null,
    name: string,
    value_type: string,
    version: number,
    checked?: boolean,
    maintenance_options: ChecklistOptionAttribute[],
    
}

export type ChecklistOptionAttribute = {unique_id: string|null, checklist_id: string|null, value: string, is_new?: boolean};

export enum ValueType {
    Text = 'text',
    Option = 'option',
    Select = 'select',
    MultiSelect = 'multi_select',
    File = 'file',

    TextName = 'Text',
    OptionName = 'Option',
    SelectName = 'Select',
    MultiSelectName = 'Multi Select',
    FileName = 'File',
} 
  