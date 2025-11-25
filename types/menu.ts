import type { Departement } from "./departement";
import type { People } from "./people";
import type { Position } from "./position";

export type Menu = {
    unique_id: string,
    name: string,
    parent_id: string|null,
    route: string,
    icon: string,
    order: number,
    created_at: number,
    updated_at: number,
    version: number,
    parent: Menu| null,
    menus: Menu[],
    checked?: boolean,
    permissions: Permission[],
}

export enum PermissionType {
    PERMISSION = 'basic',
    APPROVAL = 'approval',
}

export enum ApprovalType {
    PARALLEL = 'parallel',
    SEQUENTIAL = 'sequential',
}

export type Permission = {
    unique_id: string;
    menu_id: string;
    permission_name: string;
    slug: string;
    created_by: string;
    created_at: number;
    updated_at: number;
    version: number;
    type: PermissionType,
    approval_type: ApprovalType,
    approval_length: number;
    approval_permission_pic?: ApprovalPermissionPIC[],
    checked?: boolean;
}

export enum ApprovalPermissionStatus {
    WAITING = 'waiting',
    APPROVE = 'approve',
    REJECT = 'rejected',
}

export type ApprovalPermissionPIC = {
    unique_id: string;
    permission_id: string;
    permission?: Permission;
    pic_id: string;
    pic?: People;
    departement_id: string;
    departement?: Departement;
    position_id: string;
    position?: Position;
    step: number;
    status: ApprovalPermissionStatus
}