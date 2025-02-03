<template>
  <el-table-v2
        :columns="columns"
        :data="data"
        :height="400"
        :width="1100"
        :max-width="2000"
        :sort-state="sortState"
        
        @column-sort="columnSort"
        fixed
      >
      <template v-if="loading" #overlay>
        <div
          class="el-loading-mask"
          style="display: flex; align-items: center; justify-content: center"
        >
          <el-icon class="is-loading" color="var(--el-color-primary)" :size="26">
            <loading-icon />
          </el-icon>
        </div>
      </template>
      </el-table-v2>
</template>

<script lang="ts" setup>
  import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common.mjs';
  import type { ColumnSortHandler } from 'element-plus/es/components/table-v2/src/table.mjs';
  import { Loading as LoadingIcon } from '@element-plus/icons-vue'


  const props = defineProps({
    columns: {
      type: Array<AnyColumn>,
      required: true
    },
    data: {
      type: Array,
      required: true,
    },
    sortState: {
      type: Object,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
      
    },
    columnSort: {
      type: Function as PropType<ColumnSortHandler<any>>,
      required: false,
    }
  })


  const hallo = () => {
    
  }

  // const scollbar_thumb = document.getElementsByClassName('el-scrollbar__thumb');
  // for(var i = 0; i < scollbar_thumb.length; i++){
  //   scollbar_thumb[i].remove();
  // }
  

</script>

<style>

/* .el-table-v2__root, .el-table-v2__main {
  width: 100% !important;
} */

/* .el-table-v2__root, .el-table-v2__main, .el-table-v2__header-wrapper, .el-table-v2__header{
  width: auto !important;
}

.el-table-v2__empty{
  width: 100% !important;
}

.el-vl__vertical{
  display: none;
}
*/

/* .el-table-v2__body > div, 
.el-table-v2__body > div > div,
.el-table-v2__body > div > div > .el-table-v2__row {
  width: 100% !important;
}  */
.example-showcase .el-table-v2__overlay {
  z-index: 9;
}

</style>