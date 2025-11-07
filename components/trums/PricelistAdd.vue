<template>
    <TrumsWrapper>
      
      <div class="w-auto" v-if="!loading">
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
    
            <el-form-item label="Gudang" prop="location_name">
              <el-autocomplete
                v-model="pricelist!.location.name!"
                :fetch-suggestions="querySearchLocation"
                :trigger-on-focus="false"
                clearable
                class="inline-input w-50"
                placeholder="Pilih Lokasi"
                @select="handleSelectLocation"
              />
            </el-form-item>
            <el-form-item label="Customer" prop="contact_name">
              <el-autocomplete
                v-model="pricelist!.contact_name"
                :fetch-suggestions="querySearchContact"
                :trigger-on-focus="false"
                clearable
                class="inline-input w-50"
                placeholder=""
                @select="handleSelectContact"
              />
              </el-form-item>
              <el-form-item prop="starting_date" label="Tanggal Mulai Berlaku">
                <el-date-picker
                  v-model="pricelist!.starting_date"
                  type="date"
                  aria-label="Pilih Tanggal"
                  placeholder="Pilih Tanggal"
                  style="width: 100%"
                />
              </el-form-item>
          </el-form>
    
        <el-card class="mb-3">
          <el-row :gutter="20" class="mb-3">
            <el-col :span="6"><el-input v-model="requestSearchInventory.keyword" size="large" placeholder="Type to search" /></el-col>
            
          </el-row>
          
          <el-table :data="pricelist!.pricelist_item">
              <el-table-column prop="name" label="item" >
                  <template #default="scope">
                      <el-autocomplete
                          :disabled="loading"
                          :fetch-suggestions="querySearchAsyncInventories"
                          v-model="scope.row.name"
                          
                          placeholder="Cari item"
                          @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
                      />
                  </template>
              </el-table-column>
              <el-table-column prop="sn" label="Serial Number">
                  <template #default="scope">
                      <el-input v-model="scope.row.sn" @change="(e) => onChangeSerialNumber(e, scope)" :disabled="true" placeholder="Masukan Serial Number" />
                  </template>
              </el-table-column>
              <el-table-column prop="quantity" label="Quantity">
                  <template #default="scope">
                      <el-input v-model="scope.row.quantity" @change="(e) => onChangeQuantity(e, scope)" :disabled="true" placeholder="Masukan quantity" />
                  </template>
              </el-table-column>
              <el-table-column prop="cost" label="Harga Beli">
                  <template #default="scope">
                      <el-input v-model="scope.row.cost" @change="(e) => onChangeCost(e, scope)" :disabled="true" placeholder="Masukan Harga Beli" />
                  </template>
              </el-table-column>
              <el-table-column prop="selling_price" label="Harga Jual">
                  <template #default="scope">
                      <el-input v-model="scope.row.selling_price" @change="(e) => onChangeSellingPrice(e, scope)" :disabled="loading" placeholder="Masukan Harga Jual" />
                  </template>
              </el-table-column>
              
              <el-table-column prop="unit_name" label="Unit">
                  <template #default="scope">
                  <el-input
                      :disabled="true"
                      v-model="scope.row.unit_name"
                      placeholder="Masukkan unit"
                      :readonly=true
                  />
                  </template>
              </el-table-column>
          </el-table>
          <el-button class="mt-4" style="width: 100%" @click="addNewLine">
              Tambahkan Baris Baru
          </el-button>
            
        </el-card>
      </div>
    </TrumsWrapper>
  </template>
  <script lang="tsx" setup>
  import { Filter, InfoFilled } from '@element-plus/icons-vue';
  import { ElCheckbox, ElIcon, ElPopover, type CheckboxValueType, type Column, type ComponentSize, type FormInstance, type FormRules, type SortBy } from 'element-plus';
  import type { Catalogue } from '~/types/catalogue';
  import type { Inventory } from '~/types/inventory';
  import { OrderColumn, type RequestSearch } from '~/types/request_search';
  import type { ResponsePagination } from '~/types/response_pagination';
  import type { Unit } from '~/types/unit';
  import CustomTable from '~/components/trums/table/customTable.vue';
  import SkeletonPage from '~/components/trums/SkeletonPage.vue';
  import type { Contact } from '~/types/contact';
  import type { FunctionalComponent } from 'vue';
