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
        <TrumsSwitcherTheme type="element" />
        <TrumsSwitcherLang type="element" />
        <el-dropdown class="hover:text-blue-500">
          <span class="text-base flex items-center gap-2">
            {{ nameFront }}
            <div class="h-[30px] w-[30px]">
              <img
                class="rounded-full w-full h-full avatar border border-gray-300"
                :src="`${imageUrl}/${userdata?.photo?.filename}`"
                :alt="`${userdata?.photo?.filename}`"
              />
            </div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                ><TrumsLink @click="navigateToSetting(userdata?.name)">
                  {{ t("menu.profile") }}
                </TrumsLink></el-dropdown-item
              >
              <el-dropdown-item>
                <TrumsLink to="/setting">
                  {{ t("menu.setting") }}
                </TrumsLink></el-dropdown-item
              ><el-dropdown-item>
                <TrumsLink @click="$oidc.logout()">
                  {{ t("buttons.logout") }}
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
          <el-menu-item index="/dashboard">
            <el-icon><icon-menu /></el-icon>
            <span>{{ t("menu.dashboard") }}</span>
          </el-menu-item>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Box /></el-icon>{{ t("menu.inventoryManagement") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="/inventory-management/inventories">{{
                t("menu.submenu.inventories")
              }}</el-menu-item>
              <el-menu-item index="/inventory-management/inqueiries">{{
                t("menu.submenu.inqueiries")
              }}</el-menu-item>
              <el-menu-item index="/inventory-management/checkin">{{
                t("menu.submenu.checkin")
              }}</el-menu-item>
              <el-menu-item index="2-4">{{
                t("menu.submenu.checkout")
              }}</el-menu-item>
              <el-menu-item index="/inventory-management/location">{{
                t("menu.submenu.location")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><DocumentChecked /></el-icon
              >{{ t("menu.inspectionAndMaintenance") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="/inspection-maintenance/inspection">{{
                t("menu.submenu.inspection")
              }}</el-menu-item>
              <el-menu-item index="/inspection-maintenance/maintenance">{{
                t("menu.submenu.maintenance")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="4">
            <template #title>
              <el-icon><DataAnalysis /></el-icon
              >{{ t("menu.supplyChainManagement") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="/supply-chain-management/purchase/request">{{
                t("menu.submenu.purchaseRequest")
              }}</el-menu-item>
              <el-menu-item index="/supply-chain-management/canvassing">{{
                t("menu.submenu.canvassing")
              }}</el-menu-item>
              <el-menu-item index="4-3">{{
                t("menu.submenu.purchaseOrder")
              }}</el-menu-item>
              <el-menu-item index="/supply-chain-management/delivery">{{
                t("menu.submenu.delivery")
              }}</el-menu-item>
              <el-menu-item index="4-5">{{
                t("menu.submenu.receive")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="5">
            <template #title>
              <el-icon><Sell /></el-icon>{{ t("menu.sales") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="5-1">{{
                t("menu.submenu.pricelist")
              }}</el-menu-item>
              <el-menu-item index="5-2">{{
                t("menu.submenu.order")
              }}</el-menu-item>
              <el-menu-item index="5-3">{{
                t("menu.submenu.contract")
              }}</el-menu-item>
              <el-menu-item index="5-4">{{
                t("menu.submenu.project")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="6">
            <template #title>
              <el-icon><Money /></el-icon>{{ t("menu.financeManagement") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="/finance-management/assets">{{
                t("menu.submenu.assets")
              }}</el-menu-item>
              <el-menu-item index="6-1">{{
                t("menu.submenu.bill")
              }}</el-menu-item>
              <el-menu-item index="6-2">{{
                t("menu.submenu.invoice")
              }}</el-menu-item>
              <el-menu-item index="6-3">{{
                t("menu.submenu.transaction")
              }}</el-menu-item>
              <el-menu-item index="6-4">{{
                t("menu.submenu.budget")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="7">
            <template #title>
              <el-icon><User /></el-icon>{{ t("menu.humanCapital") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="/human-capital-management/people">{{
                t("menu.submenu.people")
              }}</el-menu-item>
              <el-menu-item index="/human-capital-management/departement">{{
                t("menu.submenu.departement")
              }}</el-menu-item>
              <el-menu-item index="/human-capital-management/position">{{
                t("menu.submenu.position")
              }}</el-menu-item>
              <el-menu-item index="7-4">{{
                t("menu.submenu.recruitment")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="8">
            <template #title>
              <el-icon><Notebook /></el-icon>{{ t("menu.contactManagement") }}
            </template>
            <el-menu-item-group>
              <el-menu-item index="/contact-management/categories">{{
                t("menu.submenu.categories")
              }}</el-menu-item>
              <el-menu-item index="/contact-management/contacts">{{
                t("menu.submenu.contacts")
              }}</el-menu-item>
              <el-menu-item index="/contact-management/company"
                >Company</el-menu-item
              >
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="9">
            <template #title>
              <el-icon><IconMenu /></el-icon>Master
            </template>
            <el-menu-item-group>
              <el-menu-item index="9-1">Menu</el-menu-item>
              <el-menu-item index="9-1">Permission</el-menu-item>
              <el-menu-item index="9-1">User Permission</el-menu-item>
              <el-menu-item index="/master/template-document"
                >Template Document</el-menu-item
              >
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

const config = useRuntimeConfig();
const { t } = useI18n();
const { $oidc } = useNuxtApp();
const localePath = useLocalePath();
const userdata = ref<userData | null>(null);
const imageUrl = config.public.baseImageURL;
const user = useCookie("userdata");
const nameFront = ref("");
// const opnameCookie = useCookie('location-opname').value;
// const onOpname = ref<boolean>();

const navigateToSetting = (name = "") => {
  const path = localePath(`/setting/profile/${name}`);
  navigateTo({ path });
};

const handleMenuClick = (menuKey: string) => {
  navigateTo(localePath(menuKey));
};

onMounted(() => {
  userdata.value = user.value as unknown as userData;
  nameFront.value = userdata.value?.name.split(" ")[0] || "";
});
</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-blue-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-blue-light-8);
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
