namespace CampusAccessibilityBackend.Models
{
    public class BaseEntity
    {
        public DateTime InsertedAt { get; set; } = DateTime.UtcNow;

        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;   // Soft delete
        public DateTime? DeletedAt { get; set; }


    }
}
