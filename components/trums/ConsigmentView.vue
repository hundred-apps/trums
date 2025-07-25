<template>

    <div>
        <el-descriptions
            title=""
            :column="1"
            size="large"
            border
        >
            <el-descriptions-item label="Nama Customer">{{data?.contact_name}}</el-descriptions-item>
            <el-descriptions-item label="Nomor Telepon">{{ data?.contact?.phone ?? '' }}</el-descriptions-item>
            <el-descriptions-item label="Email">{{data?.contact?.email ?? ''}}</el-descriptions-item>
        </el-descriptions>
        <div class="text-lg mt-10 mb-3">Daftar File</div>
        <div class="mb-2" v-for="file in data?.files" :key="file.unique_id">
            <NuxtLink href="#" class="flex items-center gap-1 text-blue-600 text-sm"><el-icon><Link /></el-icon> {{ file.filename }}</NuxtLink>
        </div>
        <div class="text-lg mt-10 mb-3">Daftar Transaksi</div>
        <el-row :gutter="20" class="mb-3">
            <el-col :span="6"><el-input v-model="search_keyword" size="default" placeholder="Type to search" /></el-col>
            <el-popconfirm
            
            v-if="onCheckExist() && loading == false"
            width="220"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Apakah Anda Yakin Ingin Menghapus Data ini?"
            @cancel="() => {}"
            >
            <template #reference>
                <el-button size="default" class="ml-3" type="danger">Delete</el-button>
            </template>
            <template #actions="{ confirm, cancel }">
                <el-button size="small" @click="cancel">Batal</el-button>
                <el-button
                type="danger"
                size="small"
                @click="deleteBulk"
                >
                Hapus
                </el-button>
            </template>
            </el-popconfirm>
        </el-row>
        <el-table border show-summary :summary-method="getSummaries" v-if="data?.inventory_movement_items.length > 0" :data="data?.inventory_movement_items" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" :selectable="checkSelect" width="50" />
            <el-table-column prop="inventory_name" label="Nama Item" width="180" />
            <el-table-column prop="sn" label="Serial/Part Number" width="180" />
            <el-table-column prop="quantity" label="Quantity">
                <template #default="{ row }">
                    {{ `${row.quantity} ${row.unit_name}` }}
                </template>
            </el-table-column>
            <el-table-column prop="selling_price" label="Harga Jual">
                <template #default="{ row }">
                    {{ currency(row.selling_price) }}
                </template>
            </el-table-column>
            <el-table-column prop="location_name" label="Gudang" />
            <el-table-column label="Total" width="200">
                <template #default="{ row }">
                    {{ currency(row.quantity * row.selling_price) }}
                </template>
            </el-table-column>
        </el-table>
        <div class="flex my-10">
            <el-button type="default" @click="simpan">
                Simpan
            </el-button>
            <el-button type="primary" @click="print">
                Simpan & Cetak PDF
            </el-button>
        </div>
    </div>
</template>

<script lang="tsx" setup>
import type { Consigment, ConsigmentItem } from '~/types/consignment';
import { Link, InfoFilled } from '@element-plus/icons-vue'
import { NuxtLink } from '#components';
import type { CheckboxValueType, Column, TableColumnCtx } from 'element-plus';
import SelectionCell from './table/SelectionCell.vue';
import customTable from './table/customTable.vue';
import type { BaseResponse } from '~/types/response';
interface Props {
  data: Consigment;
}

const loading = ref<boolean>(false);
const props = defineProps<Props>();
const search_keyword = ref<string>('');
const selectionItem = ref<ConsigmentItem[]>([]);
const router = useRouter();


