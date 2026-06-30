<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "menus-create",
  name: "Create Menu",
});

interface MenuForm {
  unique_id: string;
  name: string;
  parent_id: string | null;
  parent_view: string;
  route: string;
  icon: string | null;
  order: number | null;
  created_at: number;
  updated_at: number;
  version: number;
  permissions: Permission[];
}

interface ApprovalPermissionPICForm {
  unique_id: string;
  label: string;
  permission_id: string;
  pic_id: string;
  pic_name: string;
  departement_id: string;
  departement_name: string;
  position_id: string;
  position_name: string;
  step: number;
}

interface ApprovalPermissionForm {
  label: string;
  approval_permission: ApprovalPermissionPICForm[];
}

import { reactive, ref, onMounted, computed } from "vue";
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import type { ComponentSize } from "element-plus";
import { Search, Back, Delete, InfoFilled } from "@element-plus/icons-vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { BaseResponse } from "~/types/response";
import {
  ApprovalPermissionStatus,
  ApprovalType,
  PermissionType,
  type ApprovalPermissionPIC,
  type Menu,
  type Permission,
} from "~/types/menu";
import type { People } from "~/types/people";
import type { Departement } from "~/types/departement";
import type { Position } from "~/types/position";

const router = useRouter();
const route = useRoute();
const id = computed(() => route.query.id as string);
const parent_id = computed(() => route.query.parent_id as string);

const goBack = () => router.back();
const loading = ref<boolean>(false);

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

// Data untuk dropdown parent menu
const parentMenus = ref<any[]>([]);
const request_search = ref<RequestSearch>({
  keyword: "",
  table: "menus",
  column: [
    {
      parent_id: ["null"], // Hanya ambil parent menus
    },
  ],
  limit: "100",
  offset: "1",
  sort: {
    column: "order",
    order: "asc",
  },
});

const ruleForm = reactive<MenuForm>({
  unique_id: "",
  name: "",
  parent_id: null,
  parent_view: "",
  route: "",
  icon: null,
  order: null,
  created_at: Date.now() / 1000,
  updated_at: Date.now() / 1000,
  version: 0,
  permissions: [],
});

const rules = reactive<FormRules<MenuForm>>({
  name: [
    {
      required: true,
      message: "Nama menu harus diisi",
      trigger: "blur",
    },
    {
      min: 2,
      max: 50,
      message: "Panjang nama menu harus antara 2-50 karakter",
      trigger: "blur",
    },
  ],
  route: [
    {
      required: true,
      message: "Route harus diisi",
      trigger: "blur",
    },
    {
      pattern: /^\/[a-zA-Z0-9\-_\/]*$/,
      message:
        "Route harus dimulai dengan / dan hanya boleh mengandung huruf, angka, dash, underscore, dan slash",
      trigger: "blur",
    },
  ],
  order: [
    {
      type: "number",
      min: 1,
      max: 999,
      message: "Urutan harus antara 1-999",
      trigger: "blur",
    },
  ],
});

// Computed properties
const isEditMode = computed(() => !!id.value);
const pageTitle = computed(() =>
  isEditMode.value
    ? "Edit Menu"
    : parent_id.value
    ? "Tambah Submenu"
    : "Tambah Menu Baru"
);

const isSubmenu = computed(() => !!parent_id.value || !!ruleForm.parent_id);

