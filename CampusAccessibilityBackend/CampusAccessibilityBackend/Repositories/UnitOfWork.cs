using CampusAccessibilityBackend.Data;

namespace CampusAccessibilityBackend.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public IUserRepository UserRepository { get; }
        public IStudentRepository StudentRepository { get; }
        public IComplaintRepository ComplaintRepository { get; }
        public IRoleRepository RoleRepository { get; }


        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            UserRepository = new UserRepository(context);
            StudentRepository = new StudentRepository(context);
            ComplaintRepository = new ComplaintRepository(context);
            RoleRepository = new RoleRepository(context);
        }

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
