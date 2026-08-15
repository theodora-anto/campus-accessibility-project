using CampusAccessibilityBackend.Models;

namespace CampusAccessibilityBackend.Repositories
{
    public interface IStudentRepository : IBaseRepository<Student>
    {
        // Το JWT κρατάει UserId, όχι StudentId — αυτό κάνει τη γέφυρα
        Task<Student?> GetByUserIdAsync(int userId);
    }
}
