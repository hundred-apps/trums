export type BaseResponse<T> = {
    success: boolean,
    message: string,
    data?: T
}

export type DataInterface<T> = {
    code: number,
    pending: boolean,
    message: string,
    data: T | null,
}