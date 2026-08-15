namespace CampusAccessibilityBackend.Enums
{
    public enum ComplaintStatus
    {
        New,
        UnderReview,   //ο admin το έχει δει και διερευνά το πρόβλημα/μιλάει με το τμήμα
        InProgress,   // η τεχνική υπηρεσία ασχολείται ενεργά με το πρόβλημα
        Pending,       //Δεν υπάρχει ακόμη απόκριση από την τεχνική υπηρεσία ή όποιο άλλο τρίτο φορέα
        Resolved,     
        Rejected      //δεν μπορεί να επιλυθεί/ εκτός αρμοδιότητας
    }
}