<template>
    <TrumsWrapper>
        <el-page-header @back="goBack">
            <template #content>
                <span class="text-large font-600 mr-3">Buat Alamat baru</span>
            </template>
        </el-page-header>
        <el-card shadow="never" class="mt-6">
        
            <el-form 
                :disabled="loading"
                :model="ruleFormAddress" 
                ref="ruleFormRefAddress"
                :rules="rulesAddress"
                label-width="auto">
                <el-form-item label="Kontak" prop="contact_name">
                    <el-autocomplete
                        v-model="ruleFormAddress.contact_name"
                        :fetch-suggestions="querySearchContact"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Nama Kontak"
                        @select="handleSelectContact"
                    />
                </el-form-item>
                <el-form-item label="Nama/Label Alamat" prop="address_name">
                    <el-input v-model="ruleFormAddress.address_name" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="Alamat" prop="village">
                    <el-autocomplete
                        v-model="ruleFormAddress.address_view"
                        :fetch-suggestions="querySearchGeolocation"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Kelurahan/Desa, Kecamatan, Kabupaten/Kota atau provinsi"
                        @select="handleSelectGeoLocation"
                    />
                </el-form-item>
                <el-form-item label="Detail Alamat" prop="street">
                    <el-input v-model="ruleFormAddress.street" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="Kode Pos" prop="codepos">
                    <el-input v-model="ruleFormAddress.codepos" autocomplete="off"/>
                </el-form-item>
                
            </el-form>
            <template #footer>
                <div class="flex">
                    <el-button :disabled="loading" @click="() => {}">Batal</el-button>
                    <el-button :disabled="loading" type="primary" @click="() => submitFormAddress(ruleFormRefAddress)">
                    Simpan
                    </el-button>
                </div>
            </template>
        </el-card>
    </TrumsWrapper>
</template>
 
<script lang="tsx" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { AddressSearch, AddressType } from '~/types/address';
import type { Contact } from '~/types/contact';
import type { RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "address-read",
  name: "Add New Address"
})


const router = useRouter();
const route = useRoute()
const id = computed(() => route.query.id as string);

const goBack = () => router.back();

const loading = ref<boolean>(false);

interface formAddress {
    unique_id: string|null,
    contact_id?: string,
    contact_name?: string,
    contact_version?: number,
    address_id?: string,
    address_name?: string,
    street?: string,
    village_id?: string,
    village?: string,
    city?: string,
    regency?: string,
    province?: string,
    country?: string,
    codepos: string,
    lat?: string,
    lng?: string,
    address_view: string,
}

const ruleFormAddress = reactive<formAddress>({
    unique_id: null,
    contact_id: '',
    contact_name: '',
    address_name: '',
    street: '',
    village_id: '',
    codepos: '',
    address_view: '',

});
const ruleFormRefAddress = ref<FormInstance>();

const rulesAddress = reactive<FormRules<formAddress>>({
    address_name: [{ required: true, message: "Masukan Nama/Label Alamat", trigger: "blur" }],
    street: [{ required: true, message: "Masukan Detail", trigger: "blur" }],
    village_id: [
        { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
    ],
    village: [{ required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" }],
    city: [{ required: true, message: "Masukan Kecamatan", trigger: "blur" }],
    regency: [{ required: true, message: "Masukan Kota/Kabupaten", trigger: "blur" }],
    province: [{ required: true, message: "Masukan Provinsi", trigger: "blur" }],
    codepos: [{ required: true, message: "Masukan Kode Pos", trigger: "blur" }],
    
});

const querySearchGeolocation = (queryString: string, cb: (arg: any) => void) => {
        
    useFetchApi<ResponsePagination<AddressSearch[]>>('/search-indonesia', 'address', 'post', {keyword: queryString, limit: 500, offset: 1}).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: AddressSearch[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){

                cb(resultApi.map((value) => ({ ...value, value: value.name })));
            }
        }
    })

}

const handleSelectGeoLocation = (record: Record<string, any>) => {
    const address: AddressSearch = record as AddressSearch;
    const names = address.name.split(', ');

    ruleFormAddress.village_id = address.id;
    ruleFormAddress.village = names[1];
    ruleFormAddress.city = names[2];
    ruleFormAddress.regency = names[3];
    ruleFormAddress.province = names[4];

    ruleFormAddress.address_view = address.name;
}

const submitFormAddress = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            onSubmitAddress();
        } else {
            console.log('error submit!', fields)
        }
    })
}

const setInitital = (item: Record<string, any>) => {
    const allowedKeys: (keyof formAddress)[] = [
    'contact_id', 'contact_name', 'contact_version',
    'address_id', 'address_name', 'street',
    'village_id', 'village', 'city',
    'regency', 'province', 'country',
    'lat', 'lng',
  ];

  for (const key of allowedKeys) {
    if (key in item) {
      ruleFormAddress[key] = item[key];
    }
  }
    
}

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
    const data: RequestSearch = {
        table: 'contacts',
        column: [],
        keyword: queryString,
        limit: "20",
        offset: "1",
        sort: null,
    }
    useFetchApi<ResponsePagination<Contact[]>>('/search', 'contacts', 'post', data).then((response) => {
        if(response.status.value == 'success'){
            const inventories: Contact[] = response.data?.value?.data ?? [];

            const results = inventories.map((data: Contact) => {
                return {...data, value: data.name};
            });    
            cb(results)
        }
    }).catch((error: any) => {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
    })
}

const handleSelectContact = (record: Record<string, any>) => {
    console.log(record);
    const contact: Contact = record as Contact;
    
    ruleFormAddress.contact_id = contact.unique_id;
    ruleFormAddress.contact_name = contact.name;
    ruleFormAddress.contact_version = contact.version;
    ruleFormAddress.address_name = contact.name;
    
}

const onSubmitAddress = async () => {
    console.log(ruleFormAddress)
    const data = {
        "unique_id": ruleFormAddress.unique_id,
        "contact_id": ruleFormAddress.contact_id,
        "contact_name": ruleFormAddress.contact_name,
        "contact_version": ruleFormAddress.contact_version,
        "address_name": ruleFormAddress.address_name,
        "street": ruleFormAddress.street,
        "village_id": ruleFormAddress.village_id,
        "village": ruleFormAddress.village,
        "city": ruleFormAddress.city,
        "regency": ruleFormAddress.regency,
        "province": ruleFormAddress.province,
        "country": "indonesia",
        "lat": ruleFormAddress.lat,
        "lng": ruleFormAddress.lng,
        "codepos": parseInt(ruleFormAddress.codepos),
    }

    try {
        const response = await useFetchApi<ResponsePagination<BaseResponse<AddressType>>>('/address-create', 'address-create', 'post', data);
        if(response.status.value == 'success'){
            ElMessage.success('Berhasil!');
            const address:AddressType|undefined = (response.data.value?.data as unknown as BaseResponse<AddressType>).data;
            // ruleFormRefAddress.value?.resetFields();
            // ruleFormAddress.address_view = '';
        }
    } catch (error: any) {
        ElMessage.success(error?.response?.messaage ?? error);
    }
}

const getDetail = async () => {
    loading.value = true;
    try {
        const response = await useApiFetch<BaseResponse<AddressType>>(`/address-read/${id.value}`, {
            method: 'GET'
        });

        if(response.success && response.data){
            const addressType: AddressType = response.data;
            Object.assign(ruleFormAddress, response.data);
            ruleFormAddress.address_view = `${addressType.village}, ${addressType.city}, ${addressType.regency}, ${addressType.province}`;
        }
    } catch (error: any) {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    if(id.value){
        getDetail();
    }
});
</script>