using CampusAccessibilityBackend.Data;
using CampusAccessibilityBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusAccessibilityBackend.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email) {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
            return user;
        }
        // Soft delete override — ο User έχει IsDeleted (κληρονομεί BaseEntity)
        public override async Task<bool> DeleteAsync(int id)
        {
            User? existingUser = await _dbSet.FindAsync(id);
            if (existingUser is null) return false;

            existingUser.IsDeleted = true;
            existingUser.DeletedAt = DateTime.UtcNow;
            _context.Entry(existingUser).State = EntityState.Modified;
            return true;
        }
    }
}
