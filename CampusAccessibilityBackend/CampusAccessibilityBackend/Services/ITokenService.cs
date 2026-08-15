using CampusAccessibilityBackend.Models;

namespace CampusAccessibilityBackend.Security
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
