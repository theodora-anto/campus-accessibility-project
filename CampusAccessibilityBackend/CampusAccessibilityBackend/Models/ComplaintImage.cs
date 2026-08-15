namespace CampusAccessibilityBackend.Models
{
    public class ComplaintImage
    {
        //       public string? FileName { get; set; }

        public int Id { get; set; }
        public string FilePath { get; set; } = null!;   // το path της εικόνας στο server
        public int ComplaintId { get; set; }

        public string? AltText { get; set; } //για να εισάγει εναλλακτικό κείμενο ο admin στις φωτογραφίες (οι χρήστες μπορεί να είναι τυφλοί)

        public Complaint Complaint { get; set; } = null!;

    }
}
