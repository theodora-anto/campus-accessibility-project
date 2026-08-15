using CampusAccessibilityBackend.Core.Filters;
using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Filters;

namespace CampusAccessibilityBackend.Services
{
    public interface IComplaintService
    {
        Task<PaginatedResult<ComplaintListReadOnlyDTO>> GetAllComplaintsAsync(
            int pageNumber, int pageSize, ComplaintFilters? filters);

        Task<ComplaintDetailReadOnlyDTO> GetComplaintByIdAsync(int id, int currentUserId, string currentUserRole);

        Task<PaginatedResult<ComplaintListReadOnlyDTO>> GetMyComplaintsAsync(
            int currentUserId, int pageNumber, int pageSize);

        Task<DashboardStatsDTO> GetComplaintStatsAsync();

        Task<ComplaintDetailReadOnlyDTO> CreateComplaintAsync(ComplaintInsertDTO dto, int currentUserId);

        Task ReviewComplaintAsync(int complaintId, ComplaintUpdateDTO dto, int currentAdminUserId);

        Task UpdateImageAltTextAsync(int complaintId, int imageId, ComplaintImageUpdateDTO dto);
    }
}
