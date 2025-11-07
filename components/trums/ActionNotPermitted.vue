<template>
  <TrumsWrapper>
    <el-result
        icon="warning"
        title="403"
        sub-title="Maaf, Anda tidak memiliki izin untuk mengakses halaman ini"
      >
        <template #extra>
          <NuxtLink :href="redirectTo" class="el-button el-button--primary">{{buttonLabel}}</NuxtLink>
        </template>
    </el-result>
  </TrumsWrapper>
</template>

<script setup lang="ts">
    const router = useRouter();
    const props = defineProps<{
        redirectTo: string,
        buttonLabel: string,
    }>();
</script>