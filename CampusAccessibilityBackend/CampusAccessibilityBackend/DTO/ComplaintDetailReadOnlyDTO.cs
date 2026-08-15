using CampusAccessibilityBackend.Enums;

namespace CampusAccessibilityBackend.DTO
{
    public record ComplaintDetailReadOnlyDTO
    {
        // Όμοια πεδία με ComplaintListReadOnlyDTO
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Category { get; set; }
        public string? Department { get; set; }
        public ComplaintStatus Status { get; set; }
        public DateTime SubmittedAt { get; set; }

        // Επιπλέον πεδία που εμφανίζονται στη σελίδα της λεπτομέρειας
        public string? School { get; set; }
        public DateOnly IncidentDate { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }

        // Στοιχεία φοιτητή — μόνο ο admin θα τα βλέπει
        public string? SubmittedByFullName { get; set; } //όνομα του ατόμου που κάνει submit
        public string? SubmittedByDepartment { get; set; }   //department στο οποίο ανήκει ο student που κάνει submit
        public string? SubmittedBySchool { get; set; }      //σχολή στην οποία ανήκει ο student που κάνει submit 

        // Nested DTOs
        public List<ComplaintImageReadOnlyDTO> Images { get; set; } = new();  //εικόνες που πιθανόν συνοδεύουν το παράπονο
        public List<ComplaintHistoryReadOnlyDTO> History { get; set; } = new();   //ιστορικό 
    }
}
