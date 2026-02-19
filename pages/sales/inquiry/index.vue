<script lang="tsx" setup>
import inquiryTable from "./components/inquiryTable.vue";
import inquiryItemTable from "./components/inquiryItemTable.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inquiries-read",
});
const activeNameTab = ref("RFQ");
</script>
<template>
  <TrumsWrapper>
    <el-tabs
      v-model="activeNameTab"
      class="demo-tabs mt-5 h-full"
      type="border-card"
    >
      <el-tab-pane label="RFQ" name="RFQ" class="h-full">
        <inquiryTable />
      </el-tab-pane>
      <el-tab-pane label="RFQ ITEM" name="ITEM">
        <inquiryItemTable />
      </el-tab-pane>
    </el-tabs>
  </TrumsWrapper>
</template>
