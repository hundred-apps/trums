<template>
    <el-card class="my-3">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="inventory"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        :disabled="loading"
      >
        <el-form-item label="Nama Item" prop="catalogue">
          <el-autocomplete
            v-model="inventory.catalogue.name!"
            :fetch-suggestions="querySearchAsync"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Masukan Nama Item"
            @select="handleSelect"
          />
        </el-form-item>
        <el-form-item label="Lokasi Inventory" prop="location_name">
          <el-autocomplete
            v-model="inventory.location!.name!"
            :fetch-suggestions="querySearchLocation"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Lokasi"
            @select="handleSelectLocation"
          />
        </el-form-item>
        <el-form-item label="Cost" prop="tmp_cost">
          <el-input
            v-model="inventory.cost"
            placeholder="Harga"
            :formatter="(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value: any) => value.replace(/[^0-9]/g, '')"
          />
        </el-form-item>
        <el-form-item
          v-if="inventory.is_traceable"
          label="Quantity"
          prop="qty"
        >
          <el-input
            v-model="inventory.quantity"
            :parser="(value: any) => value.replace(/[^0-9]/g, '')"
            placeholder="Quantity"
          />
        </el-form-item>
        <el-form-item label="Unit" prop="unit_name">
          <el-autocomplete
            v-model="inventory.unit_name"
            :fetch-suggestions="querySearchUnit"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Unit"
            @select="handleSelectUnit"
          />
        </el-form-item>
        <el-form-item label="Track Inventory" prop="is_traceable">
          <el-radio-group v-model="inventory.traceable">
            <el-radio value="1">Ya</el-radio>
            <el-radio value="0">Tidak</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="inventory.traceable == 1"
          label="Serial Number"
          prop="sn"
        >
          <el-input v-model="inventory.sn" placeholder="Masukan Serial Number" />
        </el-form-item>
      </el-form>
    </el-card>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import type { Catalogue } from '~/types/catalogue';
import type { Inventory } from '~/types/inventory';
import type { RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import type { Unit } from '~/types/unit';

const props = defineProps<{
    // onSubmit: (catalogue: Catalogue) => void,
    // onCancel: () => void,
    inventory: Inventory,
}>();

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  sort: null,
  limit: "50",
  offset: "1",
});


interface RuleForm {
  id: number;
  catalogue: string;
  catalogue_id: string | null;
  location_id: string | null;
  location_name: string;
  is_traceable: boolean;
  traceable: string;
  sn: string;
  unit_id: number | null;
  unit_name: string;
  qty: string;
  quantity: number;
  cost: number;
  tmp_cost: string;
  unique_id?: string;
}

const loading = ref<boolean>(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();


const rules = reactive<FormRules<RuleForm>>({
  catalogue: [{ required: true, message: "Masukan Item", trigger: "blur" }],
  location_name: [
    { required: true, message: "Masukan Lokasi Item", trigger: "blur" },
  ],
  quantity: [{ required: true, message: "Masukan Quantity", trigger: "blur" }],
  cost: [{ required: true, message: "Masukan Lokasi Item", trigger: "blur" }],
  unit_name: [
    { required: true, message: "Masukan Jenis Unit", trigger: "blur" },
  ],
  sn: [{ required: true, message: "Masukan Serial Number", trigger: "blur" }],
});

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...requestSearch.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  
  useFetchApi<ResponsePagination<Unit[]>>('/search', 'units', 'post', params).then((response) => {
    if (response.status.value == 'success') {
        const resultApi: Unit[] = response.data.value?.data as Unit[];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
  })
  
};


const handleSelectUnit = (item: Record<string, any>) => {
  console.log(item);

  if (item.unique_id == undefined) {
    props.inventory.unit_name = item.id;
    props.inventory.unit_id = '';
  } else {
    props.inventory.unit_name = item.value;
    props.inventory.unit_id = item.unique_id;
  }
};



const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "catalogues";
  requestSearch.value.column = [{ type: ["item"] }];
  useFetchApi<ResponsePagination<Catalogue[]>>("/search", "catalogue-search", "post", requestSearch.value)
    .then((response) => {
      if (response.status.value == 200) {
        const resultApi: Catalogue[] = response.data.value?.data as Catalogue[];
        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const handleSelect = (item: Record<string, any>) => {
  console.log(item);

  // if (item.unique_id == undefined) {
  //   props.inventory.catalogue = item.id;
  //   props.inventory.catalogue_id = null;
  // } else {
  //   props.inventory.catalogue = item.value;
  //   props.inventory.catalogue_id = item.unique_id;
  // }
};

const handleSelectLocation = (item: Record<string, any>) => {
  console.log(item);

  // if (item.unique_id == undefined) {
  //   props.inventory.location_name = item.name;
  //   props.inventory.location_id = item.id;
  // } else {
  //   props.inventory.location_name = item.value;
  //   props.inventory.location_id = item.unique_id;
  // }
};

const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "catalogues";
  requestSearch.value.column = [
    {
      type: ["place"],
    },
  ];
  useFetchApi<ResponsePagination<Catalogue[]>>("/search", "search-location", "post",requestSearch.value)
    .then((response) => {
      if (response.status.value == 200) {
        const resultApi: Catalogue[] = response.data.value?.data as Catalogue[];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};
</script>