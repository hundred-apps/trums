<template>
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

  <el-dialog v-model="visibleDialogLogOut" title="Warning" width="500" center>
    <span class="text-center"> Anda Yakin Ingin Keluar Dari Aplikasi? </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visibleDialogLogOut = false">Cancel</el-button>
        <el-button type="danger" @click="logOut"> Log Out </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import type { People } from "~/types/people";
import type { BaseResponse } from "~/types/response";

const userdata = ref<People | null>(null);
const nameFront = ref("");

const { t } = useI18n();

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

const authStore = useAuthStore();
const auth = useAuth();

const visibleDialogLogOut = ref<boolean>(false);

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

onMounted(() => {
  userdata.value = JSON.parse(localStorage.getItem("user_data") ?? "");

  nameFront.value = userdata.value?.name?.split(" ")[0] || "";
});
</script>
