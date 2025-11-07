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
  file_id: string | null;
  created_at: number;
  created_by: number | null;
  updated_at: number;
  parent_people: string | null;
  position: string | null;
  departement: string | null;
  photo?: AppFile;
  version: number,
  user_permissions?: UserPermission[],
  menu?: Menu[],
};

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