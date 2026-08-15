using CampusAccessibilityBackend.Enums;
//τα στοιχεία που εμφανίζονται στη λίστα
namespace CampusAccessibilityBackend.DTO
{
    public record ComplaintListReadOnlyDTO
    {   
        public int Id { get; set; }
        public string? Title { get; set; }

        public string? Category { get; set; }
        
      //  public string? School { get; set; }  //δεν εμφανίζεται στην λίστα

        public string? Department { get; set; }

        public ComplaintStatus Status { get; set; }

        public DateTime SubmittedAt { get; set; }


    }
}
