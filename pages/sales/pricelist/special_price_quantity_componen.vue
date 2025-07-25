<template>
    <div class="flex gap-3">
        <el-button type="default" @click="decrement" :icon="Minus" circle />
        <el-input v-model="quantity" class="text-center" style="width: 100px" />
        <el-button type="primary" @click="increment" :icon="Plus" circle />
    </div>
</template>
<script lang="tsx" setup>
import {
  Plus,
  Minus
} from '@element-plus/icons-vue';
const props = defineProps<{
  onChange: (val: number) => void,
  initaial_value: number,
}>();

  const quantity = ref<number>(1);

  const increment = () => {
    quantity.value = quantity.value + 1;
    
    return props.onChange(quantity.value);
  }
  const decrement = () => {
    quantity.value = quantity.value - 1;
    return props.onChange(quantity.value);
  }

  onMounted(() => {
    quantity.value = props.initaial_value;
  })

</script>