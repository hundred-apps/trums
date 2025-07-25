<template>
  <div class="demo-collapse">
    <el-collapse v-model="is_active" @change="onHandleChange">
        <el-collapse-item v-for="el in elements" :title="el.title" :name="el.name" :key="el.title">
            <component :is="el.element"/>
             
        </el-collapse-item>
       
    </el-collapse>
     
  </div>
</template>

<script lang="tsx" setup>
    import { ref } from 'vue'
    import type { CollapseModelValue } from 'element-plus';
    interface CollapsProps {
        onHandleChange: (val: CollapseModelValue) => void,
        elements: {title: string, name: string, element: any}[],
        activeNames: string[],
    }

    const props = defineProps<CollapsProps>();

    const is_active = ref(props.activeNames);


    onMounted(() => {
        // console.log(props.elements);
    })

</script>
