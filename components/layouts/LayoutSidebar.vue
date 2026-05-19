<template>
  <el-scrollbar>
    <el-menu @select="handleMenuClick">
      <div v-for="menu in menus" :key="menu.unique_id">
        <el-sub-menu
          v-if="menu.menus && menu.menus.length > 0"
          :index="menu.route"
        >
          <template #title>
            <el-icon v-if="showIcon(menu.icon)">
              <component :is="showIcon(menu.icon)" />
            </el-icon>
            {{ menu.name }}
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="sub in menu.menus" :index="sub.route">{{
              sub.name
            }}</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item v-else :index="menu.route">
          <el-icon v-if="showIcon(menu.icon)">
            <component :is="showIcon(menu.icon)" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </div>
    </el-menu>
  </el-scrollbar>
</template>
<script lang="ts" setup>
import type { Menu } from "~/types/menu";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const router = useRouter();

const menus = ref<Menu[]>([]);
const icons = ElementPlusIconsVue as Record<string, any>;

const emit = defineEmits(["menu-click"]);

const showIcon = (icon: any) => {
  return icons[icon] || null;
};

const handleMenuClick = async (menuKey: string) => {
  await router.push(menuKey);
  emit("menu-click");
};

onMounted(() => {
  menus.value = JSON.parse(localStorage.getItem("menu") ?? "[]");
});
</script>
