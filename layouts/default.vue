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
  CreditCard,
  Collection
} from "@element-plus/icons-vue";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useRouter } from "vue-router";
import type { Menu } from "~/types/menu";

const config = useRuntimeConfig();
const { t } = useI18n();

const router = useRouter();
const userdata = ref<userData | null>(null);
const imageUrl = config.public.baseImageURL;
const id_token = localStorage.getItem("id_token");


const issuer = config.public.baseOIDCIssuer;
const logoutUri = config.public.baseOIDCILOGOUTURL;


const navigateToSetting = (name = "") => {
  const path = `/setting/profile/${name}`;
  router.push({ path });
};

const user = useCookie("userdata");
const menus = ref<Menu[]>([]);
const nameFront = ref("");
const icons = ElementPlusIconsVue as Record<string, any>


const showIcon = (icon: any) => {
  return icons[icon] || null;
};

onMounted(() => {
  userdata.value = user.value as unknown as userData;
  menus.value = JSON.parse(localStorage.getItem('menu') ?? '[]');

  nameFront.value = userdata.value?.name.split(" ")[0] || "";
});

const logOut = async () => {
  const url = `${issuer}/session/end?id_token_hint=${id_token}&post_logout_redirect_uri=${logoutUri}`;

  window.location.href = url;

}

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
                <TrumsLink @click="logOut">
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
          <div v-for="menu in menus" :key="menu.unique_id">
            <el-sub-menu v-if="menu.menus && menu.menus.length > 0" :index="menu.route">
              <template #title>
                <el-icon v-if="showIcon(menu.icon)">
                  <component :is="showIcon(menu.icon)" />
                </el-icon>
                {{menu.name}}
              </template>
              <el-menu-item-group>
                <el-menu-item v-for="sub in menu.menus" :index="sub.route"
                  >{{ sub.name }}</el-menu-item
                >
              </el-menu-item-group>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.route">
              <el-icon v-if="showIcon(menu.icon)">
                <component :is="showIcon(menu.icon)" />
              </el-icon>
              <span>{{menu.name}}</span>
            </el-menu-item>
            
          </div>
          
          <!-- <el-menu-item index="/catalogue">
            <el-icon><Collection /></el-icon>
            <span>Catalog</span>
          </el-menu-item>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Box /></el-icon>Inventory Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="/inventory-management/inventories"
                >Inventory</el-menu-item
              >
              <el-menu-item index="/inventory-management/inqueiries">Inquiry</el-menu-item>
              <el-menu-item index="/inventory-management/checkin">Check In/Out</el-menu-item>
              <el-menu-item index="/inventory-management/consigment">Consigment</el-menu-item>
              <el-menu-item index="/inventory-management/location"
                >Location</el-menu-item
              >
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><DocumentChecked /></el-icon>Inspection & Maintenance
            </template>
            <el-menu-item-group>
              <el-menu-item index="/inspection-maintenance/inspection"
                >Inspection</el-menu-item
              >
              <el-menu-item index="/inspection-maintenance/maintenance"
                >Maintenance</el-menu-item
              >
              <el-menu-item index="/inspection-maintenance/template"
                >Template Checklist</el-menu-item
              >
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="4">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>Supply Chain Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="/supply-chain-management/purchase/request">Purchase Request</el-menu-item>
              <el-menu-item index="/supply-chain-management/canvassing">Canvassing</el-menu-item>
              <el-menu-item index="/supply-chain-management/purchase/order">Purchase Order</el-menu-item>
              <el-menu-item index="4-4">Delivery</el-menu-item>
              <el-menu-item index="4-5">Receive</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="5">
            <template #title>
              <el-icon><Sell /></el-icon>Sales
            </template>
            <el-menu-item-group>
              <el-menu-item index="/sales/inquiry">Inquiry</el-menu-item>
              <el-menu-item index="/sales/canvassing">Canvassing</el-menu-item>
              <el-menu-item index="/sales/quotation">RAB</el-menu-item>
              <el-menu-item index="/sales/offer">Penawaran</el-menu-item>
              <el-menu-item index="/sales/pricelist">Pricelist</el-menu-item>
              <el-menu-item index="/sales/order">Order</el-menu-item>
              <el-menu-item index="5-3">Contract</el-menu-item>
              <el-menu-item index="5-4">Project</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="6">
            <template #title>
              <el-icon><Money /></el-icon>Finance Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="/finance-management/accounts"
                >Account</el-menu-item
              >
              <el-menu-item index="/finance-management/assets"
                >Assets</el-menu-item
              >
              <el-menu-item index="/finance-management/bill">Bill</el-menu-item>
              <el-menu-item index="/finance-management/invoice">Invoice</el-menu-item>
              <el-menu-item index="/finance-management/transaction">Transaction</el-menu-item>
              <el-menu-item index="6-4">Budget</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="7">
            <template #title>
              <el-icon><User /></el-icon>Human Capital
            </template>
            <el-menu-item-group>
              <el-menu-item index="/human-capital-management/people"
                >People</el-menu-item
              >
              <el-menu-item index="/human-capital-management/departement"
                >Departement</el-menu-item
              >
              <el-menu-item index="/human-capital-management/position"
                >Position</el-menu-item
              >
              <el-menu-item index="7-4">Recruitmen</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="8">
            <template #title>
              <el-icon><Notebook /></el-icon>Contact Management
            </template>
            <el-menu-item-group>
              <el-menu-item index="/contact-management/categories"
                >Categories</el-menu-item
              >
              <el-menu-item index="/contact-management/contacts"
                >Contact</el-menu-item
              >
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="9">
            <template #title>
              <el-icon><CreditCard /></el-icon>Bank & E-Wallet
            </template>
            <el-menu-item-group>
              
              <el-menu-item index="/bank/bank-list">Daftar Bank & E-Wallet</el-menu-item>
              <el-menu-item index="/bank/rekening">Daftar Rekening</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="10">
            <template #title>
              <el-icon><IconMenu /></el-icon>Master
            </template>
            <el-menu-item-group>
              
              <el-menu-item index="/master/mycompany">Perusahaan Saya</el-menu-item>
              <el-menu-item index="/master/tax">Daftar Pajak</el-menu-item>
              <el-menu-item index="/master/menu">Menu</el-menu-item>
              <el-menu-item index="9-2">Permission</el-menu-item>
              <el-menu-item index="9-3">User Permission</el-menu-item>
              <el-menu-item index="/master/checklist">Pengaturan Checklist</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu> -->
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
