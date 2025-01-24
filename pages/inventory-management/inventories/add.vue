<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> New Inventory </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <el-form
            ref="ruleFormRef"
            style="max-width: 600px"
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            :size="formSize"
            status-icon
        >
            <el-form-item label="Nama Item" prop="catalogue">
                <el-autocomplete
                    v-model="ruleForm.catalogue"
                    :fetch-suggestions="querySearch"
                    :trigger-on-focus="false"
                    clearable
                    class="inline-input w-50"
                    placeholder="Masukan Nama Item"
                    @select="handleSelect"
                />
            </el-form-item>
            <el-form-item label="Lokasi Inventory" prop="location_name">
                <el-autocomplete
                    v-model="ruleForm.location_name"
                    :fetch-suggestions="querySearch"
                    :trigger-on-focus="false"
                    clearable
                    class="inline-input w-50"
                    placeholder="Pilih Lokasi"
                    @select="handleSelect"
                />
            </el-form-item>
            
            <el-form-item label="Cost" prop="cost">
                <el-input 
                v-model="ruleForm.cost" 
                placeholder="Harga" 
                :formatter="(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value: any) => value.replace(/[^0-9]/g, '')" />
            </el-form-item>

            <el-form-item v-if="ruleForm.is_traceable == '0'" label="Quantity" prop="quantity">
                <el-input v-model="ruleForm.quantity":parser="(value: any) => value.replace(/[^0-9]/g, '')" placeholder="Quantity" />
            </el-form-item>

            <el-form-item label="Unit" prop="unit_name">
                <el-autocomplete
                    v-model="ruleForm.unit_name"
                    :fetch-suggestions="querySearch"
                    :trigger-on-focus="false"
                    clearable
                    class="inline-input w-50"
                    placeholder="Pilih Unit"
                    @select="handleSelect"
                />
            </el-form-item>

            <el-form-item label="Track Inventory" prop="is_traceable">
                <el-radio-group v-model="ruleForm.is_traceable">
                    <el-radio value="1">Ya</el-radio>
                    <el-radio value="0">Tidak</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item v-if="ruleForm.is_traceable == '1'" label="Serial Number" prop="sn">
                <el-input v-model="ruleForm.sn" placeholder="Masukan Serial Number" />
            </el-form-item>
            
        </el-form>
    </el-card>
</template>

<script lang="ts" setup>
    definePageMeta({
        middleware: ["auth", "app"],
    });
    interface RuleForm {
        catalogue: string
        catalogue_id: number,
        location_id: string,
        location_name: string,
        is_traceable: string,
        sn: string
        unit_id: number,
        unit_name: string
        quantity: string,
        cost: string,
    }

    import { reactive, ref, onMounted } from 'vue'
    import { type ComponentSize, type FormInstance, type FormRules, ElMessage } from 'element-plus'
    import { useApi } from '#imports'
    import { type Catalogue } from '~/types/catalogue'

    const router = useRouter();

    const goBack = () => router.back();

    const catalogues = ref<Catalogue[]>([])

    const formSize = ref<ComponentSize>('default')
    const ruleFormRef = ref<FormInstance>()
    const ruleForm = reactive<RuleForm>({
        catalogue: '',
        location_name: '',
        catalogue_id: 1,
        location_id: '',
        is_traceable: '0',
        sn: '',
        unit_id: 0,
        unit_name: '',
        quantity: "1",
        cost: '0',
    })

    const api = useApi();

    const querySearch = (queryString: string, cb: any) => {
        const results = queryString
            ? catalogues.value.filter(createFilter(queryString))
            : catalogues.value

        const returnName = results.map((data: Catalogue) => {
            return {value: data.name};
        });    
        cb(returnName)
    }

    const createFilter = (queryString: string) => {
        return (catalogue: Catalogue) => {
            return (
                catalogue.name?.toLowerCase().indexOf(queryString.toLowerCase()) === 0
            )
        }
    }

    const rules = reactive<FormRules<RuleForm>>({
        catalogue: [
            { required: true, message: 'Masukan Item', trigger: 'blur' },
        ],
        location_name: [
            { required: true, message: 'Masukan Lokasi Item', trigger: 'blur' },
        ],
        quantity: [
            { required: true, message: 'Masukan Quantity', trigger: 'blur' },
        ],
        cost: [
            { required: true, message: 'Masukan Lokasi Item', trigger: 'blur' },
        ],
        unit_name: [
            { required: true, message: 'Masukan Jenis Unit', trigger: 'blur' },
        ],
        sn: [
            { required: true, message: 'Masukan Serial Number', trigger: 'blur' },
        ],
        
    })
    

    const fetchCatalogues = async () => {
        try {
            const response = await api.get('/catalogues-read');

            if(response.status == 200){
                catalogues.value = response.data.data;
            }

        } catch (error: any) {
            ElMessage.error(error.response?.data?.message);
        }
    }

    const handleSelect = (item: Record<string, any>) => {
        console.log(item)
    }

    onMounted(() => {
        fetchCatalogues();
    })

</script>