<template>
  <TrumsWrapper>
    
    <div class="w-auto">
      <el-page-header @back="goBack">
      <template #content>
          <span class="text-large font-600 mr-3"> Buat Pricelist </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Simpan</el-button>
            <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
          </el-form-item>
        </div>
      </template>
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        :disabled="loading"
      >
        <el-form-item label="Nama" prop="name">
          <el-input v-model="ruleForm.name" placeholder="Masukan nama price tag" />
        </el-form-item>
        <el-form-item label="Gudang" prop="location.name">
          <el-autocomplete
            v-model="ruleForm.location.name!"
            :fetch-suggestions="querySearchLocation"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Lokasi"
            @select="handleSelectLocation"
          />
        </el-form-item>
        <el-form-item prop="start_date_view" label="Tanggal Mulai Berlaku">
          <el-date-picker
            v-model="ruleForm.start_date_view"
            type="date"
            aria-label="Pilih Tanggal"
            placeholder="Pilih Tanggal"
            style="width: 100%",
            @change="(value: any) => {
              const selected = new Date(value);
              ruleForm.start_date = selected.getTime() / 1000;
            }"
          />
        </el-form-item>
        <el-form-item prop="end_date_view" label="Tanggal Akhir Berlaku">
          <el-date-picker
            v-model="ruleForm.end_date_view"
            type="date"
            aria-label="Pilih Tanggal"
            placeholder="Pilih Tanggal"
            style="width: 100%",
            @change="(value: any) => {
              const selected = new Date(value);
              ruleForm.end_date = selected.getTime() / 1000;
            }"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mb-3" v-if="!loading">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"><el-input v-model="requestSearchInventory.keyword" size="large" placeholder="Type to search" /></el-col>
        
      </el-row>
      
      <el-table :data="ruleForm.pricetag_item">
          <el-table-column prop="catalogue.name" label="item" class="my-0">
              <template #default="scope">
                  <el-autocomplete
                      :disabled="loading"
                      :fetch-suggestions="querySearchAsyncInventories"
                      v-model="scope.row.catalogue.name"
                      
                      placeholder="Cari item"
                      @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
                  />
              </template>
          </el-table-column>
          <el-table-column prop="inventory_serial_number" label="Serial Number"/>
          <el-table-column prop="selling_price" label="Harga Jual" class="mb-0">
            <template #default="scope">
                  <el-form-item label="" :prop="`items.${scope.index}.price`" class="mb-0" style="margin-bottom: 0px !important">
                      <el-input v-model="scope.row.price" class="mb-0" />
                  </el-form-item>
              </template>
          </el-table-column>
          <el-table-column label="Aksi" width="100px" class="flex items-center">
            <template #default="scope" class="flex items-center">
              <el-popconfirm
                  width="220"
                  :icon="InfoFilled"
                  icon-color="#626AEF"
                  title="Are you sure to delete this?"
                  @cancel="() => {}"
                >
                  <template #reference>
                    <el-button type="danger" :icon="Delete" circle />
                  </template>
                  <template #actions="{ confirm, cancel }">
                    <el-button size="small" @click="cancel">No!</el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="() => onDeleteList(scope)"
                    >
                      Yes?
                    </el-button>
                  </template>
                </el-popconfirm>
              
            </template>
          </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewLine">
          Tambahkan Baris Baru
      </el-button>
        
    </el-card>
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Harga Khusus</span>
        </div>
      </template>
      
      <Collapse v-if="!loading" :elements="collapse_special_price ?? []" v-on:handle-change="(value) => {}" :active-names="['contacts']" />
        
    </el-card>
    </div>
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import { Filter, InfoFilled, Delete } from '@element-plus/icons-vue';
import { ElCheckbox, ElIcon, ElPopover, type CheckboxValueType, type Column, type ComponentSize, type FormInstance, type FormRules, type SortBy } from 'element-plus';
import type { Catalogue } from '~/types/catalogue';
import type { Inventory } from '~/types/inventory';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import type { Unit } from '~/types/unit';
import CustomTable from '~/components/trums/table/customTable.vue';
import SkeletonPage from '~/components/trums/SkeletonPage.vue';
import Collapse from '~/components/trums/Collapse.vue';
import type { Contact } from '~/types/contact';
import type { FunctionalComponent } from 'vue';
import type { Quotation } from '~/types/quotation';
import { OperationPriceTag, VariablePriceTag, type Pricetag, type Pricetag_condition, type Pricetag_item } from '~/types/pricetag';
import type { User } from '~/types/user';
import Special_price_kontak_componen from './special_price_kontak_componen.vue';
import Special_price_quantity_componen from './special_price_quantity_componen.vue';
import type { BaseResponse } from '~/types/response';
import type { Pricelist_item } from '~/types/pricelist';
  definePageMeta({
    middleware: ["auth", "app"],
  });
  const loading = ref<boolean>(false);
  const router = useRouter();
  const api = useApi();

  const goBack = () => router.back();
  const popoverRef = ref();

  
  const formSize = ref<ComponentSize>("default");
  const ruleFormRef = ref<FormInstance>();
  const ruleForm = reactive<Pricetag>({
    unique_id: '',
    name: '',
    location_id: '',
    start_date: 0,
    end_date: 0,
    start_date_view: '',
    end_date_view: '',
    owner_id: '',
    created_at: 0,
    created_by: '',
    updated_at: 0,
    version: 0,
    pricetag_item: [{
      catalogue: {
        id: null,
        unique_id: null,
        unique_code: null,
        name: '',
        brand_id: null,
        brand_name: null,
        year: null,
        sn: null,
        description: null,
        berat: null,
        volume: null,
        panjang: null,
        lebar: null,
        tinggi: null,
        is_asset: null,
        tmp_asset: null,
        version: null,
        type: '',
        created_at: null,
        created_by: null,
        updated_at: null,
        file_catalogues: []
      },
      unique_id: null,
      tag_id: null,
      catalogue_id: '',
      inventory_id: '',
      inventory: null,
      price: 0,
      is_new: true,
    }],
    condition: [],
    location: {
      id: null,
      unique_id: null,
      unique_code: null,
      name: '',
      brand_id: null,
      brand_name: null,
      year: null,
      sn: null,
      description: null,
      berat: null,
      volume: null,
      panjang: null,
      lebar: null,
      tinggi: null,
      is_asset: null,
      tmp_asset: null,
      version: null,
      type: '',
      created_at: null,
      created_by: null,
      updated_at: null,
      file_catalogues: [],
      checked: undefined
    }
  });

  // special price
  const contact_condition = ref<Pricetag_condition[]>([]);
  const location_condition = ref<Pricetag_condition[]>([]);
  const quantity = ref<Pricetag_condition>({
    operation: "greater_then",
    variable: VariablePriceTag.ITEM_QUANTITY,
    unique_id: null,
    tag_id: null,
    value: '0',
    variable_pricetag: {
      unique_id: '',
      name: VariablePriceTag.ITEM_QUANTITY,
      type: 'variable',
      slug: ''
    },
    operation_pricetag: {
      unique_id: '',
      name: OperationPriceTag.GREATER_THAN,
      type: 'operation',
      slug: ''
    },
  });
  
  const collapse_special_price = ref<{title: string, name: string, element: any}[]>();
  
  
  const requestSearchLocation = ref<RequestSearch>({
    keyword: "",
    table: "",
    column: null,
    sort: null,
    limit: "50",
    offset: "1",
  });

  const requestSearchInventory = ref<RequestSearch>({
    keyword: "",
    table: "inventories",
    column: [
      {
        location_id: [""],
        unit_id: [],
      }
    ],
    sort: null,
    limit: "50",
    offset: "1",
  });

  const requestSearchUnit = ref<RequestSearch>({
    keyword: "",
    table: "units",
    column: [],
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    },
    limit: "50",
    offset: "1",
  });

  const search_default = ref<RequestSearch>({
    keyword: "",
    table: "inventories",
    column: [
      {
        location_id: [""],
        contact_id: [""],
      },
    ],
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    },
    limit: "50",
    offset: "1",
  });

  
  const units = ref<Unit[]>([]);

  const rules = reactive<FormRules<Pricetag>>({
    name: [{ required: true, message: "Nama Price Tag Tidak Boleh Kosong!", trigger: "blur" }],
    location_id: [
      { required: true, message: "Gudang Tidak Boleh Kosong!", trigger: "blur" },
    ],
    "location.name": [{ required: true, message: "Gudang Tidak Boleh Kosong!", trigger: "blur" },],
    start_date: [
      {
        type: 'date',
        required: true,
        message: 'Tanggal Mulai Tidak Boleh Kosong!',
        trigger: 'change',
      }
    ],
    start_date_view: [
      {
        type: 'date',
        required: true,
        message: 'Tanggal Mulai Tidak Boleh Kosong!',
        trigger: 'change',
      }
    ],
    pricetag_item: {
        type: 'array',
        required: true,
        min: 1,
        message: 'Item Tidak Boleh Kosong!',
        trigger: 'change'
    },
  });

  const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
    requestSearchLocation.value.keyword = queryString;
    requestSearchLocation.value.table = "catalogues";
    requestSearchLocation.value.column = [
      {
        type: ["place"],
      },
    ];

    useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'warehouse', 'post', requestSearchLocation.value).then((response) => {
      if(response.status.value == 'success'){
        
        const resultApi: Catalogue[] = response.data.value?.data ?? [];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        }
      }
    }).catch((error: any) => {
      ElMessage.error(error.response?.data?.message ?? error);
    })

    
  };
  const querySearchQuotation = (queryString: string, cb: (arg: any) => void) => {
    requestSearchLocation.value.keyword = queryString;
    requestSearchLocation.value.table = "offers";
    requestSearchLocation.value.column = [];

    useFetchApi<ResponsePagination<Quotation[]>>('/search', 'offers', 'post', requestSearchLocation.value).then((response) => {
      if(response.status.value == 'success'){
        const resultApi: Quotation[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.sourcing_number })));
        }
      }
    }).then((error: any) => {
      ElMessage.error(error.response?.data?.message ?? error);
    })

    
  };

  const fetchUnits = async () => {
    loading.value = true;
    try {
      const response = await useFetchApi<ResponsePagination<Unit[]>>(`/search`, 'units', 'post', requestSearchUnit);

      
      if(response.status.value == 'success'){
        
        units.value = (response.data.value as ResponsePagination<Unit[]>).data;
        console.log(units.value);
      }
    } catch (error: any) {
      
      ElMessage.error(error.response?.data?.message ?? error);
      return [];
    } finally {
      loading.value = false;
    }
    
  }

  const handleSelectLocation = (item: Record<string, any>) => {
    const catalogue: Catalogue = item as Catalogue;

    ruleForm.location = catalogue;
    ruleForm.location_id = catalogue.unique_id!;
  };


  
  

  const addNewLine = () => {
      const newItem: {
        unique_id: string|null,
        tag_id: string|null,
        catalogue_id: string,
        catalogue: Catalogue | null,
        inventory_id: string,
        inventory: Inventory|null,
        price: number,
        is_new?: boolean,
      }[] = [...ruleForm.pricetag_item, {
          catalogue: {
            id: null,
            unique_id: null,
            unique_code: null,
            name: '',
            brand_id: null,
            brand_name: null,
            year: null,
            sn: null,
            description: null,
            berat: null,
            volume: null,
            panjang: null,
            lebar: null,
            tinggi: null,
            is_asset: null,
            tmp_asset: null,
            version: null,
            type: '',
            created_at: null,
            created_by: null,
            updated_at: null,
            file_catalogues: []
          },
          unique_id: null,
          tag_id: null,
          catalogue_id: '',
          inventory_id: '',
          inventory: null,
          price: 0,
          is_new: true,
      }];

      ruleForm.pricetag_item = newItem;

  }

  

  type SelectionCellProps = {
    value: boolean
    intermediate?: boolean
    onChange: (value: CheckboxValueType) => void
  }

  // const checkSelect = () => da?.value?.data.some((row) => row.checked);

  const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
    value,
    intermediate = false,
    onChange,
  }) => {
    return (
      <ElCheckbox
        onChange={onChange}
        modelValue={value}
        indeterminate={intermediate}
      />
    )
  }
  
  const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
    const data: RequestSearch = {
        table: 'catalogues',
        column: [
            {
                type: ['item'],
            },
        ],
        keyword: queryString,
        limit: "20",
        offset: "1",
        sort: null,
    }
    useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'catalogues', 'post', data).then((response) => {
        if(response.status.value == 'success'){
            const inventories: Catalogue[] = response.data?.value?.data ?? [];

            const results = inventories.map((data: Catalogue) => {
                return {value: `${data.name}-${data.sn}`, unique_id: data.unique_id, object: data};
            });    
            cb(results)
        }
    }).catch((error: any) => {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
    })
  }

  const onHandleSelectItemAutocomplete = (record: Record<string, any>, scope: any) => {
      console.log(record)
      if(record.object != undefined){
          const catalogue: Catalogue = record.object as Catalogue;
          ruleForm.pricetag_item[scope.$index].catalogue_id = catalogue.unique_id!;
          ruleForm.pricetag_item[scope.$index].catalogue = catalogue;
          ruleForm.pricetag_item[scope.$index].price = 0;
      }

  }

  const deleteItemInServer = (string: string[]) => {
    loading.value = false;
    try {
      useFetchApi<BaseResponse<any>>('/pricetag-item-delete', 'pricetag-item-delete', 'post', string).then((response) => {
        if(response.status.value == 'success'){
          ElMessage.success(`Data Berhasil Di Hapus`);
          fetchInitialData();
        }
      });
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
      loading.value = false;
    }
  }
  

  const onDeleteList = (data: any) => {
    const price_list_item: Pricetag_item = data.row;
    // console.log(data);
    if(!price_list_item!.is_new){
      deleteItemInServer([price_list_item.unique_id!]);
    }else{
      ruleForm.pricetag_item.splice(data.$index, 1);
    }
  }

  const onSort = (sortBy: SortBy) => {
    console.log('sort', sortBy.key);
    console.log(requestSearchInventory.value);
    const data:RequestSearch = {...requestSearchInventory.value};
    data.sort = {
      column: sortBy.key.toString(),
      order: requestSearchInventory.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
    };
    requestSearchInventory.value = data;
    

  }

  const onSubmit = async (formEl: FormInstance) => {
    
    loading.value = true;
    try {
      const dateObjectStart = new Date(ruleForm.start_date_view);
      const dateObjectEnd = new Date(ruleForm.end_date_view);
      


      // const pricelistObj: Pricetag = {
      //   name: ruleForm.name,
      //   end_date: ruleForm.end_date,
      //   start_date: ruleForm.start_date,
      //   unique_id: '',
      //   location_id: '',
      //   location: {
      //     id: null,
      //     unique_id: null,
      //     unique_code: null,
      //     name: null,
      //     brand_id: null,
      //     brand_name: null,
      //     year: null,
      //     sn: null,
      //     description: null,
      //     berat: null,
      //     volume: null,
      //     panjang: null,
      //     lebar: null,
      //     tinggi: null,
      //     is_asset: null,
      //     tmp_asset: null,
      //     version: null,
      //     type: '',
      //     created_at: null,
      //     created_by: null,
      //     updated_at: null,
      //     file_catalogues: [],
      //     checked: undefined
      //   },
      //   start_date_view: '',
      //   end_date_view: '',
      //   owner_id: '',
      //   created_at: 0,
      //   created_by: '',
      //   updated_at: 0,
      //   version: 0,
      //   items: [],
      //   condition: []
      // }

      const cookie = useCookie('userdata');
      ruleForm.owner_id = (cookie.value! as unknown as User).unique_id;


      
      var data_price_tag = {
        "name": ruleForm.name,
        "location_id": ruleForm.location_id,
        "start_date": ruleForm.start_date,
        "end_date": ruleForm.end_date,
        "pricetag_item": ruleForm.pricetag_item.map((value) => {
            return {
              "unique_id": value.unique_id,
              "tag_id": value.tag_id,
              "catalogue_id": value.catalogue_id,
              "inventory_id": value.inventory_id,
              "price": parseInt(`${value.price}`),
            }
        }),
        "condition": [
          ...contact_condition.value.map((value) => ({
              unique_id: value.unique_id,
              tag_id: value.tag_id,
              variable: value.variable_pricetag?.name,
              operation: value.operation_pricetag?.name,
              value: value.value,
          })),
          ...location_condition.value.map((value) => ({
              unique_id: value.unique_id,
              tag_id: value.tag_id,
              variable: value.variable_pricetag?.name,
              operation: value.operation_pricetag?.name,
              value: value.value,
          })),
          
        ]
      }

      console.log(quantity.value.value);

      if(parseInt(quantity.value.value) > 0){
        data_price_tag.condition.push({
              unique_id: quantity.value.unique_id,
              tag_id: quantity.value.tag_id,
              variable: quantity.value.variable_pricetag?.name,
              operation: quantity.value.operation_pricetag?.name,
              value: quantity.value.value,
          })
      }

      const unique_id = useCookie('tag_id');


      if(unique_id.value){
        data_price_tag = {...data_price_tag, ...{unique_id: unique_id}};
      }


      const response = await useFetchApi('/pricetag-create', 'pricelist-create', 'post', data_price_tag);

      if(response.status.value == 'success'){
        ElMessage.success("Berhasil");
        formEl.resetFields();
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message ?? error);
    } finally {
      loading.value = false;
    }
  }

  const submitForm = async (formEl: FormInstance | undefined) => {
    
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        onSubmit(formEl);
      } else {
        console.log('error submit!', fields)
      }
    })
  }

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
  }

  // watch(requestSearchInventory, fetchData, {immediate: true});

  const initialSpecialPrice = () => {
   
    
    
    collapse_special_price.value = [
      {
        element: <Special_price_kontak_componen type="kontak" conditions={contact_condition.value} />,
        name: 'Contacts',
        title: 'Contacts'
      },
      {
        element: <Special_price_kontak_componen type="location" conditions={location_condition.value} />,
        name: 'Location',
        title: 'Location'
      },
      {
        element: <Special_price_quantity_componen initaial_value={parseInt(quantity.value.value)} onChange={(value) => quantity.value!.value = value.toString()} />,
        name: 'Minimum Quantity',
        title: 'Minimum Quantity'
      }
    ]
  }

  const fetchInitialData = async () => {
    loading.value = true;
    const unique_id = useCookie('tag_id');
    try {
      const response = await useFetchApi<BaseResponse<Pricetag>>(`/pricetag-read/${unique_id.value}`, 'pricetag-detail', 'get', null);
      
      if(response.status.value == 'success'){
          const pricetagEdit = response.data.value?.data as Pricetag;
        

          const dateViewStart = new Date(pricetagEdit.start_date * 1000);
          const dateViewEnd = pricetagEdit.end_date > 0 ? new Date(pricetagEdit.end_date * 1000) : null;

          ruleForm.unique_id = pricetagEdit.unique_id;
          ruleForm.name = pricetagEdit.name;
          ruleForm.location_id = pricetagEdit.location_id;
          ruleForm.start_date = pricetagEdit.start_date;
          ruleForm.end_date = pricetagEdit.end_date;
          ruleForm.start_date_view = dateViewStart.toString();
          if(pricetagEdit.end_date > 0){
            ruleForm.end_date_view = dateViewEnd!.toString();
          }
          ruleForm.owner_id = pricetagEdit.owner_id;
          ruleForm.created_at = pricetagEdit.created_at;
          ruleForm.created_by = pricetagEdit.created_by;
          ruleForm.updated_at = pricetagEdit.updated_at;
          ruleForm.version = pricetagEdit.version;
          ruleForm.pricetag_item = pricetagEdit.pricetag_item.map((value) => ({
            ...value,
            is_new: false,
          }));
          ruleForm.pricetag_condition = pricetagEdit.pricetag_condition;
          ruleForm.location = pricetagEdit.location;

          pricetagEdit.pricetag_condition.forEach((value) => {
            if(value.variable_pricetag?.name == VariablePriceTag.KONTAK){
              console.log(value.variable_pricetag);
              contact_condition.value.push({
                ...value,
                value_display: value.data?.name ?? '',
                is_new: false,
              });
            }else if(value.variable_pricetag?.name == VariablePriceTag.LOCATION){
              location_condition.value.push({
                ...value,
                ...value,
                value_display: value.data?.name ?? '',
                is_new: false,
              });
            }else if(value.variable_pricetag?.name == VariablePriceTag.ITEM_QUANTITY){
              quantity.value = value;
              quantity.value.is_new = false;
            }

            // initialSpecialPrice();
          })


          
          initialSpecialPrice();
          

      } 
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    const unique_id = useCookie('tag_id');
    
    

    if(unique_id.value){
      fetchInitialData();
    }else{
      initialSpecialPrice();
      fetchUnits();
    }
  })
</script>