const fetchMenuDetail = async () => {
  if (!id.value) return;

  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Menu>>(
      `/menu-read/${id.value}`,
      "get-menu-detail",
      "get",
      null
    );
    if (response.status.value === "success") {
      const menuData = response.data.value?.data;
      if (menuData) {
        Object.assign(ruleForm, menuData);
        ruleForm.parent_id = menuData.parent_id;
        ruleForm.parent_view = menuData.parent?.name ?? "";
        ruleForm.permissions = menuData.permissions;
        // console.log('permission', ruleForm.permissions);
      }

      initialApprovalSetting();
    }
  } catch (error) {
    ElMessage.error("Gagal memuat detail menu");
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  loading.value = true;
  try {
    const formData = new FormData();

    // Append form data
    const payload = {
      unique_id: ruleForm.unique_id,
      name: ruleForm.name,
      route: ruleForm.route,
      icon: ruleForm.icon || "",
      order: ruleForm.order || 0,
      parent_id: ruleForm.parent_id || "",
      version: ruleForm.version.toString(),
      permission: ruleForm.permissions.map((permission) => ({
        unique_id: `${permission.unique_id}`,
        permission_name: `${permission.permission_name}`,
        approval_length: `${permission.approval_length}`,
        type: `${permission.type}`,
        approval_type: `${permission.approval_type}`,
        approval_permission_pic: (permission.approval_permission_pic ?? []).map(
          (value) => ({
            unique_id: value.unique_id,
            permission_id: value.permission_id,
            pic_id: value.pic_id,
            step: value.step,
            status: ApprovalPermissionStatus.WAITING,
            departement_id: value.departement_id,
            position_id: value.position_id,
          })
        ),
      })),
    };

    let response = await useFetchApi<BaseResponse<Menu>>(
      "/menu-create",
      "create-menu",
      "post",
      payload
    );

    if (response.status.value === "success") {
      ElMessage.success(
        isEditMode.value ? "Menu berhasil diperbarui" : "Menu berhasil dibuat"
      );
      if (!id.value) {
        ruleFormRef.value?.resetFields();
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Terjadi kesalahan");
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate((valid, fields) => {
    if (valid) {
      onSubmit();
    } else {
      console.log("Form validation failed:", fields);
      ElMessage.warning("Harap periksa kembali form yang diisi");
    }
  });
};

const addNewLine = () => {
  ruleForm.permissions.push({
    unique_id: "",
    menu_id: "",
    permission_name: "",
    slug: "",
    created_by: "",
    created_at: 0,
    updated_at: 0,
    version: 0,
    type: PermissionType.PERMISSION,
    approval_type: ApprovalType.PARALLEL,
    approval_length: 0,
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  if (!isEditMode.value) {
    // Reset ke nilai default untuk form baru
    Object.assign(ruleForm, {
      unique_id: "",
      name: "",
      parent_id: parent_id.value || null,
      route: "",
      icon: null,
      order: null,
      version: 0,
    });
  }
};

const handleClearParent = () => {
  ruleForm.parent_id = "deleted";
  ruleForm.parent_view = "";
};

// Auto-generate route based on name
const generateRoute = () => {
  if (!ruleForm.route && ruleForm.name) {
    const baseRoute =
      "/" +
      ruleForm.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    ruleForm.route = baseRoute;
  }
};

const onDeleteList = async (index: number) => {
  const permission: Permission = ruleForm.permissions[index];
  if (permission.unique_id) {
    const deleted: boolean = await deletePermission([
      permission.unique_id ?? "",
    ]);
    if (deleted) {
      ruleForm.permissions.splice(index, 1);
    }
  } else {
    ruleForm.permissions.splice(index, 1);
  }
};

const deletePermission = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await useApiFetch<BaseResponse<any>>(
      "/permission-delete",
      {
        method: "POST",
        body: ids,
      }
    );
    return response.success;
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message ?? error}`);
    return false;
  }
};

// Watch for name changes to auto-generate route
watch(
  () => ruleForm.name,
  () => {
    if (!isEditMode.value) {
      generateRoute();
    }
  }
);

// Initialize form for submenu
if (parent_id.value) {
  ruleForm.parent_id = parent_id.value;

  // Find parent menu untuk auto-generate route
  onMounted(async () => {
    const parentMenu = parentMenus.value.find(
      (menu) => menu.unique_id === parent_id.value
    );
    if (parentMenu && parentMenu.route) {
      const baseRoute = parentMenu.route === "/" ? "" : parentMenu.route;
      ruleForm.route = `${baseRoute}/new-submenu`;
    }
  });
}

onMounted(async () => {
  if (id.value) {
    await fetchMenuDetail();
  } else if (!parent_id.value) {
    // Generate order terakhir untuk menu utama baru
    const maxOrder = Math.max(
      ...parentMenus.value.map((menu) => menu.order || 0),
      0
    );
    ruleForm.order = maxOrder + 1;
  }
});

const create_people = async (people: People) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<People>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      people
    );
    if (response.status.value == "success") {
      const people_result: People | null = response.data.value?.data ?? null;
      return people_result;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const querySearchAsyncPIC = (queryString: string, cb: (arg: any) => void) => {
  const search_request: RequestSearch = {
    keyword: queryString,
    table: "people",
    column: [],
    sort: {
      column: "name",
      order: OrderColumn.DESC,
    },
    offset: "1",
    limit: "10",
  };

  useFetchApi<ResponsePagination<People[]>>(
    "/search",
    "search-people",
    "post",
    search_request
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: People[] = response.data.value?.data || [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: People) => {
            return {
              ...data,
              value: `${data.name} ${data.email ? " - " + data.phone : ""}`,
            };
          });
          cb(results);
        } else {
          cb([
            {
              value: `${queryString}`,
              label: `Tambahkan ${queryString}`,
              isNew: true,
            },
          ]);
        }
      } else {
        ElMessage.error(`${response.error ?? ""}`);
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response.data.message ?? error}`);
    });
};

