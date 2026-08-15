using System.ComponentModel.DataAnnotations;

namespace CampusAccessibilityBackend.DTO
{
    public record UserLoginDTO
    {
        [Required(ErrorMessage = "The {0} is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "The {0} is required.")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$",
            ErrorMessage = "Password must contain at least one uppercase, one lowercase, one digit, and one special character.")]
        public string? Password { get; set; }

        // public bool KeepLoggedIn { get; set; } //τελικά δεν χρειάστηκε
    }
}
