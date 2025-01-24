<template>
  <el-table-v2
        :columns="columns"
        :data="data"
        :height="400"
        :width="100"
        :max-width="2000"
        fixed
    />
</template>

<script lang="ts" setup>
  import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common.mjs';

  defineProps({
    columns: {
      type: Array<AnyColumn>,
      required: true
    },
    data: {
      type: Array,
      required: true,
    }
  })

  // const scollbar_thumb = document.getElementsByClassName('el-scrollbar__thumb');
  // for(var i = 0; i < scollbar_thumb.length; i++){
  //   scollbar_thumb[i].remove();
  // }
  

</script>

<style>

.el-table-v2__root, .el-table-v2__main, .el-table-v2__header-wrapper, .el-table-v2__header{
  width: 100% !important;
}

.el-vl__vertical{
  display: none;
}

.el-table-v2__body > div, 
.el-table-v2__body > div > div,
.el-table-v2__body > div > div > .el-table-v2__row {
  width: 100% !important;
}

/* .el-table-v2__body > div {
  width: 100% !important;
  height: 400px !important;
}
.el-table-v2,
 .el-table-v2__main {
  width: 100% !important;
  position: relative !important;
  height: 400px !important;
}

.el-table-v2__row{
  width: 100% !important;
}

.el-virtual-scrollbar.el-vl__horizontal, .el-virtual-scrollbar.el-vl__vertical{
  position: relative !important;
  height: 0px !important;
}

.el-scrollbar__thumb{
  height: 0px !important;
}
.el-table-v2__header-wrapper{
  width: 100% !important;
}
.el-scrollbar__thumb, .el-table-v2__header{

  width: 100% !important;
} */

</style>