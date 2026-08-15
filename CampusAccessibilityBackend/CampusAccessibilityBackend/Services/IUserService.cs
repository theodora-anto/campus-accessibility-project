using CampusAccessibilityBackend.DTO;

namespace CampusAccessibilityBackend.Services
{
    public interface IUserService
    {
        Task<LoginResponseDTO> LoginAsync(UserLoginDTO credentials);
    }
}
