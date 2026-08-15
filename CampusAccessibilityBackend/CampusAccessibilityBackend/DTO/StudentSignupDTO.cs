using System.ComponentModel.DataAnnotations;
using CampusAccessibilityBackend.Helpers;

namespace CampusAccessibilityBackend.DTO
{
    public record StudentSignupDTO
    {

        [Required(ErrorMessage = "The {0} field is required.")]
        [StringLength(100, ErrorMessage = "Email must not exceed 100 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "The {0} field is required.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Firstname must be between 2 and 50 characters.")]
        public string? Firstname { get; set; }

        [Required(ErrorMessage = "The {0} field is required.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Lastname must be between 2 and 50 characters.")]
        public string? Lastname { get; set; }


        [Required(ErrorMessage = "The {0} field is required.")]
        [AllowedValues(
            "Αγροτικής Ανάπτυξης, Διατροφής και Αειφορίας",
            "Επιστημών Αγωγής",
            "Επιστημών Υγείας",
            "Επιστήμης Φυσικής Αγωγής και Αθλητισμού",
            "Θεολογική",
            "Θετικών Επιστημών",
            "Νομική",
            "Οικονομικών και Πολιτικών Επιστημών",
            "Φιλοσοφική",
            ErrorMessage = "Invalid school.")]
        public string? School { get; set; }

        [Required(ErrorMessage = "The {0} field is required.")]
        [ValidDepartment]
        public string? Department { get; set; }

        [Required(ErrorMessage = "The {0} field is required.")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$",
ErrorMessage = "Password must contain at least one uppercase, one lowercase, " +
"one digit, and one special character")]
        public string? Password { get; set; }


        [Required(ErrorMessage = "The {0} field is required.")]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string? ConfirmPassword { get; set; }



    }
}
