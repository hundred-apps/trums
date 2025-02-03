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
    departement_id: number | null;
    position_id: number | null;
    file_id: number | null;
    created_at: number;
    created_by: number | null;
    updated_at: number;
    parent_people: string | null;
    position: string | null;
    photo: string | null;
  };
  