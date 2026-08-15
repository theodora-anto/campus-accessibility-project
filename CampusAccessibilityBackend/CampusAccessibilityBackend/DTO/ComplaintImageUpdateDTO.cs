using System.ComponentModel.DataAnnotations;

namespace CampusAccessibilityBackend.DTO
{
    //για να εισάγει το εναλλακτικό κείμενο ο admin
    public record ComplaintImageUpdateDTO

    {

        [StringLength(200, MinimumLength = 1, ErrorMessage = "Alt-text must be between 1 and 200 characters")]          //alt-text ιδανικά μέχρι 125 χαρακτήρες αλλά προτιμώ να είναι μεγάλες. Μπορεί να απαιτείται λεπτομέρεια στην περιγραφή

        public string? AltText { get; set; }

    }
}
