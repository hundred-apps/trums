<template>
    
        <ElTag v-if="props.status == 'draft'" type='info'>{{props.status.toUpperCase()}}</ElTag>
        <ElTag v-else-if="props.status == 'waiting'" type='warning'>{{props.status.toUpperCase()}}</ElTag>
        <ElTag v-else-if="props.status == 'approve'" type='success'>{{props.status.toUpperCase()}}</ElTag>
        <ElTag v-else-if="props.status == 'done'" type='primary'>{{props.status.toUpperCase()}}</ElTag>
        <ElTag v-else-if="props.status == 'cancelled'"type='danger'>{{props.status.toUpperCase()}}</ElTag>
        <ElTag v-else type='info'>{{props.status.toUpperCase()}}</ElTag>
</template>

<script lang="tsx" setup>
import { ElTag } from 'element-plus';

const props = defineProps({
    status: {
        type: String,
        required: true,
    }
});

</script>