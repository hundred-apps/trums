<template>
  <el-pagination
    background
    layout="prev, pager, next, sizes, total"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    @current-change="onCurrentChange"
    @size-change="onSizeChange"
    :size="isMobile ? 'small' : 'default'"
    :page-count="5"
  />
</template>

<script setup lang="ts">
const { isMobile } = useDevice();

interface Props {
  total: number;
  currentPage: number;
  pageSize: number;
}

defineProps<Props>();

const emit = defineEmits<{
  pageChange: [page: number];
  sizeChange: [size: number];
}>();

const onCurrentChange = (page: number) => {
  emit("pageChange", page);
};

const onSizeChange = (size: number) => {
  emit("sizeChange", size);
};
</script>
