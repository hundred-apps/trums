<template>
  <el-row>
    
    <el-col :sm="12" :lg="6" :xl="4">
      <el-result
        icon="error"
        title="Error Tip"
        sub-title="Please follow the instructions"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">Back</el-button>
        </template>
      </el-result>
    </el-col>
    
  </el-row>
</template>

<script setup lang="ts">

const router = useRouter();
    
const goBack = () => router.back();
</script>