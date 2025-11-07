export enum OrderColumn {
    ASC = "ASC",
    DESC = "DESC",
}

export type RequestSearch = {
    keyword: string,
    table: string,
    column: any[],
    filter?: any,
    sort: {
        column: string,
        order: string
    } | null,
    flag?: "list"|"form",
    offset: string,
    limit: string,
}