const availableColumn: Column<ConsigmentItem>[] = [
    {
      title: '', 
      dataKey: '',
      key: 'selection',
      width: 50,
      maxWidth: 50,

      headerCellRenderer: () => {
        const _data = unref(props.data.inventory_movement_items)
        const onChange = (value: CheckboxValueType) =>
          (props.data.inventory_movement_items = _data?.map((row: any) => {
            row.checked = value
            return row
          }));

        const allSelected = _data!.every((row) => row.checked)
        const containsChecked = _data?.some((row) => row.checked)

        return (
          <SelectionCell
          style={{width: 50}}
            value={allSelected}
            interminate={(containsChecked && !allSelected)}
            onChange={onChange}
          />
        )
      },
    },
    {
        title: 'Nama Item', 
        dataKey: 'inventory_name',
        key: 'inventory_name',
        width: 200,
    },
    {
        title: 'Serial/Part Number', 
        dataKey: 'sn',
        key: 'sn',
        width: 200,
    },
    {
        title: 'Quantity', 
        dataKey: 'quantity',
        key: 'quantity',
        width: 200,
    },
    {
        title: 'Harga Jual', 
        dataKey: 'selling_price',
        key: 'selling_price',
        width: 200,
        cellRenderer: ({rowData: row}) => <>{currency(row.selling_price)}</>
    },
    {
        title: 'UOM', 
        dataKey: 'unit_name',
        key: 'unit_name',
        width: 200,
    },
]

const print = async () => {
    const consigment_save: Consigment | null = await simpan() ?? null;
    if(consigment_save != null){
        window.open('/inventory-management/consigment/pdf/' + consigment_save.unique_id, '__blank');
    }
}
const simpan = async () => {
    loading.value = true;
    try {
        const data = {
            contact_id: props.data.contact_id,
            contact_name: props.data.contact_name,
            contact_version: props.data.contact_version,
            recaps_item: props.data.inventory_movement_items.map((value) => ({
                "quantity": value.quantity,
                "selling_price" : value.selling_price,
                "inventory_id" : value.inventory_id,
                "inventory_name" : value.inventory_name,
                "location_id" : value.location_id,
                "location_name" : value.location_name,
                "transaction_date" : value.transaction_date,
                "inventory_movement_id" : value.inventory_movement_id,
            })),
        }
        const response = await useFetchApi<BaseResponse<Consigment>>('/transaction-recaps-create', 'create-recap', 'post', data);

        if(response.status.value == 'success'){
            ElMessage.success(`Data Berhasil Di Simpan!`);
            return response.data.value!.data;
        }
    } catch (error: any) {
        ElMessage.error(`${error.response?.message ?? error}`);
        return null;
    } finally {
        loading.value = false;
    }
}

const checkSelect = (data: ConsigmentItem) => props.data?.inventory_movement_items.some((row) => row.inventory_id);
const onCheckExist = () => selectionItem.value.length > 0;

const deleteBulk = async () => {
    const ids = selectionItem.value.map((value) => value.unique_id);
    const checkeds = props.data?.inventory_movement_items.filter((value) => !ids.includes(value.unique_id));
    props.data!.inventory_movement_items = checkeds ?? [];
}

const totalPrice = computed(() => {
  return props.data?.inventory_movement_items.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0);
});

interface SummaryMethodProps<T = ConsigmentItem> {
  columns: TableColumnCtx<T>[]
  data: T[]
}

const handleSelectionChange = (val: ConsigmentItem[]) => {
  selectionItem.value = val;
}

const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: (string | VNode)[] = []
  columns.forEach((column: { property: string | number; }, index: number) => {
    if (index === 1) {
      sums[index] = h('div', { style: { textDecoration: 'underline' } }, [
        'Total',
      ])
      return
    }

    if(index == 6){
        const values = data.map((item: { [x: string]: any; }) => Number(item[column.property]))
        console.log(values);
        sums[index] = `${currency(props.data?.inventory_movement_items.reduce((prev: any, curr: any) => prev + (curr.quantity * curr.selling_price), 0))}`
    }
  })

  return sums
}



onMounted(() => {
    console.log(props.data);
})
</script>