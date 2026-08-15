using CampusAccessibilityBackend.Data;
using CampusAccessibilityBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusAccessibilityBackend.Repositories
{
    public class StudentRepository : BaseRepository<Student>, IStudentRepository
    {
        public StudentRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Student?> GetByUserIdAsync(int userId)
        {
            return await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }
        // Soft delete override. Προλήπτικό, δεν χρησιμοποιείται πουθενά
        public override async Task<bool> DeleteAsync(int id)
        {
            Student? existingStudent = await _dbSet.FindAsync(id);
            if (existingStudent is null) return false;

            existingStudent.IsDeleted = true;
            existingStudent.DeletedAt = DateTime.UtcNow;
            _context.Entry(existingStudent).State = EntityState.Modified;
            return true;
        }
    }
}
