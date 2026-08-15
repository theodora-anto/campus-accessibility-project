namespace CampusAccessibilityBackend.Core.Filters
{
    public class ComplaintFilters
    {
        public string? Department { get; set; }
        public string? Category { get; set; }
        public string? Status { get; set; }
        public string? Keyword { get; set; }
        public string? SortOrder { get; set; }  // "newest" ή "oldest"
    }
}
