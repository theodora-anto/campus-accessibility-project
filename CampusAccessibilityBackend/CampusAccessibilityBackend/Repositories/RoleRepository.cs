using CampusAccessibilityBackend.Data;
using CampusAccessibilityBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusAccessibilityBackend.Repositories
{
    public class RoleRepository : BaseRepository<Role>, IRoleRepository
    {
        public RoleRepository(AppDbContext context) : base(context)
        {
        }
        //GetByEmailAsync φέρνει τον user με email με τον ρόλο του
        public async Task<Role?> GetByNameAsync(string name)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == name);
            return role;
        }
    }
}
