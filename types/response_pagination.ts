export type ResponsePagination<T> = {
    success: boolean,
    currentPage: number,
    total_page: number,
    total_data: number,
    data: T
}