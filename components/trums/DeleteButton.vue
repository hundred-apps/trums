<template>
    <el-popconfirm 
        :title="props.title ?? 'Apakah Kamu Ingin Menghapus Ini?'" 
        :cancel-button-text="props.labelCancel ?? 'Batal'" 
        :confirm-button-text="props.labelConfirm ?? 'Hapus'"
        width="250"
        @confirm="props.onConfirm"
        @cancel="props.onCancel"
        >
        <template #reference>
            <el-button :size="props.size" type="danger">{{ props.labelButton ?? 'Hapus' }}</el-button>
        </template>
    </el-popconfirm>
</template>

<script lang="ts" setup>

const props = defineProps<{
    onConfirm: () => void,
    onCancel: () => void,
    title?: string,
    size: "small" | "default" | "large",
    labelButton?: string,
    labelCancel?: string,
    labelConfirm?: string,

}>();

</script>
  