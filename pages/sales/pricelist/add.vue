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

        <el-form-item prop="owner_name" label="Kontak">
          <el-autocomplete
            
              v-model="ruleForm.owner_name"
              :fetch-suggestions="querySearchVendors"
              placeholder="Cari vendor"
              @select="onHandleSelectVendor"
              style="width: 100%"
            >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>
                {{ item.value }}
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        
        <el-form-item prop="start_date" label="Tanggal Mulai Berlaku">
          <el-date-picker
            v-model="ruleForm.start_date"
            type="date"
            aria-label="Pilih Tanggal"
            placeholder="Pilih Tanggal"
            style="width: 100%",
            
          />
        </el-form-item>
        <el-form-item prop="end_date" label="Tanggal Akhir Berlaku">
          <el-date-picker
            v-model="ruleForm.end_date"
            type="date"
            aria-label="Pilih Tanggal"
            placeholder="Pilih Tanggal"
            style="width: 100%",
            
          />
        </el-form-item>
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="ruleForm.note" type="textarea" placeholder="Masukkan deskripsi" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mb-3" v-if="!loading">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"><el-input v-model="requestSearchInventory.keyword" size="large" placeholder="Type to search" /></el-col>
        
      </el-row>
      
      <el-table :data="ruleForm.pricetag_item">
          <el-table-column prop="item_name" label="item" class="my-0">
              <template #default="scope">
                  <el-autocomplete
                      :disabled="loading"
                      :fetch-suggestions="querySearchAsyncInventories"
                      v-model="scope.row.item_name"
                      
                      placeholder="Cari item"
                      @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
                        
                  >
                  <template #default="{ item }">
                      <div v-if="item.isNew" class="flex items-center text-blue-500">
                          <el-icon><Plus /></el-icon>
                          <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                      </div>
                      <div v-else>
                          <p style="line-height: 15px;" class="font-bold">{{ item.value }}</p>
                          <p  v-if="item.type === 'inventory'">PN/SN: {{ item.sn_number ?? 'Tidak Ada' }} | Lokasi: {{item.location_name ?? 'Tidak Ada'}} | Available Stok: {{item.available}}</p>
                          <p v-if="item.type === 'catalogue'">PN/SN: {{ item.sn_number ?? 'Tidak Ada' }} </p>
                      </div>
                  </template>
                </el-autocomplete>
              </template>
          </el-table-column>
          <el-table-column prop="sn" label="Serial Number" width="250"/>
          <el-table-column prop="quantity" label="QTY" class="mb-0" width="70"/>
          <el-table-column prop="unit" label="Unit" width="100">
              <template #default="scope">
                <el-autocomplete
                  :fetch-suggestions="querySearchUnit"
                  v-model="scope.row.unit_name"
                  placeholder="Input Units"
                  @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteUnit(item, scope)"
                />
              </template>
          </el-table-column>
          <el-table-column prop="selling_price" label="Harga Jual" class="mb-0" width="150">
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
      
      <Collapse v-if="!loading" :elements="collapse_special_price ?? []" v-on:handle-change="(value: any) => {}" :active-names="['contacts']" />
        
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
import { OperationPriceTag, ReferencePriceTag, VariablePriceTag, type Pricetag, type Pricetag_condition, type Pricetag_item } from '~/types/pricetag';
import type { User } from '~/types/user';
import Special_price_kontak_componen from './special_price_kontak_componen.vue';
import Special_price_quantity_componen from './special_price_quantity_componen.vue';
import type { BaseResponse } from '~/types/response';
import type { Pricelist_item } from '~/types/pricelist';
import type { ItemSearch } from '~/types/item_search';
import type { Pagination } from '~/types/pagination';
import type { Canvassing } from '~/types/scm/canvasing';
  definePageMeta({
    middleware: ["auth", "app"],
  });
  const loading = ref<boolean>(false);
  const router = useRouter();
  const api = useApi();

  const goBack = () => router.back();
  const popoverRef = ref();
  const route = useRoute()
  const canvassing_id = computed(() => route.query.canvassing_id as string)
  
  const formSize = ref<ComponentSize>("default");
  const ruleFormRef = ref<FormInstance>();
  const ruleForm = reactive<Pricetag>({
    unique_id: '',
    name: '',
    location_id: '',
    start_date: Date.now(),
    end_date: Date.now(),
    start_date_view: '',
    end_date_view: '',
    owner_id: '',
    created_at: 0,
    created_by: '',
    updated_at: 0,
    version: 0,
    type: "in",
    note: '',
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
      unit_id: '',
      unit_name: '',
      unit_version: 0,
      checked: false,
      quantity: 1,
    }],

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
    },
    pricetag_condition: [],
    reference: null,
    reference_version: null,
    reference_id: null,
    files: []
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
    column: [],
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

  const rules = reactive<FormRules>({
    name: [{ required: true, message: "Nama Price Tag Tidak Boleh Kosong!", trigger: "blur" }],
    owner_name: [
      { required: true, message: "Kontak Tidak Boleh Kosong!", trigger: "blur", },
    ],
    
    start_date: [
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
    requestSearchLocation.value.flag = "form";

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
    requestSearchLocation.value.flag = "form";

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

  const querySearchVendors =  (query: string, cb: (arg: any) => void) => {
    try {
      const request_search: RequestSearch = {
        column: [],
        keyword: query,
        limit: '50',
        offset: '1',
        sort: {
          column: 'created_at',
          order: OrderColumn.ASC,
        },
        table: 'contacts'
      }

      useFetchApi<ResponsePagination<Contact>>('/search', 'search-customer', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
          const contacts: Contact[] = (response.data.value?.data ?? []) as Contact[];
          if(contacts.length > 0){
            cb(contacts.map((value) => ({
            value: value.name,
            unique_id: value.unique_id,
            data: value,
          })));
          }else{
            cb([{
              value: query,
              isNew: true,
              keyword: query,
            }])
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch vendors', error)
      cb([])
    }
  }

  const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
    var params = {...requestSearchUnit.value};
    params.keyword = queryString;
    params.table = 'units';
    params.column = [];
    useFetchApi<ResponsePagination<Unit[]>>('/search','search-unit', 'post', params).then((response) => {
        if(response.status.value === 'success'){
            const resultApi: Unit[]  = response.data.value?.data ?? [];
            
            if(resultApi.length > 0){
                cb(resultApi.map((value) => ({...value, value: value.name})));
            }else{
                cb([{value: `Tambahkan ${queryString}`, label: `${queryString}`}]);
            }
        }
    }).catch((error: any) => {
        ElMessage.error(error.response?.data?.message);
    })
  }

  const createNewVendor = async (data: any) => {
    try {
      const response = await useFetchApi<BaseResponse<Contact>>('/contact-create', 'create-customer', 'post', data);
      if(response.status.value == 'success'){
        return response.data.value?.data;
      }
    } catch (error: any) {
      ElMessage.error(error.response.message ?? error);
    }
  }

  const onHandleSelectVendor = (item: any) => {
    if (item.isNew) {
      createNewVendor({name: item.keyword}).then(customer => {
        if (customer) {
          ruleForm.owner_id = customer.unique_id;
          ruleForm.owner_name = customer.name;
          
        }
      })
    } else {
      const customer = item.data as Contact
      console.log(customer);
      ruleForm.owner_id = customer.unique_id;
      ruleForm.owner_name = customer.name;
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
        unit_id: string|null,
        unit_name: string|null,
        unit_version: number|null,
        quantity: number,
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
          unit_id: '',
          unit_name: '',
          unit_version: 0,
          quantity: 1,
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
    const data = {
        location_id: ruleForm.location_id,
        keyword: queryString,
        limit: 50,
    }
    useFetchApi<Pagination<ItemSearch[]>>('/catalogues-inventory', 'catalogues-inventory', 'post', data).then((response) => {
        if(response.status.value == 'success'){
            const inventories: ItemSearch[] = response.data?.value?.query ?? [];

            if(inventories.length > 0){
              const results = inventories.map((data: ItemSearch) => {
                  return {isNew: false, value: `${data.catalogue_name}-${data.sn_number}`, ...data};
              });    
              cb(results)
            }else{
              cb([{
                isNew: true,
                value: `${queryString}`,
                name: `Tambahkan ${queryString}`,
              }])
            }
        }
    }).catch((error: any) => {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
    })
  }

  const create_catalogue = async (catalogue: Catalogue) => {
      loading.value = true;
      try {

          const formData = new FormData();

          formData.append('unique_id', (catalogue.unique_id ?? ''));
          formData.append('name', (catalogue.name ?? ''));
          formData.append('brand_id', (catalogue.brand_id ?? ''));
          formData.append('year', (catalogue.year ?? ''));
          formData.append('sn', (catalogue.sn ?? ''));
          formData.append('description', (catalogue.description ?? ''));
          formData.append('berat', (catalogue.berat ?? 0).toString());
          formData.append('volume', `${catalogue.panjang}x${catalogue.lebar}x${catalogue.tinggi}`);
          formData.append('is_asset', (catalogue.tmp_asset == '1' ? true : false).toString());
          formData.append('type', catalogue.type);

          const response = await useFetchApi<BaseResponse<Catalogue>>('/catalogues-create', 'catalogue-create', 'post', formData);
          if(response.status.value == 'success'){
              const catalogue_result: Catalogue|null = response.data.value?.data ?? null;
              return catalogue_result;
          }
      } catch (error: any) {
          ElMessage.error(error?.response?.message ?? error);
      } finally {
          loading.value = false;
      }
  }

  const onHandleSelectItemAutocomplete = async (record: Record<string, any>, scope: any) => {
      if(record.isNew){
        const catalogueInsert: Catalogue = {
          name: record.value,
          id: null,
          unique_id: null,
          unique_code: null,
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
          type: 'item',
          created_at: null,
          created_by: null,
          updated_at: null,
          file_catalogues: []
        }
        const selected: Catalogue|null = await create_catalogue(catalogueInsert) ?? null;

        if(selected != null){
          ruleForm.pricetag_item[scope.$index].item_name = selected.name!;
          ruleForm.pricetag_item[scope.$index].catalogue_id = selected.unique_id!;
          ruleForm.pricetag_item[scope.$index].sn = selected.sn ?? 'Tidak Ada SN/PN';
          ruleForm.pricetag_item[scope.$index].quantity = 1;
        }else{
          ElMessage.error(`Ops, Something wrong!!`);
        }
      }else{
        const selected: ItemSearch = record as ItemSearch;
        ruleForm.pricetag_item[scope.$index].item_name = selected.catalogue_name!;
        ruleForm.pricetag_item[scope.$index].catalogue_id = selected.catalogue_id!;
        ruleForm.pricetag_item[scope.$index].sn = selected.sn_number ?? 'Tidak Ada SN/PN';
        ruleForm.pricetag_item[scope.$index].inventory_id = selected.inventory_id ?? '';
        ruleForm.pricetag_item[scope.$index].unit_id = selected.unit_id ?? '';
        ruleForm.pricetag_item[scope.$index].unit_name = selected.unit_name ?? '';
        ruleForm.pricetag_item[scope.$index].quantity = 1;
        // ruleForm.pricetag_item[scope.$index].catalogue = catalogue;
        ruleForm.pricetag_item[scope.$index].price = 0;
      }
  }

  const onHandleSelectItemAutocompleteUnit = (item: Record<string, any>, scope: any) => {
    
    if(item.unique_id == undefined){
      ruleForm.pricetag_item[scope.$index].unit_name = item.label;
      ruleForm.pricetag_item[scope.$index].unit_id = '';
    }else{
      ruleForm.pricetag_item[scope.$index].unit_name = item.value;
      ruleForm.pricetag_item[scope.$index].unit_id = `${item.id}`;
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
      
      const cookie = useCookie('userdata');
      // ruleForm.owner_id = (cookie.value! as unknown as User).unique_id;


      
      const formData = new FormData()

      formData.append('name', `${ruleForm.name}`)
      formData.append('location_id', `${ruleForm.location_id}`)
      formData.append('start_date', `${ruleForm.start_date / 1000}`)
      formData.append('end_date', `${ruleForm.end_date / 1000}`)
      formData.append('owner_id', `${ruleForm.owner_id}`)
      formData.append('reference', `${ruleForm.reference}`)
      formData.append('reference_id', `${ruleForm.reference_id}`)
      formData.append('reference_version', `${ruleForm.reference_version}`)
      formData.append('type', `${ruleForm.type}`)
      formData.append('note', `${ruleForm.note}`)

      // Append pricetag_item array
      ruleForm.pricetag_item.forEach((value, index) => {
        formData.append(`pricetag_item[${index}][unique_id]`, `${value.unique_id}`)
        formData.append(`pricetag_item[${index}][tag_id]`, `${value.tag_id}`)
        formData.append(`pricetag_item[${index}][catalogue_id]`, `${value.catalogue_id}`)
        formData.append(`pricetag_item[${index}][catalogue_version]`, `${value.catalogue?.version}`)
        formData.append(`pricetag_item[${index}][inventory_id]`, `${value.inventory_id}`)
        formData.append(`pricetag_item[${index}][price]`, `${value.price}`)
        formData.append(`pricetag_item[${index}][unit_id]`, `${value.unit_id}`)
        formData.append(`pricetag_item[${index}][unit_name]`, `${value.unit_name}`)
        formData.append(`pricetag_item[${index}][unit_version]`, `${value.unit_version}`)
        formData.append(`pricetag_item[${index}][quantity]`, `${value.quantity}`)
      })

      // Combine conditions (contact + location)
      let allConditions = [
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

      // Add quantity condition if available
      if (parseInt(quantity.value.value) > 0) {
        allConditions.push({
          unique_id: quantity.value.unique_id,
          tag_id: quantity.value.tag_id,
          variable: quantity.value.variable_pricetag?.name,
          operation: quantity.value.operation_pricetag?.name,
          value: quantity.value.value,
        })
      }

      // Append all conditions
      allConditions.forEach((cond, index) => {
        formData.append(`condition[${index}][unique_id]`, `${cond.unique_id}`)
        formData.append(`condition[${index}][tag_id]`, `${cond.tag_id}`)
        formData.append(`condition[${index}][variable]`, `${cond.variable}`)
        formData.append(`condition[${index}][operation]`, `${cond.operation}`)
        formData.append(`condition[${index}][value]`, `${cond.value}`)
      })

      // Get unique_id from cookie
      const unique_id = useCookie('tag_id')
      if (unique_id.value) {
        formData.append('unique_id', `${unique_id.value}`)
      }


      const response = await useFetchApi<BaseResponse<Pricetag>>('/pricetag-create', 'pricelist-create', 'post', formData);

      if(response.status.value == 'success'){
        const pricetag: Pricetag | undefined = response.data.value?.data;
        ElMessage.success("Berhasil");

        const unique_id = useCookie('tag_id');

        if(unique_id.value){
          fetchInitialData();
        }else{
          if(canvassing_id.value && pricetag){
            window.location.href = `/sales/pricelist/${pricetag.unique_id}`;
          }else{
            formEl.resetFields();
          }
        }
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
          ruleForm.start_date = dateViewStart.getTime();
          if(dateViewEnd != null){
            ruleForm.end_date = dateViewEnd.getTime();
          }
          // ruleForm.start_date_view = dateViewStart.toString();
          // if(pricetagEdit.end_date > 0){
          //   ruleForm.end_date_view = dateViewEnd!.toString();
          // }
          ruleForm.owner_id = pricetagEdit.owner_id;
          ruleForm.owner_name = pricetagEdit.owner?.name ?? '';
          ruleForm.created_at = pricetagEdit.created_at;
          ruleForm.created_by = pricetagEdit.created_by;
          ruleForm.updated_at = pricetagEdit.updated_at;
          ruleForm.version = pricetagEdit.version;
          ruleForm.pricetag_item = pricetagEdit.pricetag_item.map((value) => ({
            ...value,
            item_name: value.catalogue?.name ?? '',
            sn:value.catalogue?.sn ?? 'N/A',
            is_new: false,
          }));
          ruleForm.pricetag_condition = pricetagEdit.pricetag_condition;
          ruleForm.location = pricetagEdit.location;

          pricetagEdit.pricetag_condition.forEach((value) => {
            if(value.variable_pricetag?.name == VariablePriceTag.KONTAK){
              console.log(value.value_data);
              contact_condition.value.push({
                ...value,
                value_display: value.value_data?.name ?? '',
                is_new: false,
              });
            }else if(value.variable_pricetag?.name == VariablePriceTag.LOCATION){
              location_condition.value.push({
                ...value,
                ...value,
                value_display: value.value_data?.name ?? '',
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

  const fetchCanvassing = async () => {
    loading.value = true
    try {
      const response = await useFetchApi<BaseResponse<Canvassing>>(
        `/canvassing-read/${canvassing_id.value}`, 
        'detail-canvassing', 
        'get', 
        null
      );

      if(response.status.value == 'success'){
        const canvassing: Canvassing|null = response.data.value?.data ?? null;

        if(canvassing){
          ruleForm.reference = ReferencePriceTag.CANVASSING;
          ruleForm.reference_id = canvassing.unique_id;
          ruleForm.reference_version = canvassing.version;
          ruleForm.start_date_view = (Date.now() / 1000).toString();
          ruleForm.type = 'out';

          ruleForm.pricetag_item = canvassing.canvassing_item.map((item) => ({
            unique_id: null,
            tag_id: null,
            catalogue: item.catalogue ?? null,
            catalogue_id: item.catalogue_id,
            inventory_id: '',
            inventory: null,
            price: item.unit_selling_price,
            is_new: true,
            unit_id: item.unit_id,
            unit_name: item.unit_name,
            unit_version: item.unit_version,
            sn: item.catalogue?.sn ?? 'N/A',
            checked: false,
            item_name: item.catalogue?.name ?? '',
            quantity: item.quantity,
          }))

          contact_condition.value.push({
            operation: "is_equal",
            variable: VariablePriceTag.KONTAK,
            unique_id: null,
            tag_id: null,
            value: `${canvassing.source?.request_by?.unique_id}`,
            value_display: `${canvassing.source?.request_by?.name}`,
            variable_pricetag: {
              unique_id: '',
              name: VariablePriceTag.KONTAK,
              type: 'variable',
              slug: ''
            },
            operation_pricetag: {
              unique_id: '',
              name: OperationPriceTag.IS_EQUAL,
              type: 'operation',
              slug: ''
            },
          });
        }

      }




      
    } catch (error) {
      ElMessage.error('Failed to fetch canvassing data')
      console.error(error)
      goBack();
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {

    if(canvassing_id.value){
      fetchCanvassing();
    }

    const unique_id = useCookie('tag_id');
    
    

    if(unique_id.value){
      fetchInitialData();
    }else{
      initialSpecialPrice();
      
    }
  })
</script>