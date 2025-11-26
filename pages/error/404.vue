<template>
  <el-result
        icon="warning"
        title="404"
        sub-title="Halaman Yang Anda Tuju Tidak Ada!"
      >
        <template #extra>
          <el-button size="default" type="primary" @click="handleGoBack">Kembali</el-button>
        </template>
    </el-result>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const router = useRouter();

// Cek apakah user sudah login (sesuaikan dengan auth system Anda)
const isAuthenticated = computed(() => {
  const token = useCookie('token');
  return !!token.value;
});

const handleBackHome = () => {
  router.push('/');
};

const handleGoBack = () => {
  router.back();
};

const handleLogin = () => {
  router.push('/login');
};

// Optional: Auto redirect setelah beberapa detik
onMounted(() => {
//   // Auto redirect ke home setelah 10 detik
//   setTimeout(() => {
//     router.push('/');
//   }, 10000);
});
</script>

<style scoped>

.container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.help-card {
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.card-header {
  font-weight: 600;
  color: #409EFF;
}

.help-content {
  text-align: left;
}

.help-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.help-content li {
  margin: 5px 0;
  color: #606266;
}

:deep(.el-result__icon) {
  font-size: 120px;
}

:deep(.el-result__title) {
  font-size: 48px;
  color: #F56C6C;
  margin: 20px 0;
}

:deep(.el-result__subtitle) {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}
</style>