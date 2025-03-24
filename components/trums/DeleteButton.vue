<template>
    <el-popconfirm 
        :title="props.title ?? 'Apakah Kamu Ingin Menghapus Ini?'" 
        :cancel-button-text="props.labelCancel ?? 'Batal'" 
        :confirm-button-text="props.labelConfirm ?? 'Hapus'"
        @confirm="props.onConfirm"
        @cancel="props.onCancel"
        >
        <template #reference>
            <el-button size="small">{{ props.labelButton ?? 'Hapus' }}</el-button>
        </template>
    </el-popconfirm>
</template>

<script lang="ts" setup>

const props = defineProps<{
    onConfirm: () => void,
    onCancel: () => void,
    title?: string,
    labelButton?: string,
    labelCancel?: string,
    labelConfirm?: string,

}>();

</script>
  