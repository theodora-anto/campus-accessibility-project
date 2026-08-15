namespace CampusAccessibilityBackend.DTO
{
    public record LoginResponseDTO
    (
        string Token,
        string Role,
        string FullName  //για το καλωσήρθατε *όνομα*

);
}