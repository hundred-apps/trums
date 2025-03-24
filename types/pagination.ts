export type Pagination<T> = {
    currentPage: number,
    total_page: number,
    total_data: number,
    query: T
}

export type DefaultResponse<T> = {
    success: boolean,
    message: string,
    data: T,
}