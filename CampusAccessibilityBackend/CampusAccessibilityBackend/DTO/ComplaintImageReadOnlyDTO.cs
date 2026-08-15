namespace CampusAccessibilityBackend.DTO
{
    public record ComplaintImageReadOnlyDTO
    {
        public int Id { get; set; }
        public string? FilePath { get; set; }
        public string? AltText { get; set; }
    }
}
