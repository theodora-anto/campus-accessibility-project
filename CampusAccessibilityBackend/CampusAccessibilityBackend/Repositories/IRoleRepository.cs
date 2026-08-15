using CampusAccessibilityBackend.Models;

namespace CampusAccessibilityBackend.Repositories
{
    public interface IRoleRepository : IBaseRepository<Role>
    {
        Task<Role?> GetByNameAsync(string name);
    }
}
