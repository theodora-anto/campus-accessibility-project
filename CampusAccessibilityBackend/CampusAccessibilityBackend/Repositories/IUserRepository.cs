using CampusAccessibilityBackend.Models;

namespace CampusAccessibilityBackend.Repositories
{
    public interface IUserRepository : IBaseRepository<User>
    {
        // Email είναι το unique identifier για login
        Task<User?> GetByEmailAsync(string email);
    }
}
