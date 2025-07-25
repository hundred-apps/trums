<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { Brands } from '~/types/brand';
import type { Catalogue } from '~/types/catalogue';
import type { RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';

const props = defineProps<{
    // onSubmit: (catalogue: Catalogue) => void,
    // onCancel: () => void,
    catalogue_form: Catalogue,
}>();


const catalogue_form_ref = ref<FormInstance>();

const rule_form_catalogue = reactive<FormRules<Catalogue>>({
    name: [{ required: true, message: "Masukan Nama", trigger: "blur" }],
});


const querySearchBrand = (queryString: string, cb: (arg: any) => void) => {
    const request_search: RequestSearch = {
        keyword: queryString,
        limit: "10",
        offset: "1",
        column: [],
        sort: null,
        table: 'brands',

    }
    useFetchApi<ResponsePagination<Brands[]>>('/search', 'brand', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: Brands[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){
                cb(resultApi.map((value) => ({ ...value, value: value.name })));
            }else{
                cb([{value: `Tambahkan ${queryString}`, is_new: true, label: `${queryString}` }]);
            }
        }
    })
}

const handleSelectBrand = async (item: Record<string, any>) => {
    
    if(item.is_new){
        useFetchApi<BaseResponse<Brands>>('/brands-create', 'upsert-brand', 'post', {name: item.label}).then((response) => {
            if(response.status.value == 'success'){
                const brand = response.data.value?.data as Brands;
                props.catalogue_form.brand_id = brand.unique_id;
                props.catalogue_form.brand_name = brand.name;
            }
        });
    }else{
        const brand = item as Brands;
        props.catalogue_form.brand_id = brand.unique_id;
    }
}
</script>

<template>
    <el-form :model="catalogue_form" ref="catalogue_form_ref" label-width="auto" :rules="rule_form_catalogue">
        <el-form-item label="Nama Item" prop="name">
            <el-input v-model="catalogue_form.name" />
        </el-form-item>
        <el-form-item label="Serial Number" prop="sn">
            <el-input v-model="catalogue_form.sn" />
        </el-form-item>
        <el-form-item label="Deskripsi">
            <el-input v-model="catalogue_form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="Brand" prop="brand_name">
            <el-autocomplete
                v-model="catalogue_form.brand_name!"
                :fetch-suggestions="querySearchBrand"
                :trigger-on-focus="false"
                clearable
                class="inline-input w-50"
                placeholder="Cari brand"
                @select="handleSelectBrand"
            />
        </el-form-item>
        <el-form-item label="Tahun" prop="year">
            <el-input v-model="catalogue_form.year" />
        </el-form-item>
        <el-form-item label="Tandai Sebagai Asset" prop="tmp_asset">
            <el-radio-group v-model="catalogue_form.tmp_asset!">
                <el-radio value="1">Ya</el-radio>
                <el-radio value="0">Bukan</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="Berat" prop="berat">
            <el-input v-model="catalogue_form.berat" >
                <template #append>gram</template>
            </el-input>
        </el-form-item>
        <el-form-item label="Volume" prop="volume">
            <el-col :span="4">
                <el-input v-model="catalogue_form.panjang" placeholder="Panjang" />
            </el-col>
            <el-col class="text-center" :span="1" style="margin: 0 0.5rem">x</el-col>
            <el-col :span="4">
                <el-input v-model="catalogue_form.lebar" placeholder="Lebar" />
            </el-col>
            <el-col class="text-center" :span="1" style="margin: 0 0.5rem" >x</el-col>
            <el-col :span="4">
                <el-input v-model="catalogue_form.tinggi"placeholder="Tinggi" />
            </el-col>
        </el-form-item>
        
    </el-form>
</template>
