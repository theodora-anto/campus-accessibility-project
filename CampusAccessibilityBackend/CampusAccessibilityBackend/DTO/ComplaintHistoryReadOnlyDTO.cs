using CampusAccessibilityBackend.Enums;

namespace CampusAccessibilityBackend.DTO
{
    public record ComplaintHistoryReadOnlyDTO
    {

        public string? AdminComment { get; set; } = null;

        public ComplaintStatus Status { get; set; }

        public DateTime ChangedAt { get; set; }
    };
}
