<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { type User as userData } from "~/types/user";
import {
  Menu as IconMenu,
  Box,
  DataAnalysis,
  Notebook,
  DocumentChecked,
  User,
  Money,
  Sell,
  Setting,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const config = useRuntimeConfig();

const router = useRouter();
const userdata = ref<userData | null>(null);
const imageUrl = config.public.baseImageURL;

const user = useCookie("userdata");

onMounted(() => {
  userdata.value = user.value as unknown as userData;
  // console.log()
});

const handleMenuClick = (menuKey: string) => {
  router.push(menuKey);
};
</script>

<template>
  <div class="common-layout">
    <el-header
      class="flex fixed backdrop-filter backdrop-blur-md top-0 z-40 w-full flex-none transition-colors duration-300 lg:z-50 border-b border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5] justify-between"
      style="text-align: right"
    >
      <div class="flex items-center gap-3">
        <img
          v-if="$colorMode.value === 'dark'"
          src="/images/logo/logo-white.png"
          alt="Logo Trums"
          width="40"
        />
        <img
          v-if="$colorMode.value === 'light'"
          src="/images/logo/logo-black.png"
          alt="Logo Trums"
          width="40"
        />
        <p class="text-3xl">TRUMS</p>
      </div>
      <div class="toolbar flex gap-3 items-center">
        <TrumsSwitcherTheme />
        <TrumsSwitcherLang />
        <el-dropdown trigger="click" class="hover:text-primary-500">
          <span class="text-base flex items-center gap-2">
            {{ userdata?.name }}
            <div class="h-[30px] w-[30px]">
              <img
                class="rounded-full w-full h-full"
                :src="`${imageUrl}/${userdata?.photo?.filename}`"
                :alt="`${userdata?.photo?.filename}`"
              />
            </div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>Profile</el-dropdown-item>
              <el-dropdown-item>
                <TrumsLink to="/setting">
                  {{ $t("menu.setting") }}
                </TrumsLink></el-dropdown-item
              ><el-dropdown-item>
                <TrumsLink to="/">
                  {{ $t("buttons.logout") }}
                </TrumsLink></el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-aside
      class="fixed top-0 left-0 z-40 w-64 h-full pt-[60px] transition-transform -translate-x-full backdrop-filter border-r backdrop-blur-md sm:translate-x-0 border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5]"
    >
      <el-scrollbar>
        <el-menu @select="handleMenuClick">
          <el-menu-item index="2">
            <el-icon><icon-menu /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Box /></el-icon>Inventory Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="/inventory-management/inventories"
                >Inventory</el-menu-item
              >
              <el-menu-item index="2-2">Inquiry</el-menu-item>
              <el-menu-item index="2-3">Check In</el-menu-item>
              <el-menu-item index="2-4">Check Out</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><DocumentChecked /></el-icon>Inspection & Maintenance
            </template>
            <el-menu-item-group>
              <el-menu-item index="3-1">Inspection</el-menu-item>
              <el-menu-item index="3-2">Maintenance</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="4">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>Supply Chain Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="4-1">Purchase Request</el-menu-item>
              <el-menu-item index="4-2">Canvassing</el-menu-item>
              <el-menu-item index="4-3">Purchase Order</el-menu-item>
              <el-menu-item index="4-4">Delivery</el-menu-item>
              <el-menu-item index="4-5">Receive</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="5">
            <template #title>
              <el-icon><Sell /></el-icon>Sales
            </template>
            <el-menu-item-group>
              <el-menu-item index="5-1">Pricelist</el-menu-item>
              <el-menu-item index="5-2">Order</el-menu-item>
              <el-menu-item index="5-3">Contract</el-menu-item>
              <el-menu-item index="5-4">Project</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="6">
            <template #title>
              <el-icon><Money /></el-icon>Finance Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="/finance-management/assets"
                >Assets</el-menu-item
              >
              <el-menu-item index="6-1">Bill</el-menu-item>
              <el-menu-item index="6-2">Invoice</el-menu-item>
              <el-menu-item index="6-3">Transaction</el-menu-item>
              <el-menu-item index="6-4">Budget</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="7">
            <template #title>
              <el-icon><User /></el-icon>Human Capital
            </template>
            <el-menu-item-group>
              <el-menu-item index="7-1">People</el-menu-item>
              <el-menu-item index="7-2">Departement</el-menu-item>
              <el-menu-item index="7-3">Position</el-menu-item>
              <el-menu-item index="7-4">Recruitmen</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-menu-item index="8">
            <el-icon><Notebook /></el-icon>
            <span>Contact Management</span>
          </el-menu-item>
          <el-sub-menu index="9">
            <template #title>
              <el-icon><IconMenu /></el-icon>Master
            </template>
            <el-menu-item-group>
              <el-menu-item index="9-1">Menu</el-menu-item>
              <el-menu-item index="9-1">Permission</el-menu-item>
              <el-menu-item index="9-1">User Permission</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <div class="sm:ml-72">
      <TrumsContentDefault>
        <slot />
      </TrumsContentDefault>
    </div>
  </div>
</template>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
