namespace CampusAccessibilityBackend.Filters
{
    public class PaginatedResult<T>
    {
        public List<T> Data { get; set; } = [];
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public int TotalPages => (int)Math.Ceiling((double)TotalRecords / PageSize);
//        public bool HasNextPage => PageNumber < TotalPages;
 //       public bool HasPreviousPage => PageNumber > 1;


        public PaginatedResult()
        {
        }

        public PaginatedResult(List<T> data, int totalRecords, int pageNumber, int pageSize)
        {
            Data = data;
            TotalRecords = totalRecords;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}