import type { AppFile } from "./file";
import type { Menu, Permission } from "./menu";

export type People = {
  id: number;
  unique_id: string;
  unique_code: string;
  gid: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  join_date: number;
  gender: string | null;
  departement_id: string | null;
  position_id: string | null;
  position_name?: string|null;
  file_id: string | null;
  created_at: number;
  created_by: number | null;
  updated_at: number;
  parent_people: string | null;
  position: string | null;
  departement: string | null;
  departement_name?: string|null;
  photo?: AppFile;
  version: number,
  user_permissions?: UserPermission[],
  menu?: Menu[],
  devices: DeviceInfo[],
};

export type DeviceInfo = {
  unique_id: string,
  device_name: string,
  people_id: string,
  is_active: boolean,
  platform: DevicePlatform,
  version: string,
  identifier: string,
  fcm_token: string,
  access_token: string,
  last_active: number,
  created_at: number,
  updated_at: number,
}

export enum DevicePlatform {
  MOBILE = 'mobile',
  WEB = 'web',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

export type UserPermission = {
  unique_id: string,
  people_id: string,
  permission_id: string,
  permission?: Permission,
}

export type PeopleAndTeam = {
  type: string,
  unique_id: string,
  name: string,
  version: number,
}