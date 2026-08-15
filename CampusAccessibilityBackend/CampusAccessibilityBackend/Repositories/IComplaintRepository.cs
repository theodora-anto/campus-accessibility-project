using CampusAccessibilityBackend.Core.Filters;
using CampusAccessibilityBackend.Enums;
using CampusAccessibilityBackend.Filters;
using CampusAccessibilityBackend.Models;

namespace CampusAccessibilityBackend.Repositories
{
    public interface IComplaintRepository : IBaseRepository<Complaint>
    {
        Task<PaginatedResult<Complaint>> GetPaginatedAsync(
            int pageNumber, int pageSize, ComplaintFilters? filters);

        // για το reportsList του Student
        Task<PaginatedResult<Complaint>> GetByStudentIdAsync(
            int studentId, int pageNumber, int pageSize);

        // πλήρης λεπτομέρεια
        Task<Complaint?> GetByIdWithDetailsAsync(int id);

        // για το dashboard
        Task<Dictionary<ComplaintStatus, int>> GetCountsByStatusAsync();

        // Για το UpdateImageAltText
        Task<ComplaintImage?> GetImageByIdAsync(int imageId);
    }
}
