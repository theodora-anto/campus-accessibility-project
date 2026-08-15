using CampusAccessibilityBackend.Core.Filters;
using CampusAccessibilityBackend.Data;
using CampusAccessibilityBackend.Enums;
using CampusAccessibilityBackend.Filters;
using CampusAccessibilityBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusAccessibilityBackend.Repositories
{
    public class ComplaintRepository : BaseRepository<Complaint>, IComplaintRepository
    {
        public ComplaintRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PaginatedResult<Complaint>> GetPaginatedAsync(
            int pageNumber, int pageSize, ComplaintFilters? filters)
        {
            IQueryable<Complaint> query = _context.Complaints;

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Department))
                    query = query.Where(c => c.Department == filters.Department);

                if (!string.IsNullOrEmpty(filters.Category))
                    query = query.Where(c => c.Category == filters.Category);

                if (!string.IsNullOrEmpty(filters.Status))
                    query = query.Where(c => c.Status.ToString() == filters.Status);

                if (!string.IsNullOrEmpty(filters.Keyword))
                    query = query.Where(c => c.Title.Contains(filters.Keyword));
            }

            query = filters?.SortOrder == "oldest"
                ? query.OrderBy(c => c.InsertedAt)
                : query.OrderByDescending(c => c.InsertedAt);

            int totalRecords = await query.CountAsync();
            int skip = (pageNumber - 1) * pageSize;

            var data = await query
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<Complaint>
            {
                Data = data,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PaginatedResult<Complaint>> GetByStudentIdAsync(
            int studentId, int pageNumber, int pageSize)
        {
            IQueryable<Complaint> query = _context.Complaints
                .Where(c => c.StudentId == studentId)
                .OrderByDescending(c => c.InsertedAt);

            int totalRecords = await query.CountAsync();
            int skip = (pageNumber - 1) * pageSize;

            var data = await query
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<Complaint>
            {
                Data = data,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<Complaint?> GetByIdWithDetailsAsync(int id)
        {
            var complaint = await _context.Complaints
                .Include(c => c.Student)
                    .ThenInclude(s => s.User)
                .Include(c => c.ComplaintImages)
                .Include(c => c.ComplaintHistories)
                .FirstOrDefaultAsync(c => c.Id == id);

            return complaint;
        }

        public async Task<Dictionary<ComplaintStatus, int>> GetCountsByStatusAsync()
        {
            var counts = await _context.Complaints
                .GroupBy(c => c.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() }) //{ Status: New, Count: 3 },
                .ToListAsync();

            
            var result = Enum.GetValues<ComplaintStatus>().ToDictionary(s => s, s => 0);  //// Για τα status που δεν υπάρχουν οπότε δεν έχουν groupαριστεί πάνω. status, 0
            foreach (var c in counts)
                result[c.Status] = c.Count;

            return result;
        }

        public async Task<ComplaintImage?> GetImageByIdAsync(int imageId)
        {
            var image = await _context.ComplaintImages
                .Include(i => i.Complaint)
                .FirstOrDefaultAsync(i => i.Id == imageId);

            return image;
        }

        // Soft delete override — το Complaint έχει IsDeleted (κληρονομεί BaseEntity)
        public override async Task<bool> DeleteAsync(int id)
        {
            Complaint? existingComplaint = await _dbSet.FindAsync(id);
            if (existingComplaint is null) return false;

            existingComplaint.IsDeleted = true;
            existingComplaint.DeletedAt = DateTime.UtcNow;
            _context.Entry(existingComplaint).State = EntityState.Modified;
            return true;
        }
    }
}
