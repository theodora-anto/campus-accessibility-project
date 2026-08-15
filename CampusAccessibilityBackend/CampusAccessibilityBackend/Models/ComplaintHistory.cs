using CampusAccessibilityBackend.Enums;

namespace CampusAccessibilityBackend.Models
{
    public class ComplaintHistory: BaseEntity
    {
        public int Id { get; set; }
        public string? AdminComment { get; set; }   //ο Admin μπορεί αν θέλει να προσθέσει σχόλιο
//        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;  //Θεωρητικά καλύπτεται από το BaseEntity
        public ComplaintStatus Status { get; set; }   //η κατάσταση του παραπόνου εκείνη τη στιγμή
        public int ComplaintId { get; set; }
        public Complaint Complaint { get; set; } = null!;
        public int? AdminId { get; set; } //στο πρώτο create του complaint δεν υπάρχει admin ακόμη
        public User? Admin { get; set; }
    }
}
