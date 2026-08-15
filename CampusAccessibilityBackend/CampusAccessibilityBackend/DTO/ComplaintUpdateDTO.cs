using CampusAccessibilityBackend.Enums;
using System.ComponentModel.DataAnnotations;

//Μόνο τα πεδία που αλλάζει ο admin, δηλαδή το σχόλιο και το status του παραπόνου
namespace CampusAccessibilityBackend.DTO
{
    public class ComplaintUpdateDTO
    {

        [StringLength(500, ErrorMessage = "Comment must not exceed 500 characters.")]
        public string? AdminComment { get; set; }

        
        [Required(ErrorMessage = "The {0} field is required.")]
        public ComplaintStatus Status { get; set; }
    }
}