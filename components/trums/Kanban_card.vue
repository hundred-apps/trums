<template>
    <el-card class=" border border-gray-200 rounded-lg cursor-move shadow-sm hover:shadow-md transition-shadow" draggable="true" @dragstart="onDragHandler" >
        <div class="flex items-center justify-between mb-2">
            <span :class="priorityClass(priority)">
                {{ priority }}
            </span>
            <span class="text-gray-400 text-sm">{{ due }}</span>
        </div>
            <h3 class="font-medium mb-1 text-wrap">{{ title }}</h3>
        <div class="flex items-center">
            <img :src="assigneeImage" alt="Assignee" class="w-6 h-6 rounded-full">
            <span class="ml-2 text-sm text-gray-600">{{ assignee }}</span>
        </div>
    </el-card>
</template>
<script lang="ts" setup>
    import type { PropType } from 'vue';

    const props = defineProps({
        onDrag: {
            type: Function,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            required: true,
        },
        due: {
            type: String,
            required: true,
        },
        assignee: {
            type: String,
            required: true,
        },
        assigneeImage: {
            type: String,
            required: true,
        },
    })

    const onDragHandler = (event: DragEvent) => {
        props.onDrag(event);
    }

    const priorityClass = (priority: string) => {
        return {
        'px-2 py-1 text-xs font-semibold rounded': true,
        'bg-red-100 text-red-600': priority === 'High',
        'bg-yellow-100 text-yellow-600': priority === 'Medium',
        'bg-green-100 text-green-600': priority === 'Low',
        'bg-purple-100 text-purple-600': priority === 'Critical'
        };
    };
</script>