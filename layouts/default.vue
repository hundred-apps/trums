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
  Collection,
} from "@element-plus/icons-vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import type { Menu } from "~/types/menu";
import type { People } from "~/types/people";
import type { BaseResponse } from "~/types/response";
import LayoutSidebar from "~/components/layouts/LayoutSidebar.vue";

const { isMobile } = useDevice();
const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;
const { t } = useI18n();

const router = useRouter();
const authStore = useAuthStore();
const userdata = ref<People | null>(null);
const visibleDialogLogOut = ref<boolean>(false);
const sidebarOpen = ref<boolean>(false);

const id_token = localStorage.getItem("id_token");
const client_id = config.public.baseOIDCICID;

const issuer = config.public.baseOIDCIssuer;
const logoutUri = config.public.baseOIDCILOGOUTURL;

const navigateToSetting = (name = "") => {
  const path = `/setting/profile/${name}`;
  router.push({ path });
};

const auth = useAuth();

const nameFront = ref("");
const icons = ElementPlusIconsVue as Record<string, any>;

const showIcon = (icon: any) => {
  return icons[icon] || null;
};

onMounted(() => {
  userdata.value = JSON.parse(localStorage.getItem("user_data") ?? "");

  nameFront.value = userdata.value?.name?.split(" ")[0] || "";
});

const logOut = async () => {
  try {
    const response = await useApiFetch<BaseResponse<any>>("/people-logout", {
      method: "GET",
    });

    if (response.success) {
      // const id_token = authStore.idToken;

      // const url = `${issuer}/session/end?id_token_hint=${id_token}&post_logout_redirect_uri=${logoutUri}&client_id=${client_id}`;
      authStore.clearAuth();
      auth.clearAuth();
      window.location.href = "/";
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  }
};

const handleMenuClick = (menuKey: string) => {
  router.push(menuKey);
};
</script>

<template>
  <el-container class="layout-container">
    <el-header
      class="flex items-center fixed backdrop-filter backdrop-blur-md top-0 z-40 w-full flex-none transition-colors duration-300 lg:z-50 border-b border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5] justify-between"
      style="text-align: right"
    >
      <el-button v-if="isMobile" @click="sidebarOpen = true"> ☰ </el-button>
      <div v-else class="flex items-center gap-3">
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
                :src="`${imageUrl}/${userdata?.photo?.image_path}/${userdata?.photo?.filename}`"
                :alt="`${userdata?.photo?.filename}`"
              />
            </div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                ><TrumsLink :href="`/profile/${userdata?.unique_id}`">
                  {{ t("menu.profile") }}
                </TrumsLink></el-dropdown-item
              >
              <el-dropdown-item>
                <TrumsLink to="/setting">
                  {{ t("menu.setting") }}
                </TrumsLink></el-dropdown-item
              ><el-dropdown-item>
                <TrumsLink @click="visibleDialogLogOut = true">
                  {{ t("buttons.logout") }}
                </TrumsLink></el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-aside
      v-if="!isMobile"
      class="fixed top-0 left-0 z-40 w-64 h-full pt-[60px] transition-transform -translate-x-full backdrop-filter border-r backdrop-blur-md sm:translate-x-0 border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5]"
    >
      <LayoutsLayoutSidebar />
    </el-aside>
    <div class="sm:ml-72">
      <TrumsContentDefault>
        <slot />
      </TrumsContentDefault>
    </div>

    <el-dialog v-model="visibleDialogLogOut" title="Warning" width="500" center>
      <span class="text-center"> Anda Yakin Ingin Keluar Dari Aplikasi? </span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleDialogLogOut = false">Cancel</el-button>
          <el-button type="danger" @click="logOut"> Log Out </el-button>
        </div>
      </template>
    </el-dialog>
    <el-drawer
      v-model="sidebarOpen"
      direction="ltr"
      size="320px"
      :with-header="false"
    >
      <LayoutSidebar @menu-click="() => (sidebarOpen = false)" />
    </el-drawer>
  </el-container>
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
