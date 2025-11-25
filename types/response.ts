import type { Permission } from "./menu"

export type BaseResponse<T> = {
    success: boolean,
    message: string,
    data?: T,
    privilege: Permission[],
}

export type DataInterface<T> = {
    code: number,
    pending: boolean,
    message: string,
    data: T | null,
}