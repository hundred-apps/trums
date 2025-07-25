<script lang="tsx" setup>
import { Delete, Edit } from '@element-plus/icons-vue';
import type { ComponentSize, DrawerProps, FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus';
import CatalogueAdd from '~/components/trums/CatalogueAdd.vue';
import type { Catalogue } from '~/types/catalogue';
import type { Contact } from '~/types/contact';
import type { Quotation, Quotation_item } from '~/types/quotation';
import type { RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';

    definePageMeta({
      middleware: ["auth", "app"],
  });

  const goBack = () => router.back();
  const router = useRouter();
  const loading = ref<boolean>(false);

  const dialog_detail_form_catalogue = ref<boolean>(false);
  const form_catalogue_direction = ref<DrawerProps['direction']>('rtl')
  const catalogueCreate = ref<Catalogue>();

  const requestSearch = ref<RequestSearch>({
    keyword: "",
    table: "",
    column: null,
    sort: null,
    limit: "50",
    offset: "1",
  });




  const fileList = ref<UploadUserFile[]>([])
  
  const formSize = ref<ComponentSize>("default");
  const formQuotationInstance = ref<FormInstance>();
  const formQuotation = reactive<Quotation>({
      unique_id: '',
      contact_id: '',
      contact_name: '',
      contact_version: 0,
      type: 'in',
      sourcing_number: '',
      warranty: 0,
      warranty_unit: 'day',
      discount: 0,
      discount_unit: 'percent',
      created_at: 0,
      created_by: 0,
      updated_at: 0,
      version: 0,
      date_string: '',
      location_id: '',
      location_name: '',
      note: '',
      items: [
        {
            unique_id: '',
            catalogue_id: '',
            catalogue_name: '',
            offer_id: '',
            quantity: 0,
            price: 0,
            version: 0,
            created_at: 0,
            created_by: 0,
            updated_at: 0,
        }
      ]
  });

  const formQuotationRules = reactive<FormRules<Quotation>>({
    date_string: [
      {
        type: 'date',
        required: true,
        message: 'Tanggal Berlaku Penawaran Tidak Boleh Kosong!',
        trigger: 'change',
      }
    ],
    location_id: [
      { required: true, message: "Lokasi Tidak Boleh Kosong!", trigger: "blur" },
    ],
    location_name: [
      { required: true, message: "Lokasi Tidak Boleh Kosong!", trigger: "blur" },
    ],
    contact_id: [
      { required: true, message: "Contact Tidak Boleh Kosong!", trigger: "blur" },
    ],
    contact_name: [
      { required: true, message: "Contact Tidak Boleh Kosong!", trigger: "blur" },
    ],
    sourcing_number: [
      { required: true, message: "Nomor Referensi Tidak Boleh Kosong!", trigger: "blur" },
    ],
    items: {
        type: 'array',
        required: true,
        min: 1,
        message: 'Item Penawaran Tidak Boleh Kosong!',
        trigger: 'change'
    },
  });


  const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
    const request_search = {...requestSearch.value};
    request_search.keyword = queryString;
    request_search.table = "contacts";
    request_search.column = [];

    useFetchApi<ResponsePagination<Contact[]>>('/search', 'contact', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: Contact[] = response.data.value?.data ?? [];

            if (resultApi.length > 0) {
                cb(resultApi.map((value) => ({ ...value, value: value.name })));
            }
        }
    }).catch((error: any) => {
        ElMessage.error(error.response?.data?.message ?? error);
    })

    
  };

  const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
    const request_search = {...requestSearch.value};
    request_search.keyword = queryString;
    request_search.table = "catalogues";
    request_search.column = [{
        type: ['place']
    }];

    useFetchApi<ResponsePagination<Contact[]>>('/search', 'catalogue', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: Contact[] = response.data.value?.data ?? [];

            if (resultApi.length > 0) {
                cb(resultApi.map((value) => ({ ...value, value: value.name })));
            }
        }
    }).catch((error: any) => {
        ElMessage.error(error.response?.data?.message ?? error);
    })

    
  };

  const handleSearchLocation = (item: Record<string, any>) => {
    const location: Catalogue = item as Catalogue;
    formQuotation.location_id = location.unique_id!;
    formQuotation.location_name = location.name!;
  }

  const handleSearchContact = (item: Record<string, any>) => {
    const contact: Contact = item as Contact;
    formQuotation.contact_name = contact.name!;
    formQuotation.contact_id = contact.unique_id!;
    formQuotation.contact_version = contact.version!;
  }


  const onSubmitQuotation = async (formEl: FormInstance) => {
    const date = new Date(formQuotation.date_string);
    const data = {
        contact_id: formQuotation.contact_id,
        contact_version: formQuotation.contact_version,
        type: 'out',
        sourcing_number: formQuotation.sourcing_number,
        warranty: 0,
        warranty_unit: 'hari',
        discount: 0,
        discount_unit: 'percent',
        version: 0,
        notes: formQuotation.note,
        date: date.getTime() / 1000,
    }

    const items = formQuotation.items.map((item: Quotation_item) => ({
            catalogue_id: item.catalogue_id,
            quantity: item.quantity,
            price: item.price,
    }));

    console.log(data);
    console.log(items);

    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key as keyof Object].toString());
    }

   items.forEach((value, index) => {
        formData.append(`offer_item_vendor[${index}][catalogue_id]`, value.catalogue_id);
        formData.append(`offer_item_vendor[${index}][quantity]`, (value.quantity ?? 0).toString());
        formData.append(`offer_item_vendor[${index}][price]`, (value.price ?? 0).toString());
   })

   fileList.value.forEach((value, index) => {
        formData.append(`files[${index}]`, value.raw as Blob);
   })

    loading.value = true;    
    try {

        const response = await useFetchApi<BaseResponse<Quotation>>('/offers-create', 'offers-create', 'post', formData);

        if(response.status.value == 'success'){
            ElMessage.success(`Berhasil!`);
            formEl.resetFields();
            formQuotation.items = [
                {
                    unique_id: '',
                    catalogue_id: '',
                    catalogue_name: '',
                    offer_id: '',
                    quantity: 0,
                    price: 0,
                    version: 0,
                    created_at: 0,
                    created_by: 0,
                    updated_at: 0,
                }
            ]
        }

    }catch(error: any){
        ElMessage.error(error?.response?.message ?? error);
    }finally {
        loading.value = false;
    }
  }


  const submitForm = async (formEl: FormInstance | undefined) => {
    
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        onSubmitQuotation(formEl);
      } else {
        console.log('error submit!', fields)
      }
    })
  }

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
  }

    const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
        console.log(file, uploadFiles)
    }

    const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
        console.log(uploadFile)
    }

    const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
        ElMessage.warning(
            `The limit is 3, you selected ${files.length} files this time, add up to ${
                files.length + uploadFiles.length
            } totally`
        )
    }

    const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
        return ElMessageBox.confirm(
            `Cancel the transfer of ${uploadFile.name} ?`
        ).then(
            () => true,
            () => false
        )
    }

    const querySearchAsyncCatalogue = (queryString: string, cb: (arg: any) => void) => {
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
                const catalogues: Catalogue[] = response.data?.value?.data ?? [];
                if(catalogues.length > 0){
                    cb(catalogues.map((value) => ({ ...value, value: value.name, is_new: false })));
                }else{
                    cb([{value: `Tambahkan ${queryString}`, is_new: true, label: queryString}]);
                }
            }
        }).catch((error: any) => {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        })
    }

    const handleSelectSearchCatalogue = (item: Record<string, any>, scope: any) => {
        
        console.log(item)
        if(item.is_new){
            formQuotation.items[scope.$index].catalogue_name = item.label ?? '';
            useFetchApi<BaseResponse<Catalogue>>('/catalogues-create', 'create-catalogue', 'post', {name: item.label ?? ''}).then((response) => {
                if(response.status.value == 'success'){
                    const new_catalogue = response.data.value?.data as Catalogue;
                    formQuotation.items[scope.$index].catalogue_id = new_catalogue.unique_id!;
                    catalogueCreate.value = new_catalogue;
                    dialog_detail_form_catalogue.value = true;
                }
            });
        }else{
            const catalogue: Catalogue = item as Catalogue;
            formQuotation.items[scope.$index].catalogue_name = catalogue.name ?? '';
            formQuotation.items[scope.$index].catalogue_id = catalogue.unique_id ?? '';
        }
    }

    const delete_item_list = (scope: any) => {
        formQuotation.items.splice(scope.$index, 1);
    }

    const onEditCatalogue = (item: Catalogue) => {
        
        const catalogue_edit = {
            unique_id: item.unique_id,
            name: item.name,
            description: item.description,
            brand_id: item.brand_id,
            year: item.year,
            sn: item.sn,
            berat: item.berat,
            volume: `${item.panjang}x${item.lebar}x${item.tinggi}`,
            is_asset: item.tmp_asset == "1" ? true : false,
        }
        useFetchApi<BaseResponse<Catalogue>>('/catalogues-create', 'create-catalogue', 'post', catalogue_edit).then((response) => {
            if(response.status.value == 'success'){
                const new_catalogue = response.data.value?.data as Catalogue;
                catalogueCreate.value = new_catalogue;
                dialog_detail_form_catalogue.value = false;
            }
        }).catch((error: any) => {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        })
    }

    const addNewLine = () => {
        const add = [...formQuotation.items, {
            unique_id: '',
            catalogue_id: '',
            catalogue_name: '',
            offer_id: '',
            quantity: 0,
            price: 0,
            version: 0,
            created_at: 0,
            created_by: 0,
            updated_at: 0,
        }];

        formQuotation.items = add;

    }

