using System.ComponentModel.DataAnnotations;
using CampusAccessibilityBackend.DTO;

namespace CampusAccessibilityBackend.Helpers
{
    /// <summary>
    /// Ελέγχει ότι το τμήμα ανήκει στη σχολή που έχει επιλεγεί
    /// Χρησιμοποιείται στο ComplaintInsertDTO & StudentSignupDTO
    /// </summary>
    public class ValidDepartmentAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext context)
        {
            // Διαβάζουμε το School από το parent object
            var schoolProperty = context.ObjectType.GetProperty("School");
            if (schoolProperty == null)
                return new ValidationResult("School property not found.");

            var school = schoolProperty.GetValue(context.ObjectInstance) as string;
            var department = value as string;

            // Αν κάποιο από τα δύο είναι κενό, το [Required] θα το πιάσει
            if (string.IsNullOrEmpty(school) || string.IsNullOrEmpty(department))
                return ValidationResult.Success;

            // Έλεγχος αν η σχολή είναι έγκυρη
            if (!DepartmentData.IsValidSchool(school))
                return new ValidationResult("Invalid school selected.");

            // Έλεγχος αν το τμήμα ανήκει στη σχολή
            if (!DepartmentData.IsValidDepartment(school, department))
                return new ValidationResult(
                    $"The department '{department}' does not belong to school '{school}'.");

            return ValidationResult.Success;
        }
    }
}
