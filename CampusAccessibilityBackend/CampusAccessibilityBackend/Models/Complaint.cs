using CampusAccessibilityBackend.Enums;

namespace CampusAccessibilityBackend.Models
{
    public class Complaint: BaseEntity
    {   
        public int Id { get; set; }

        public string Title { get; set; } = null!;

        public string Category { get; set; } = null!;

        public string School { get; set; } = null!;

        public string Department { get; set; } = null!;   //το department για το οποίο κάνει παράπονο (μπορεί να είναι άλλο από το department του ίδιου του student)

        public DateOnly IncidentDate { get; set; }

        public string? Location { get; set; }

        public string Description { get; set; } = null!;


        public ComplaintStatus Status { get; set; } = ComplaintStatus.New; //ComplaintStatus.New = default τιμή είναι το New

        public int StudentId { get; set; }

        public Student Student { get; set; } = null!;

        public ICollection<ComplaintHistory> ComplaintHistories { get; set; } = new HashSet<ComplaintHistory>();

        public ICollection<ComplaintImage> ComplaintImages { get; set; } = new HashSet<ComplaintImage>();




    }
}