</script>
<template>
    <TrumsWrapper>
        <el-page-header @back="goBack">
              <template #content>
                  <span class="text-large font-600 mr-3"> Buat Penawaran </span>
              </template>
        </el-page-header>
        <el-card class="my-3">
            <template #header>
                <div class="card-header">
                <el-form-item>
                    <el-button type="primary" @click="submitForm(formQuotationInstance)">Simpan</el-button>
                    <el-button @click="resetForm(formQuotationInstance)">Batal</el-button>
                </el-form-item>
                </div>
            </template>
            <el-form
                ref="formQuotationInstance"
                style="max-width: 600px"
                :model="formQuotation"
                :rules="formQuotationRules"
                label-width="auto"
                class="demo-ruleForm"
                :size="formSize"
                status-icon
                :disabled="loading"
            >

                <el-form-item label="Contact" prop="contact_name">
                    <el-autocomplete
                        v-model="formQuotation.contact_name"
                        :fetch-suggestions="querySearchContact"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Contact"
                        @select="handleSearchContact"
                    />
                </el-form-item>
                <el-form-item label="Lokasi Pengiriman/Pengambilan" prop="location_id">
                    <el-autocomplete
                        v-model="formQuotation.location_name"
                        :fetch-suggestions="querySearchLocation"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Gudang"
                        @select="handleSearchLocation"
                    />
                </el-form-item>
                <el-form-item label="Tanggal" prop="date_string">
                    <el-date-picker
                        v-model="formQuotation.date_string"
                        type="date"
                        aria-label="Pilih Tanggal"
                        placeholder="Pilih Tanggal"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="Nomor Referensi" prop="sourcing_number">
                    <el-input v-model="formQuotation.sourcing_number" placeholder="Nomor Referensi" />
                </el-form-item>
                <el-form-item label="Upload Dokumen Referensi">
                    <el-upload
                        v-model:file-list="fileList"
                        class="upload-demo"
                        action=""
                        multiple
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :before-remove="beforeRemove"
                        :on-exceed="handleExceed"
                    >
                        <el-button type="primary">Click to upload</el-button>
                        <template #tip>
                            <div class="el-upload__tip">
                                jpg/png files with a size less than 500KB.
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="Catatan">
                    <el-input v-model="formQuotation.note" type="textarea" />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="mb-3">
            <el-table :data="formQuotation.items">
                <el-table-column prop="catalogue_name" label="item" >
                    <template #default="scope">
                        <el-form-item label="" :prop="`items.${scope.index}.catalogue_name`">
                            <el-autocomplete
                                :disabled="loading"
                                :fetch-suggestions="querySearchAsyncCatalogue"
                                v-model="scope.row.catalogue_name"
                                
                                placeholder="Cari item"
                                @select="(item: Record<string, any>) => handleSelectSearchCatalogue(item, scope)"
                            />
                        </el-form-item>
                        
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="Harga Jual" >
                    <template #default="scope">
                        <el-form-item label="" :prop="`items.${scope.index}.price`">
                            <el-input v-model="scope.row.price" />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" label="Stok" >
                    <template #default="scope">
                        <el-form-item label="" :prop="`items.${scope.index}.quantity`" class="mb-0">
                            <el-input v-model="scope.row.quantity" class="mb-0" />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column label="Operations">
                    <template #default="scope">
                        <el-button
                            size="default"
                            class="mb-4"
                            type="danger"
                            text
                            @click="() => delete_item_list(scope)"
                            >
                            <el-icon><Delete /></el-icon>
                        </el-button>
                        <el-button
                            size="default"
                            class="mb-4"
                            type="primary"
                            text
                            @click="() => delete_item_list(scope)"
                            >
                            <el-icon><Edit /></el-icon>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-button class="mt-4" style="width: 100%" @click="addNewLine">
                Tambahkan Baris Baru
            </el-button>
        </el-card>
        <el-drawer v-model="dialog_detail_form_catalogue" :direction="form_catalogue_direction" size="40%">
            
            <template #default>
                <CatalogueAdd :catalogue_form="catalogueCreate!" />
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="() => dialog_detail_form_catalogue = false">cancel</el-button>
                    <el-button type="primary" @click="() => onEditCatalogue(catalogueCreate!)">confirm</el-button>
                </div>
            </template>
        </el-drawer>
    </TrumsWrapper>
</template>