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
    <el-tabs v-model="activeNameTab" class="demo-tabs mt-5" type="border-card">
      <el-tabs
        v-model="activeNameTab"
        type="card"
        class="demo-tabs"
        @tab-click="() => {}"
      >
        <el-tab-pane label="RFQ" name="RFQ">
          <inquiryTable />
        </el-tab-pane>
        <el-tab-pane label="ITEM" name="RFQ ITEM">
          <inquiryItemTable />
        </el-tab-pane>
      </el-tabs>
      <!-- <el-tab-pane label="RFQ" name="RFQ">
        <div style="height: 100%">
          <inquiryTable />
        </div>
      </el-tab-pane>
      <el-tab-pane label="RFQ ITEM" name="ITEM">
        <inquiryItemTable />
      </el-tab-pane> -->
    </el-tabs>
  </TrumsWrapper>
</template>
