namespace CampusAccessibilityBackend.Models
{
    public class Student: BaseEntity
    {
        public int Id { get; set; }
        //public string Am { get; set; } = null!
        //public string Disability {get; set} = null!   //GDPR? 
        public string School { get; set; } = null!;        //Η σχολή στην οποία ανήκει ο φοιτητής. Ίσως και να μην χρειάζεται
        public string Department { get; set; } = null!;   //Το τμήμα στο οποίο ανήκει ο φοιτητής. Ίσως και να μην χρειάζεται

        public int UserId { get; set; }

        public User User { get; set; } = null!;

        public ICollection<Complaint> Complaints { get; set; } = new HashSet<Complaint>();
    }
}
