using CampusAccessibilityBackend.DTO;

namespace CampusAccessibilityBackend.Services
{
    public interface IStudentService
    {
        Task SignUpStudentAsync(StudentSignupDTO request);
    }
}