import type { BaseResponse } from '~/types/response';
import type { Pricelist } from '~/types/pricelist';
    definePageMeta({
      middleware: ["auth", "app"],
    });


    const props = defineProps<{
        onSubmitPricelist: (pricelist: Pricelist|null) => void,
        onCancel: () => void,
        pricelist: Pricelist,
    }>();

    const loading = ref<boolean>(false);
    const router = useRouter();
    const api = useApi();
  
    const goBack = () => router.back();
    const popoverRef = ref();

    const pricelistData = ref<Pricelist|null>(null);
  
    const tableItem = ref<Inventory[]>([]);
    const formSize = ref<ComponentSize>("default");
    const ruleFormRef = ref<FormInstance>();
    interface RuleForm {
      unique_id: string,
      starting_date: string,
      location_name: string,
      location_id: string,
      location_version: number,
      contact_id: string,
      contact_name: string,
      contact_version: number,
    }
    const ruleForm = reactive<RuleForm>({
      unique_id: '',
      starting_date: '',
      location_name: '',
      location_id: '',
      location_version: 0,
      contact_id: '',
      contact_name: '',
      contact_version: 0,
    });
  
    
  
    
    
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
  
    const rules = reactive<FormRules<RuleForm>>({
      starting_date: [
        {
          type: 'date',
          required: true,
          message: 'Tanggal Mulai Berlaku Tidak Boleh Kosong!',
          trigger: 'change',
        }
      ],
      location_id: [
        { required: true, message: "Gudang Inventory Tidak Boleh Kosong!", trigger: "blur" },
      ],
      location_name: [
        { required: true, message: "Gudang Inventory Tidak Boleh Kosong!", trigger: "blur" },
      ],
      contact_id: [{ required: true, message: "Customer Tidak Boleh Kosong!", trigger: "blur" }],
      contact_name: [{ required: true, message: "Customer Tidak Boleh Kosong!", trigger: "blur" }],
    });
  
  
    const fetchDataDefault = async () => {
      loading.value = true;
      try {
        const response = await useFetchApi<ResponsePagination<Inventory[]>>(`/search`, 'search_inventory', 'post', search_default.value);
  
        console.log(response.status);
        if(response.status.value == 'success'){
          data.value = response.data.value as ResponsePagination<Inventory[]>;
          tableItem.value = data.value.data.map((value) => ({
            id: tableItem.value.length + 1,
            unique_id: value.unique_id,
            quantity: value.quantity,
            unit_name: value.unit_name,
            cost: value.cost,
            selling_price: value.selling_price??0,
            sn: value.sn,
            contact_id: '',
            contact_name: '',
            contact_version: 0,
            unique_code: '',
            catalogue_id: '',
            catalogue: {
              id: null,
              unique_id: null,
              unique_code: null,
              name: null,
              brand_id: null,
              year: null,
              sn: null,
              description: null,
              berat: null,
              volume: null,
              is_asset: null,
              version: null,
              created_at: null,
              created_by: null,
              updated_at: null,
              file_catalogues: [],
              checked: undefined
            },
            location_id: value.location_id,
            is_traceable: value.is_traceable,
            unit_id: value.unit_id,
            location: value.location,
            unit: value.unit,
            version: value.version,
            name: value.catalogue?.name ?? '',
            
          }))
          
        }
      } catch (error: any) {
        ElMessage.error(`${error.response?.data?.message ?? 'Gagal Mengambil Data!'}`);
        return [];
      } finally {
        loading.value = false;
      }
      
    }
  
  
    const {data} = await useFetchApi<ResponsePagination<Inventory[]>>(`/search`, 'search_inventory', 'post', search_default.value);
  
  
  
    const querySearchLocation = async (queryString: string, cb: (arg: any) => void) => {
      requestSearchLocation.value.keyword = queryString;
      requestSearchLocation.value.table = "catalogues";
      requestSearchLocation.value.column = [
        {
          type: ["place"],
        },
      ];
  
      try {
        const response = await useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'warehouse', 'post', requestSearchLocation.value);
  
        if(response.status.value == 'success'){
          
          const resultApi: Catalogue[] = response.data.value?.data ?? [];
  
          if (resultApi.length > 0) {
            cb(resultApi.map((value) => ({ ...value, value: value.name })));
          }
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message ?? error);
      }
  
      
    };
    const querySearchContact = async (queryString: string, cb: (arg: any) => void) => {
      requestSearchLocation.value.keyword = queryString;
      requestSearchLocation.value.table = "contacts";
      requestSearchLocation.value.column = [];
  
      try {
        const response = await useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'contact', 'post', requestSearchLocation.value);
  
        if(response.status.value == 'success'){
          
          const resultApi: Catalogue[] = response.data.value?.data ?? [];
  
          if (resultApi.length > 0) {
            cb(resultApi.map((value) => ({ ...value, value: value.name })));
          }
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message ?? error);
      }
  
      
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
  
      ruleForm.location_name = catalogue.name!;
      ruleForm.location_id = catalogue.unique_id!;
      ruleForm.location_version = catalogue.version!;
      const data:RequestSearch = {...requestSearchInventory.value};
      data.column = [
        {
          location_id: [catalogue.unique_id!],
        }
      ]
      search_default.value.column[0].location_id = [catalogue.unique_id];
      requestSearchInventory.value = data;
      fetchDataDefault();
    };
  
    const handleSelectContact = (item: Record<string, any>) => {
      const contact: Contact = item as Contact;
      ruleForm.contact_name = contact.name!;
      ruleForm.contact_id = contact.unique_id!;
      ruleForm.contact_version = contact.version!;
      search_default.value.column[0].contact_id = [contact.unique_id];
      fetchDataDefault();
    };
  
    const addNewLine = () => {
        const newItem: Inventory[] = [...tableItem.value, {
          id: tableItem.value.length + 1,
          unique_id: '',
          quantity: 1,
          unit_name: '',
          cost: 0,
          selling_price: 0,
          sn: '',
          contact_id: '',
          contact_name: '',
          contact_version: 0,
          unique_code: '',
          catalogue_id: '',
          catalogue: {
            id: null,
            unique_id: null,
            unique_code: null,
            name: null,
            brand_id: null,
            year: null,
            sn: null,
            description: null,
            berat: null,
            volume: null,
            is_asset: null,
            version: null,
            created_at: null,
            created_by: null,
            updated_at: null,
            file_catalogues: [],
            checked: undefined
          },
          location_id: '',
          is_traceable: false,
          unit_id: '',
          location: null,
          unit: null,
          version: 0,
        }];
  
        tableItem.value = newItem;
  
    }
  
    watch(search_default, fetchDataDefault, {immediate: true});
    
  
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
          table: 'inventories',
          column: [
              {
                  location_id: [ruleForm.location_id],
              },
          ],
          keyword: queryString,
          limit: "20",
          offset: "1",
          sort: null,
      }
      useFetchApi<ResponsePagination<Inventory[]>>('/search', 'inventories', 'post', data).then((response) => {
          if(response.status.value == 'success'){
              const inventories: Inventory[] = response.data?.value?.data ?? [];
  
              const results = inventories.map((data: Inventory) => {
                  return {value: `${data.catalogue.name}-${data.location?.name}`, unique_id: data.unique_id, object: data};
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
            const inventory: Inventory = record.object as Inventory;
            tableItem.value[scope.$index].unique_id = inventory.unique_id!;
            tableItem.value[scope.$index].quantity = inventory.quantity ?? 1;
            tableItem.value[scope.$index].unit_name = inventory.unit?.name ?? '';
            tableItem.value[scope.$index].unit_id = inventory.unit?.unique_id ?? '';
            tableItem.value[scope.$index].cost = inventory.cost ?? 0;
            tableItem.value[scope.$index].version = inventory.version ?? 0;
            tableItem.value[scope.$index].sn = inventory.sn ?? 0;
        }
  
    }
  
    const onChangeQuantity = (e: string, scope: any) => {
      tableItem.value[scope.$index].quantity = parseInt(e);
    }
    const onChangeSerialNumber = (e: string, scope: any) => {
        tableItem.value[scope.$index].sn = e;
    }
    const onChangeSellingPrice = (e: string, scope: any) => {
        tableItem.value[scope.$index].selling_price = parseInt(e ?? '0');
    }
    const onChangeCost = (e: string, scope: any) => {
        tableItem.value[scope.$index].cost = parseInt(e ?? '0');
    }
  
    const onDeleteList = () => {
      // const checkeds = data.value?.data.filter((value) => value.checked);
      // console.log(checkeds)
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
  
    const submitPricelist = async (formEl: FormInstance) => {
      
      loading.value = true;
      try {
        const dateObject = new Date(ruleForm.starting_date);
        
  
        const pricelistObj = {
          starting_date: dateObject.getTime() / 1000,
          location_id: ruleForm.location_id,
          location_version: ruleForm.location_version,
          contact_id: ruleForm.contact_id,
          contact_name: ruleForm.contact_name,
          contact_version: ruleForm.contact_version,
          pricelist_item: tableItem.value.map((value) => ({
            inventory_id: value.unique_id,
            inventory_version: value.version,
            selling_price: parseInt(`${value.selling_price ?? '0'}`),
            stok: value.quantity,
          })),
        }
  
        const response = await useFetchApi<BaseResponse<Pricelist>>('/pricelist-create', 'pricelist-create', 'post', pricelistObj);
  
        if(response.status.value == 'success'){
          ElMessage.success("Berhasil");
          return props.onSubmitPricelist(response.data.value?.data ?? null);
        }
      } catch (error: any) {
        ElMessage.error(`${error.response?.data?.message}`);
      } finally {
        loading.value = false;
      }
    }

    const fetchPricelistDetail = async () => {
      loading.value = true;
      try {
        const request_search: RequestSearch = {
          keyword: '',
          column: [
            {
              unique_id: [props.pricelist.unique_id],
            }
          ],
          limit: "10",
          offset: "1",
          table: 'pricelist',
          sort: {
            column: 'created_at',
            order: OrderColumn.ASC,
          }
        };
        const response = await useFetchApi<ResponsePagination<Pricelist[]>>('/search', 'search-pricelist', 'post', request_search)
        if(response.status.value == 'success'){
          pricelistData.value = response.data.value!.data[0];
        }
      } catch (error: any) {
        ElMessage.error(error?.response?.message ?? error);
      } finally {
        loading.value = false;
      }
    }
  
    const submitForm = async (formEl: FormInstance | undefined) => {
      
      if (!formEl) return
      await formEl.validate((valid, fields) => {
        if (valid) {
            submitPricelist(formEl);
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
  
    onMounted(() => {
      // fetchPricelistDetail();
      fetchUnits();
    })
</script>