const querySearchAsyncDept = (queryString: string, cb: (arg: any) => void) => {
  const search_request: RequestSearch = {
    keyword: queryString,
    table: "departements",
    column: [],
    sort: {
      column: "name",
      order: OrderColumn.DESC,
    },
    offset: "1",
    limit: "10",
  };

  useFetchApi<ResponsePagination<Departement[]>>(
    "/search",
    "search-dept",
    "post",
    search_request
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Departement[] = response.data.value?.data || [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: Departement) => {
            return { ...data, value: `${data.name}` };
          });
          cb(results);
        }
      } else {
        ElMessage.error(`${response.error ?? ""}`);
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response.data.message ?? error}`);
    });
};
const querySearchAsyncPosition = (
  queryString: string,
  cb: (arg: any) => void
) => {
  const search_request: RequestSearch = {
    keyword: queryString,
    table: "positions",
    column: [],
    sort: {
      column: "name",
      order: OrderColumn.DESC,
    },
    offset: "1",
    limit: "10",
  };

  useFetchApi<ResponsePagination<Position[]>>(
    "/search",
    "search-position",
    "post",
    search_request
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Position[] = response.data.value?.data || [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: Position) => {
            return { ...data, value: `${data.name}` };
          });
          cb(results);
        }
      } else {
        ElMessage.error(`${response.error ?? ""}`);
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response.data.message ?? error}`);
    });
};

const onHandleSelectPIC = async (
  item: Record<string, any>,
  index: number,
  scope: any
) => {
  if (item.isNew) {
    const peopleCreate: People = {
      id: 0,
      unique_id: "",
      unique_code: "",
      gid: null,
      name: item.value,
      email: null,
      phone: null,
      password: null,
      join_date: 0,
      gender: null,
      departement_id: null,
      position_id: null,
      file_id: null,
      created_at: 0,
      created_by: null,
      updated_at: 0,
      parent_people: null,
      position: null,
      departement: null,
      version: 0,
      devices: [],
    };

    const selected: People | null = (await create_people(peopleCreate)) ?? null;

    if (selected != null) {
      ruleForm.permissions[index].approval_permission_pic![scope.$index].pic =
        selected;
      ruleForm.permissions[index].approval_permission_pic![
        scope.$index
      ].pic_id = selected.unique_id;
    } else {
      ElMessage.error(`Ops, Something wrong!!`);
    }
  } else {
    const selected: People = item as People;
    ruleForm.permissions[index].approval_permission_pic![scope.$index].pic =
      selected;
    ruleForm.permissions[index].approval_permission_pic![scope.$index].pic_id =
      selected.unique_id;
  }
};

const onHandleSelectDept = async (
  item: Record<string, any>,
  index: number,
  scope: any
) => {
  const selected: Departement = item as Departement;
  ruleForm.permissions[index].approval_permission_pic![
    scope.$index
  ].departement = selected;
  ruleForm.permissions[index].approval_permission_pic![
    scope.$index
  ].departement_id = selected.unique_id;
};
const onHandleSelectPosition = async (
  item: Record<string, any>,
  index: number,
  scope: any
) => {
  const selected: Position = item as Position;
  ruleForm.permissions[index].approval_permission_pic![scope.$index].position =
    selected;
  ruleForm.permissions[index].approval_permission_pic![
    scope.$index
  ].position_id = selected.unique_id;
};

