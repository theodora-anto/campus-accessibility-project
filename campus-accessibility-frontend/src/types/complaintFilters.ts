//Φίλτρα
export interface ComplaintFilters {
    keyword?: string
    department?: string
    category?: string
    status?: string
    //για sorting στα φίλτρα
    sortOrder?: "newest" | "oldest"
}

//Pagination
export interface PaginatedResult<T> {
    data: T[]
    totalRecords: number
    pageNumber: number
    pageSize: number
    totalPages: number
}