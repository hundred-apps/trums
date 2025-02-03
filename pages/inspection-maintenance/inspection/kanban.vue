<template>
   <Kanban :columns="columns!" />
</template>
  
<script lang="tsx" setup>

    interface Task {
        id: string,
        title: string,
        description: string,
        priority: string,
        due: string,
        assignee: string,
        assigneeImage: string,
    }

    interface TaskStatus {
        name: string,
        tasks: Task[],
    }

    import { ref, onMounted } from 'vue';
    import type { KanbanProp } from '~/types/kanban_prop';
    import Kanban_card from '~/components/trums/Kanban_card.vue';
    import Kanban from '~/components/trums/Kanban.vue';


    const initialKanbanBoard = ref<TaskStatus[]>([
        { 
        name: 'To Do', 
        tasks: [
                { id: 'task1', title: 'Design System Update', description: 'Update design tokens and components', priority: 'High', due: '2d', assignee: 'John Doe', assigneeImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
            ]
        },
        { 
            name: 'In Progress', 
            tasks: [
                { id: 'task3', title: 'Documentation', description: 'Write technical documentation', priority: 'Low', due: '3d', assignee: 'Mike Johnson', assigneeImage: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef' }
            ]
        },
        { 
            name: 'Under Review', 
            tasks: [
                { id: 'task4', title: 'Security Audit', description: 'Perform security assessment', priority: 'High', due: '1d', assignee: 'Sarah Wilson', assigneeImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' }
            ]
        },
        { 
            name: 'Completed', 
            tasks: [
                { id: 'task5', title: 'User Testing', description: 'Conduct user testing sessions', priority: 'Medium', due: '4d', assignee: 'Alex Brown', assigneeImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' }
            ]
        }
    ])
    

    const columns = ref<KanbanProp[]>();
    


    // const drag = (event, task) => {
    //     event.dataTransfer.setData("task", JSON.stringify(task));
    // };

    // const drop = (event, column) => {
    //     const taskData = JSON.parse(event.dataTransfer.getData("task"));
    //     const sourceColumn = columns.value.find(col => col.tasks.some(t => t.id === taskData.id));
    //     if (sourceColumn) {
    //     sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskData.id);
    //     }
    //     column.tasks.push(taskData);
    // };

    // const priorityClass = (priority) => {
    //     return {
    //     'px-2 py-1 text-xs font-semibold rounded': true,
    //     'bg-red-100 text-red-600': priority === 'High',
    //     'bg-yellow-100 text-yellow-600': priority === 'Medium',
    //     'bg-green-100 text-green-600': priority === 'Low',
    //     'bg-purple-100 text-purple-600': priority === 'Critical'
    //     };
    // };

    const onDrop = (event: DragEvent, columnIndex: any) => {
        const argument = JSON.parse(event.dataTransfer!.getData("dragData"));
        const taskData = argument.data;
        

        const sourceColumn = initialKanbanBoard.value.find(col => col.tasks.some(t => t.id === taskData.id));
        if (sourceColumn) {
            sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskData.id);
        }
        initialKanbanBoard.value[columnIndex].tasks.push(taskData);
        setDataKanban();
    }

    const onDrag = (event: DragEvent, data: any) => {
        event.dataTransfer!.setData("dragData", JSON.stringify({'type': 'task', 'data': data}));
    }

    const setDataKanban = () => {
        columns.value = initialKanbanBoard.value.map((value, index) => {
            return {
                name: value.name,
                tasks: value.tasks.map((task) => {
                    return () => <Kanban_card onDrag={(event: DragEvent) => onDrag(event, task)} assignee={task.assignee} assigneeImage={task.assigneeImage} due={task.due} priority={task.priority} title={task.priority} />
                }),
                onDrop: (event) => onDrop(event, index),

            }
        })
    }

    onMounted(() => {
        setDataKanban();
    })
</script>
  

<style>
.el-card__body {
    height: 100%;
}
</style>