<template>
  <TrumsWrapper>
      <el-page-header @back="goBack">
          <template #content>
              <span class="text-large font-600 mr-3"> Template Checklist - {{ data?.data.name }} </span>
          </template>
    </el-page-header>
    <el-card class="my-3">
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nama Template">{{
              data?.data.name
            }}
            </el-descriptions-item>
            <el-descriptions-item
              label="Hour Meter"
              >{{ data?.data.hour_meter }}
            </el-descriptions-item >
            <el-descriptions-item
              label="Kilo Meter"
              >{{ data?.data.kilo_meter }}
            </el-descriptions-item >
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Dibuat Tanggal">{{
              formatLocalDate(data?.data.created_at!)
            }}</el-descriptions-item>
            <el-descriptions-item label="Dibuat Oleh">{{
              data?.data?.people?.name ?? ''
            }}</el-descriptions-item>
            
          </el-descriptions>
        </div>
      </div>
    </el-card>
    <el-card class="my-3">
      <el-table :data="data?.data.template_checklist_item" border style="width: 100%">
        <el-table-column label="No"
          type="index"
          width="60"
          :index="indexMethod" />
        <el-table-column prop="checklist.name" label="Name"  />
      </el-table>
    </el-card>
    <el-card class="my-3">
      <customTable :height="500"  :columns="columnTemplateInventory" :data="data?.data.template_checklist_inventory ?? []"   />
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
    definePageMeta({
        middleware:['auth', 'app'],
        name: "Detail Template",
    })
import { NuxtLink, TrumsWrapper } from '#components';
import type { CheckboxValueType, Column } from 'element-plus';
import type { BaseResponse } from '~/types/response';
import type { TemplateChecklist, TemplateInventories } from '~/types/template_checklist';
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import DeleteButton from '~/components/trums/DeleteButton.vue';
import customTable from '~/components/trums/table/customTable.vue';
  
  const router = useRouter();
  
  const goBack = () => router.back();
  const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')


  const {data} = await useFetchApi<BaseResponse<TemplateChecklist>>(`/template-checklist-read/${id.value}`, 'template', 'get', null);


  const indexMethod = (index: number) => {
    // Jika tidak pakai pagination, cukup:
    return index + 1

    // Jika pakai pagination:
    // return (currentPage - 1) * pageSize + index + 1
  }

  const columnTemplateInventory: Column<TemplateInventories>[] = [
      {
        title: '', 
        dataKey: '',
        key: 'selection',
        width: 50,
        cellRenderer: ({ rowData }) => {
          const onChange = (value: CheckboxValueType) => (rowData.checked = value)
          return <SelectionCell value={rowData.checked} onChange={onChange} />
        },
        maxWidth: 50,

        headerCellRenderer: () => {
          const _data = unref(data)
          const onChange = (value: CheckboxValueType) =>
            (data.value = {message: _data?.message ?? '', success: _data?.success ?? true,data: {
              ..._data?.data,
              template_checklist_inventory: _data?.data?.template_checklist_inventory.map((row: any) => {
                row.checked = value
                return row
              }) as TemplateInventories[],
            } as TemplateChecklist});

          const allSelected = _data!.data.template_checklist_inventory.every((row) => row.checked)
          const containsChecked = _data?.data.template_checklist_inventory.some((row) => row.checked)

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
        title: 'SN', 
        dataKey: 'sn',
        key: 'sn',
        width: 200,
        cellRenderer: ({ rowData }: { rowData: TemplateInventories }) => <>{rowData.inventory?.sn}</>
      },
      {
        title: 'Nama', 
        dataKey: 'name',
        key: 'name',
        width: 300,
        sortable: true,
        cellRenderer: ({ rowData }: { rowData: TemplateInventories }) => <>{rowData.inventory?.catalogue?.name}</>
      },
      
      {
        title: 'Lokasi', 
        dataKey: 'location',
        key: 'location',
        width: 200,
        cellRenderer: ({ rowData }: { rowData: TemplateInventories }) => <>{rowData.inventory?.location?.name}</>
      },
      {
        title: 'Operasi',
        key: '',
        width: 250,
        
        cellRenderer: ({rowData: row}) => (
          <>
          
            <DeleteButton onConfirm={() => {}} onCancel={() => {}} />
            
          </>
        ),
      },
  ];

  onMounted(() => {
    console.log(id);
  })
</script>