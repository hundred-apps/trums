export type Pagination<T> = {
    currentPage: number,
    total_page: number,
    total_data: number,
    query: T
}