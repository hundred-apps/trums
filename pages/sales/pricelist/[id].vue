<template>
    <TrumsWrapper>

        <el-page-header @back="goBack">
    <template #content>
        <span class="text-large font-600 mr-3"> Detail - {{ data?.data.name }} </span>
    </template>
    </el-page-header>
    <el-card class="my-3">
        <!-- <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button> -->
        <div class="flex gap-3 my-3">
            <div class="flex-1">
                <el-descriptions
                    title=""
                    :column="1"
                    size="large"
                    border
                >
                <el-descriptions-item label="Nama">{{data?.data.name}}</el-descriptions-item>
                <el-descriptions-item label="Gudang">{{ data?.data.location?.name }}</el-descriptions-item>
                <el-descriptions-item label="Berlaku Mulai Tanggal">{{formatLocalDate(data?.data.start_date ?? 0)}}</el-descriptions-item>
                <el-descriptions-item label="Berakhir Tanggal">{{formatLocalDate(data?.data.end_date ?? 0)}}</el-descriptions-item>
                </el-descriptions>
            </div>
        </div>
        <el-descriptions title="Note">
            <el-descriptions-item label=""></el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card class="mb-3">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"><el-input v-model="request_search_pricelist_item.keyword" size="large" placeholder="Type to search" /></el-col>
        
      </el-row>
      
      <el-table :data="data?.data.pricetag_item">
          <el-table-column prop="name" label="item" >
              <template #default="scope">
                  <el-autocomplete
                      :disabled="scope.row.readonly != false"
                      :fetch-suggestions="querySearchAsyncInventories"
                      v-model="scope.row.catalogue.name"
                      
                      placeholder="Cari item"
                      @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
                  />
              </template>
          </el-table-column>
          <el-table-column prop="sn" label="Serial Number"/>
          <el-table-column prop="price" label="Harga Jual">
              <template #default="scope">
                  <el-input v-model="scope.row.price" @change="(e) => onChangeSellingPrice(e, scope)" :disabled="scope.row.readonly != false" placeholder="Masukan Harga Jual" />
              </template>
          </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewLine">
          Tambahkan Item
      </el-button>
        
    </el-card>
   
    <el-card class="mb-3">
        <template #header>
            <div class="card-header">
                <p>Terms & Condition</p>
            </div>
        </template>
        <span class="font-bold">Location</span>
        <div class="flex gap-2 my-3" v-if="data != null">
            <el-tag v-for="item in data.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.LOCATION)" v-bind:key="item.unique_id!" type="primary">{{item.data?.name}}</el-tag>
        </div>
        <span class="font-bold">Contact</span>
        <div class="flex gap-2 my-3" v-if="data != null">
            <el-tag v-for="item in data.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.KONTAK)" v-bind:key="item.unique_id!" type="primary">{{item.data?.name}}</el-tag>
        </div>
        <span class="font-bold">Item Quantity</span>
        <div class="flex gap-2 my-3" v-if="data != null">
            <el-tag v-for="item in data.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.ITEM_QUANTITY)" v-bind:key="item.unique_id!" type="primary">{{item.value}}</el-tag>
        </div>
    </el-card>
    </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { TrumsWrapper } from '#components';
import type { ComponentSize } from 'element-plus';
import type { Inventory } from '~/types/inventory';
import type { Pricelist, Pricelist_item } from '~/types/pricelist';
import { VariablePriceTag, type Pricetag } from '~/types/pricetag';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';


definePageMeta({
    middleware:['auth', 'app'],
    name: "Trums Pricelist",
})

const router = useRouter();
const loading = ref<boolean>(false);    
const goBack = () => router.back();

const request_search_pricelist_item = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "pricelist",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')
const {data} = await useFetchApi<BaseResponse<Pricetag>>(`/pricetag-read/${id.value}`, 'pricetag-detail', 'get', null);

const pricelist_item_new = ref<Pricelist_item[]>([]);  

const size = ref<ComponentSize>('default')

const blockMargin = computed(() => {
  const marginMap = {
    large: '32px',
    default: '28px',
    small: '24px',
  }
  return {
    marginTop: marginMap[size.value] || marginMap.default,
  }
})

const addNewLine = () => {
    console.log(data.value!.data.pricetag_item);
    // data.value!.data.pricetag_item = [...data.value!.data.pricetag_item, {
    //     catalogue: {
    //         id: null,
    //         unique_id: null,
    //         unique_code: null,
    //         name: '',
    //         brand_id: null,
    //         brand_name: null,
    //         year: null,
    //         sn: null,
    //         description: null,
    //         berat: null,
    //         volume: null,
    //         panjang: null,
    //         lebar: null,
    //         tinggi: null,
    //         is_asset: null,
    //         tmp_asset: null,
    //         version: null,
    //         type: 'item',
    //         created_at: null,
    //         created_by: null,
    //         updated_at: null,
    //         file_catalogues: []
    //     },
    //     catalogue_id: '',
    //     inventory: null,
    //     inventory_id: '',
    //     price: 0,
    //     tag_id: data.value!.data.unique_id,
    //     unique_id: '',
    // }]
}

const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
    const query_search: RequestSearch = {
        table: 'inventories',
        column: [
            {
                location_id: [data.value?.data.location_id],
            },
        ],
        keyword: queryString,
        limit: "20",
        offset: "1",
        sort: null,
    }
    useFetchApi<ResponsePagination<Inventory[]>>('/search', 'inventories', 'post', query_search).then((response) => {
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
        data.value!.data.pricetag_item[scope.$index].inventory_id = inventory.unique_id!;
        data.value!.data.pricetag_item[scope.$index].price = inventory.selling_price ?? 0;
    }

}

const onChangeQuantity = (e: string, scope: any) => {
    // data.value!.data.items[scope.$index]. = parseInt(e);
}

const onChangeSellingPrice = (e: string, scope: any) => {
    data.value!.data.pricetag_item[scope.$index].price = parseInt(e ?? '0');
}


</script>