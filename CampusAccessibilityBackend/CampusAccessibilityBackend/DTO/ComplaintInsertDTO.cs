using global::CampusAccessibilityBackend.Helpers;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CampusAccessibilityBackend.DTO
{
    public record ComplaintInsertDTO
    {
        [Required(ErrorMessage = "The {0} field is required.")]
        [StringLength(120, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 120 characters.")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "The {0} field is required.")]
        [AllowedValues("Αναβατόριο", "Αίθουσα", "Αμφιθέατρο", "Ανελκυστήρας",
"Διάδρομος", "Είσοδος", "Προαύλιος χώρος", "Ράμπα", "Σκάλα", "Τουαλέτα", "Πάρκινγκ", "Άλλο", ErrorMessage = "Invalid category.")]
        public string? Category { get; set; }

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
        [DataType(DataType.Date)]
        public DateOnly IncidentDate { get; set; }

        [StringLength(200, ErrorMessage = "Location must not exceed 200 characters.")]
        public string? Location { get; set; }  // προαιρετικό πεδίο συμπλήρωσης

        [Required(ErrorMessage = "The {0} field is required.")]
        [StringLength(1000, MinimumLength = 20, ErrorMessage = "Description must be between 20 and 1000 characters.")]
        public string? Description { get; set; }

        // Προαιρετικό — έως 5 εικόνες, έλεγχος στο Service
        public List<IFormFile>? Images { get; set; }
    }
}
