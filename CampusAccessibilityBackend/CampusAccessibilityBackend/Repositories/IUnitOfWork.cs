namespace CampusAccessibilityBackend.Repositories
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IStudentRepository StudentRepository { get; }
        IComplaintRepository ComplaintRepository { get; }

        IRoleRepository RoleRepository { get; }

        Task<bool> SaveAsync();
    }
}
