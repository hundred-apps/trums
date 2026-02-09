<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Check In/Out </span>
      </template>
    </el-page-header>
    <!-- <el-tabs type="border-card" class="mt-5">
            <el-tab-pane label="Non-Sales">
                <NonSales/>
            </el-tab-pane>
            <el-tab-pane label="Sales">
                
            </el-tab-pane>
        </el-tabs> -->
    <el-card>
      <Sales />
    </el-card>
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import { reactive } from "vue";
import NonSales from "./components/NonSales.vue";
import Sales from "./components/Sales.vue";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventory-movements-create",
  name: "Add New Inventory Movement",
});
const router = useRouter();

const goBack = () => router.back();

// do not use same name with ref
const form = reactive({
  type: "non-sales",
});
</script>