const querySearchParents = (queryString: string, cb: (arg: any) => void) => {
  request_search.value.keyword = queryString;
  request_search.value.flag = "form";

  useFetchApi<ResponsePagination<Menu[]>>(
    "/search",
    `search-menus-${queryString}`,
    "post",
    request_search.value
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Menu[] = response.data.value?.data || [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: Menu) => {
            return { data: data, value: `${data.name}` };
          });

          cb(results);
        }
      } else {
        ElMessage.error(response.data.value?.message || "");
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const onHandleSelectMenu = (menuData: any) => {
  const menu: Menu = menuData.data as Menu;

  ruleForm.parent_id = menu.unique_id;
  ruleForm.parent_view = menu.name;
};

const initialApprovalSetting = () => {
  ruleForm.permissions.forEach((element) => {
    console.log("type permission", element.type);
    if (element.type === PermissionType.APPROVAL) {
      element.approval_permission_pic = Array.from(
        { length: element.approval_length },
        (_, i) => {
          const approvals: ApprovalPermissionPIC | undefined =
            element.approval_permission_pic![i];
          return {
            unique_id: approvals?.unique_id ?? "",
            permission_id: approvals?.permission_id ?? "",
            permission: approvals?.permission,
            pic_id: approvals?.pic_id ?? "",
            pic: approvals?.pic ?? {
              id: 0,
              unique_id: "",
              unique_code: "",
              gid: "",
              name: "",
              email: "",
              phone: "",
              password: "",
              join_date: 0,
              gender: "",
              departement_id: "",
              position_id: "",
              file_id: "",
              created_at: 0,
              created_by: 0,
              updated_at: 0,
              parent_people: "",
              position: "",
              departement: "",
              version: 0,
              devices: [],
            },
            departement_id: approvals?.departement_id ?? "",
            departement: approvals?.departement ?? {
              id: 0,
              unique_id: "",
              unique_code: "",
              name: "",
              created_at: 0,
              created_by: "",
              updated_at: 0,
            },
            position_id: approvals?.position_id ?? "",
            position: approvals?.position ?? {
              id: 0,
              unique_id: "",
              unique_code: "",
              name: "",
              created_at: 0,
              created_by: "",
              updated_at: 0,
            },
            step: i + 1,
            status: ApprovalPermissionStatus.APPROVE,
          };
        }
      );
    } else {
      element.approval_permission_pic = [];
    }
  });
};
</script>

<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">{{ pageTitle }}</span>
      </template>
    </el-page-header>

    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm mt-6"
      :size="formSize"
      status-icon
    >
      <el-card class="my-3">
        <template #header>
          <div class="card-header flex justify-start">
            <el-button
              type="primary"
              @click="submitForm(ruleFormRef)"
              :loading="loading"
            >
              {{ isEditMode ? "Perbarui" : "Simpan" }}
            </el-button>
            <el-button @click="goBack">Batal</el-button>
          </div>
        </template>

        <!-- Field Parent Menu (hanya untuk menu utama) -->
        <el-form-item label="Parent Menu" prop="parent_id">
          <el-autocomplete
            v-model="ruleForm.parent_view"
            :fetch-suggestions="querySearchParents"
            placeholder="Pilih parent menu (kosongkan untuk menu utama)"
            @select="onHandleSelectMenu"
          >
            <template #default="{ item }">
              <div class="flex items-center">
                <span>{{ item.value }}</span>
                <el-tag v-if="item.data.route" size="small" class="ml-2">
                  {{ item.data.route }}
                </el-tag>
              </div>
            </template>
          </el-autocomplete>
          <div class="el-form-item__description">
            Kosongkan field ini jika ingin membuat menu utama
          </div>
        </el-form-item>

        <!-- Nama Menu -->
        <el-form-item label="Nama Menu" prop="name">
          <el-input
            v-model="ruleForm.name"
            placeholder="Masukkan nama menu"
            clearable
            @blur="generateRoute"
          />
          <div class="el-form-item__description">
            Nama menu yang akan ditampilkan di navigasi
          </div>
        </el-form-item>

        <!-- Route -->
        <el-form-item label="Route" prop="route">
          <el-input
            v-model="ruleForm.route"
            placeholder="Contoh: /users, /settings/profile"
            clearable
          >
            <template #prepend>
              <span class="text-gray-500">/</span>
            </template>
          </el-input>
          <div class="el-form-item__description">
            Path URL untuk menu ini. Harus dimulai dengan slash (/)
          </div>
        </el-form-item>

        <!-- Icon -->
        <el-form-item label="Icon">
          <el-input
            v-model="ruleForm.icon"
            placeholder="Masukkan nama icon (opsional)"
            clearable
          />
          <div class="el-form-item__description">
            Nama icon dari library icon yang digunakan (misal: el-icon-user)
          </div>
        </el-form-item>

        <!-- Urutan -->
        <el-form-item label="Urutan" prop="order">
          <el-input-number
            v-model="ruleForm.order!"
            :min="1"
            :max="999"
            controls-position="right"
            placeholder="Urutan tampilan"
          />
          <div class="el-form-item__description">
            Urutan menu dalam tampilan (1 adalah yang pertama)
          </div>
        </el-form-item>

        <!-- Preview Info -->
        <el-card v-if="ruleForm.name" class="mt-4" shadow="never">
          <template #header>
            <div class="text-sm font-medium">Preview Menu</div>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Nama:</span>
              <span class="font-medium">{{ ruleForm.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Route:</span>
              <span class="font-mono text-blue-600">{{
                ruleForm.route || "-"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tipe:</span>
              <el-tag :type="isSubmenu ? 'info' : 'primary'" size="small">
                {{ isSubmenu ? "Submenu" : "Menu Utama" }}
              </el-tag>
            </div>
            <div v-if="ruleForm.order" class="flex justify-between">
              <span class="text-gray-600">Urutan:</span>
              <span class="font-medium">{{ ruleForm.order }}</span>
            </div>
          </div>
        </el-card>
      </el-card>
    </el-form>

    <el-card class="my-3">
      <template #header>
        <div class="card-header">Daftar Permission</div>
      </template>
      <el-table :data="ruleForm.permissions" width="100%" border>
        <el-table-column label="Nama">
          <template #default="scope">
            <el-input
              v-model="scope.row.permission_name"
              placeholder="Nama Permission"
            />
          </template>
        </el-table-column>
        <el-table-column width="200" label="Tipe Permission">
          <template #default="scope">
            <el-select
              v-model="scope.row.type"
              placeholder="Select"
              @change="(val) => initialApprovalSetting()"
            >
              <el-option
                v-for="item in [
                  { value: PermissionType.APPROVAL, label: 'Approval' },
                  { value: PermissionType.PERMISSION, label: 'Basic' },
                ]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          width="150"
          label="Aturan Approval"
          prop="approval_type"
        >
          <template #default="scope">
            <el-select v-model="scope.row.approval_type" placeholder="Select">
              <el-option
                v-for="item in [
                  { value: ApprovalType.PARALLEL, label: 'Parallel' },
                  { value: ApprovalType.SEQUENTIAL, label: 'Sequential' },
                ]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          width="150"
          label="Tingkatan Approval"
          prop="approval_length"
        >
          <template #default="scope">
            <el-input-number
              @change="initialApprovalSetting"
              v-model="scope.row.approval_length"
            />
          </template>
        </el-table-column>
        <el-table-column width="100" label="Aksi">
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
                  @click="
                    () => {
                      onDeleteList(scope.$index);
                      cancel;
                    }
                  "
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

    <div v-for="(approval_permission, index) in ruleForm.permissions">
      <el-card
        v-if="approval_permission.type == PermissionType.APPROVAL"
        class="my-3"
      >
        <template #header>
          <div class="card-header">
            {{
              `${approval_permission.approval_type} ${approval_permission.permission_name} ${approval_permission.approval_length} step`
            }}
          </div>
        </template>
        <el-table
          :data="approval_permission.approval_permission_pic"
          width="100%"
          border
        >
          <el-table-column label="Tahapan">
            <template #default="scope">
              {{ `Step ${scope.row.step}` }}
            </template>
          </el-table-column>
          <el-table-column width="200" label="PIC">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchAsyncPIC"
                v-model="scope.row.pic.name"
                placeholder="Cari PIC"
                @select="(item: Record<string, any>) => onHandleSelectPIC(item, index, scope)"
              >
                <template #default="{ item }">
                  <div
                    v-if="item.isNew"
                    class="flex items-center text-blue-500"
                  >
                    <el-icon><Plus /></el-icon>
                    <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                  </div>
                  <div v-else>
                    <p style="line-height: 15px" class="font-bold">
                      {{ item.value }}
                    </p>
                    <p>{{ item.email ?? "Tidak Ada" }}</p>
                  </div>
                </template>
              </el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column width="200" label="Dapartemen">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchAsyncDept"
                v-model="scope.row.departement.name"
                placeholder="Cari PIC"
                @select="(item: Record<string, any>) => onHandleSelectDept(item, index, scope)"
              >
              </el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column width="200" label="Jabatan">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchAsyncPosition"
                v-model="scope.row.position.name"
                placeholder="Cari PIC"
                @select="(item: Record<string, any>) => onHandleSelectPosition(item, index, scope)"
              >
              </el-autocomplete>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </TrumsWrapper>
</template>

<style scoped>
.el-form-item__description {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  line-height: 1.4;
}

:deep(.font-mono) {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
    "Liberation Mono", monospace;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
