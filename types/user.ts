import type { AppFile } from "./file";

export type User  = {
    id: number;
    unique_id: string;
    unique_code: string | null;
    gid: number;
    name: string;
    email: string;
    phone: string;
    password: string | null;
    join_date: number;
    gender: string;
    departement_id: number | null;
    position_id: number | null;
    created_at: number;
    created_by: string | null;
    updated_at: number;
    file_id: string;
    photo: AppFile | null;
    departement_name: string | null;
    position_name: string | null;
}