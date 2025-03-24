<template>
    <ElCheckbox
        
        :model-value="props.value"
        :indeterminate="props.interminate"
        @change="onChange"
    />
</template>


<script lang="ts" setup>
import type { CheckboxValueType } from 'element-plus';

    const props = defineProps<{
        value: boolean,
        interminate?: boolean,
        onChange: (val: CheckboxValueType) => void
    }>()

</script>