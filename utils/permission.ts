import { PermissionType, type Permission } from "~/types/menu";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";

export function canAccess(
  name: string,
  privilage: Permission[],
  step?: number
): boolean {
  const found = privilage.findLast((value) => value.slug == name);
  console.log("find", name);
  console.log("privilage", privilage);
  console.log("found", found);
  if (found) {
    if (found.type == PermissionType.APPROVAL) {
      if (found.approval_permission_pic?.findLast((app) => app.step == step)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
}

export async function checkPermission(slug: string): Promise<boolean> {
  try {
    const request_search: RequestSearch = {
      keyword: "",
      column: [
        {
          slug: [slug],
        },
      ],
      limit: "10",
      offset: "1",
      table: "permissions",
      sort: null,
      flag: "form",
    };
    const response = await useApiFetch<BaseResponse<boolean>>(
      "/check-permission",
      {
        method: "POST",
        body: { slug: slug },
      }
    );

    if (response.success) {
      const permission: boolean = response.data ?? false;

      return permission;
    } else {
      return false;
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.message ?? error}`);
    return false;
  }
}
