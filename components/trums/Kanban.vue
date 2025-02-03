<template>
    <div class="overflow-x-auto whitespace-nowrap p-1 h-full">
            <div class="flex space-x-6 min-w-max h-full">
                <div 
                    v-for="(column, index) in columns" 
                    :key="index" 
                    class="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 w-72 " 
                    
                    @drop="column.onDrop" 
                    @dragover.prevent>
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-gray-700">{{ column.name }}</h2>
                        <span class="bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-sm">
                            {{ column.tasks.length }}
                        </span>
                    </div>
                    <div class="space-y-3 flex-shrink-0 overflow-y-auto" style="height: 70vh;">
                        <component
                            v-for="(task, taskIndex) in column.tasks"
                            :key="taskIndex"
                            :is="task"
                        />
                    </div>
                </div>
            </div>
        </div>
</template>
  
<script lang="ts" setup>
    import { ref } from 'vue';
    import type { JSX } from 'vue/jsx-runtime';
    import type { KanbanProp } from '~/types/kanban_prop';
    
    defineProps({
        columns: {
            type: Array as () => Array<KanbanProp>,
            required: true,
        },
    });

    // const columns = ref([
    //     { 
    //         name: 'To Do', 
    //         tasks: [
    //             { id: 'task1', title: 'Design System Update', description: 'Update design tokens and components', priority: 'High', due: '2d', assignee: 'John Doe', assigneeImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
    //             { id: 'task2', title: 'API Integration', description: 'Implement REST API endpoints', priority: 'Medium', due: '1d', assignee: 'Jane Smith', assigneeImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    //             { id: 'task2', title: 'API Integration', description: 'Implement REST API endpoints', priority: 'Medium', due: '1d', assignee: 'Jane Smith', assigneeImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    //             { id: 'task2', title: 'API Integration', description: 'Implement REST API endpoints', priority: 'Medium', due: '1d', assignee: 'Jane Smith', assigneeImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    //             { id: 'task2', title: 'API Integration', description: 'Implement REST API endpoints', priority: 'Medium', due: '1d', assignee: 'Jane Smith', assigneeImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    //             { id: 'task2', title: 'API Integration', description: 'Implement REST API endpoints', priority: 'Medium', due: '1d', assignee: 'Jane Smith', assigneeImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    //             { id: 'task2', title: 'API Integration', description: 'Implement REST API endpoints', priority: 'Medium', due: '1d', assignee: 'Jane Smith', assigneeImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    //         ]
    //     },
        // { 
        //     name: 'In Progress', 
        //     tasks: [
        //         { id: 'task3', title: 'Documentation', description: 'Write technical documentation', priority: 'Low', due: '3d', assignee: 'Mike Johnson', assigneeImage: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef' }
        //     ]
        // },
        // { 
        //     name: 'Under Review', 
        //     tasks: [
        //         { id: 'task4', title: 'Security Audit', description: 'Perform security assessment', priority: 'High', due: '1d', assignee: 'Sarah Wilson', assigneeImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' }
        //     ]
        // },
        // { 
        //     name: 'Completed', 
        //     tasks: [
        //         { id: 'task5', title: 'User Testing', description: 'Conduct user testing sessions', priority: 'Medium', due: '4d', assignee: 'Alex Brown', assigneeImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' }
        //     ]
        // }
    // ]);

    const columnDrag = (event: any, data: any) => {
        event.dataTransfer.setData("dragData", JSON.stringify({'type': 'column', 'data': data}));
    }

    const columnDrop = (event: any, indexTarget: any) => {
        console.log('drag index', event.dataTransfer.getData("index"));
        console.log('drop target',indexTarget);
    }



    const drag = (event: any, task: any) => {
        event.dataTransfer.setData("dragData", JSON.stringify({'type': 'task', 'data': task}));
    };

    const drop = (event: any, column: any, index: any) => {
        console.log('kolom index target', index);
        console.log(JSON.parse(event.dataTransfer.getData("dragData")));
        // const taskData = JSON.parse(event.dataTransfer.getData("task"));
        // const sourceColumn = props.columns.find(col => col.tasks.some(t => t.id === taskData.id));
        // if (sourceColumn) {
        // sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskData.id);
        // }
        // column.tasks.push(taskData);
    };

    const priorityClass = (priority: any) => {
        return {
        'px-2 py-1 text-xs font-semibold rounded': true,
        'bg-red-100 text-red-600': priority === 'High',
        'bg-yellow-100 text-yellow-600': priority === 'Medium',
        'bg-green-100 text-green-600': priority === 'Low',
        'bg-purple-100 text-purple-600': priority === 'Critical'
        };
    };
</script>
  

<style>
.el-card__body {
    height: 100%;
}
</style>