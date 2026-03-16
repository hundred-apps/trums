<script lang="tsx" setup>
import { ref } from "vue";
import {
  ElTag,
  ElText,
  ElButton,
  type CheckboxValueType,
  ElDropdown,
  ElIcon,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import CustomTable from "~/components/trums/table/customTable.vue";
import { NuxtLink } from "#components";
import type { ColumnTable } from "~/types/ColumnTable";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Team } from "~/types/maintenance";
import { Eleme, Setting } from "@element-plus/icons-vue";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "maintenance-team-read",
  name: "Maintenance Team",
});

const request_search = ref({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "maintenance_team",
  sort: {
    column: "created_at",
    order: "desc",
  },
});

const { data, pending } = await useFetchApi<ResponsePagination<Team[]>>(
  `/search`,
  "maintenance-team",
  "post",
  request_search.value
);

const columns: ColumnTable<Team>[] = [
  {
    key: "name",
    title: "Team Name",
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`maintenance-team/${row.unique_id}`}>{row.name}</NuxtLink>
    ),
  },
  {
    key: "leader",
    title: "Dibuat Oleh",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <ElText>{row.people?.name ?? "-"}</ElText>
    ),
  },
  {
    key: "members",
    title: "Total Member",
    width: 150,
    align: "center",
    cellRenderer: ({ rowData: row }) => (
      <ElTag>{row.maintenance_team_member?.length ?? 0}</ElTag>
    ),
  },
  {
    key: "created_at",
    title: "Created",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <ElText>{formatLocalDate(row.created_at)}</ElText>
    ),
  },
  {
    key: "action",
    title: "Action",
    width: 75,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: Team }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/human-capital-management/team/add?id=${rowData.unique_id}`;
        }
        if (command === "delete") {
          //   onDelete([rowData.unique_id!]);
        }
      };

      return (
        <ElDropdown onCommand={onCommand} hideOnClick={false}>
          {{
            default: () => (
              <span class="cursor-pointer text-primary">
                <ElIcon>
                  <Setting />
                </ElIcon>
              </span>
            ),
            dropdown: () => (
              <ElDropdownMenu>
                <ElDropdownItem command="edit">Edit</ElDropdownItem>
                <ElDropdownItem class={"text-red-600"} command="delete" divided>
                  Delete
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
  },
];

columns.unshift({
  key: "selection",
  width: 50,
  maxWidth: 50,
  align: "center",
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const onChange = (value: CheckboxValueType) => {
      data.value?.data?.forEach((item) => {
        item.checked = value as boolean;
      });
    };
    return (
      <SelectionCell
        value={data.value?.data?.every((item) => item.checked) || false}
        onChange={onChange}
      />
    );
  },
});
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Type to search"
      /></el-col>
      <NuxtLink
        href="/human-capital-management/team/add"
        class="el-button el-button--primary"
      >
        New Team
      </NuxtLink>

      <el-button :loading="pending" :icon="Eleme">Reload</el-button>
    </el-row>

    <CustomTable :columns="columns" :data="data?.data ?? []" />
  </TrumsWrapper>
</template>

<style scoped>
:deep(.el-table__cell) {
  padding: 3px !important;
}
</style>
