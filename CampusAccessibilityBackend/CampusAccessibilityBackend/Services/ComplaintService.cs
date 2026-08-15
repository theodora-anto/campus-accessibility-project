using AutoMapper;
using CampusAccessibilityBackend.Core.Filters;
using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Enums;
using CampusAccessibilityBackend.Exceptions;
using CampusAccessibilityBackend.Filters;
using CampusAccessibilityBackend.Models;
using CampusAccessibilityBackend.Repositories;

namespace CampusAccessibilityBackend.Services
{
    public class ComplaintService : IComplaintService
    {
        

        private const int MaxImageCount = 5;
        private const long MaxImageSizeBytes = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedImageContentTypes =
            { "image/jpeg", "image/png", "image/webp" };

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ILogger<ComplaintService> _logger;

        public ComplaintService(IUnitOfWork unitOfWork, IMapper mapper,
            IWebHostEnvironment webHostEnvironment, ILogger<ComplaintService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _logger = logger;
        }

        //get Paginated λίστα όλων των complaints (με ή χωρίς φίλτρα)
        public async Task<PaginatedResult<ComplaintListReadOnlyDTO>> GetAllComplaintsAsync(
            int pageNumber, int pageSize, ComplaintFilters? filters)
        {
            var result = await _unitOfWork.ComplaintRepository.GetPaginatedAsync(pageNumber, pageSize, filters);

            return new PaginatedResult<ComplaintListReadOnlyDTO>
            {
                Data = _mapper.Map<List<ComplaintListReadOnlyDTO>>(result.Data),
                TotalRecords = result.TotalRecords,
                PageNumber = result.PageNumber,
                PageSize = result.PageSize
            };
        }

        //get λεπτομέρεια ενός complaint
        public async Task<ComplaintDetailReadOnlyDTO> GetComplaintByIdAsync(
            int id, int currentUserId, string currentUserRole)
        {
            var complaint = await _unitOfWork.ComplaintRepository.GetByIdWithDetailsAsync(id);
            if (complaint == null)
            {
                throw new EntityNotFoundException("Complaint", "Το παράπονο δεν βρέθηκε.");
            }

            // σειρά του ιστορικού αλλαγών (νεότερο πρώτα)
            complaint.ComplaintHistories = complaint.ComplaintHistories
                .OrderByDescending(h => h.InsertedAt)
                .ToList();

            // νέο dto instance
            var dto = _mapper.Map<ComplaintDetailReadOnlyDTO>(complaint);

            // απόκρυψη των στοιχείων αυτών αν ο ρόλος είναι student. οι φοιτητές μπορούν να βλέπουν όλα τα παραπονα αλλά όχι ποιος τα έκανε 
            if (currentUserRole == "Student")
            {
                dto.SubmittedByFullName = null;
                dto.SubmittedByDepartment = null;
                dto.SubmittedBySchool = null;
            }

            return dto;
        }
        // get paginated λίστα των complaints ενός student
        public async Task<PaginatedResult<ComplaintListReadOnlyDTO>> GetMyComplaintsAsync(
            int currentUserId, int pageNumber, int pageSize)
        {
            var student = await _unitOfWork.StudentRepository.GetByUserIdAsync(currentUserId);
            if (student == null)
            {
                throw new EntityNotFoundException("Student", "Δεν βρέθηκε προφίλ φοιτητή για αυτόν τον χρήστη.");
            }

            var result = await _unitOfWork.ComplaintRepository.GetByStudentIdAsync(student.Id, pageNumber, pageSize);

            return new PaginatedResult<ComplaintListReadOnlyDTO>
            {
                Data = _mapper.Map<List<ComplaintListReadOnlyDTO>>(result.Data),
                TotalRecords = result.TotalRecords,
                PageNumber = result.PageNumber,
                PageSize = result.PageSize
            };
        }

        //get τα νούμερα για το dashboard του admin
        public async Task<DashboardStatsDTO> GetComplaintStatsAsync()
        {
            var counts = await _unitOfWork.ComplaintRepository.GetCountsByStatusAsync();

            return new DashboardStatsDTO
            {
                NewCount = counts[ComplaintStatus.New],
                UnderReviewCount = counts[ComplaintStatus.UnderReview],
                InProgressCount = counts[ComplaintStatus.InProgress],
                PendingCount = counts[ComplaintStatus.Pending],
                ResolvedCount = counts[ComplaintStatus.Resolved],
                RejectedCount = counts[ComplaintStatus.Rejected]
            };
        }
        //δημιουργία του complaint
        public async Task<ComplaintDetailReadOnlyDTO> CreateComplaintAsync(ComplaintInsertDTO dto, int currentUserId)
        {
            // Validation εικόνων
            if (dto.Images != null && dto.Images.Count > 0)
            {
                if (dto.Images.Count > MaxImageCount)
                {
                    throw new ValidationException("Image", $"Επιτρέπονται έως {MaxImageCount} εικόνες.");
                }

                foreach (var file in dto.Images)
                {
                    if (file.Length > MaxImageSizeBytes)
                    {
                        throw new ValidationException("Image", $"Η εικόνα {file.FileName} υπερβαίνει τα 5MB.");
                    }

                    if (!AllowedImageContentTypes.Contains(file.ContentType))
                    {
                        throw new ValidationException("Image",
                            $"Μη έγκυρος τύπος αρχείου για {file.FileName}. Επιτρέπονται μόνο JPEG, PNG και WebP.");
                    }
                }
            }

            var student = await _unitOfWork.StudentRepository.GetByUserIdAsync(currentUserId);
            if (student == null)
            {
                throw new EntityNotFoundException("Student", "Δεν βρέθηκε προφίλ φοιτητή για αυτόν τον χρήστη.");
            }

            var complaint = _mapper.Map<Complaint>(dto);
            complaint.StudentId = student.Id;

            // Πρώτο ComplaintHistory entry (στην αρχή δεν έχει κάνει κάτι ο admin οποτε null)
            complaint.ComplaintHistories.Add(new ComplaintHistory
            {
                Status = ComplaintStatus.New,
                AdminId = null 
            });

            await _unitOfWork.ComplaintRepository.AddAsync(complaint);
            await _unitOfWork.SaveAsync(); // παράγεται το complaint.Id

            // Οι εικόνες γράφονται στον δίσκο μετά το πρώτο save
            if (dto.Images != null && dto.Images.Count > 0)
            {
                foreach (var file in dto.Images)
                {
                    var savedPath = await SaveImageToDiskAsync(file, complaint.Id);
                    complaint.ComplaintImages.Add(new ComplaintImage { FilePath = savedPath });
                }

                await _unitOfWork.SaveAsync();
            }

            _logger.LogInformation("Complaint {ComplaintId} created by student {StudentId}.",
                complaint.Id, student.Id);

            // Ξαναφορτώνουμε καθαρό, πλήρες αντίγραφο για το response
            var created = await _unitOfWork.ComplaintRepository.GetByIdWithDetailsAsync(complaint.Id);
            return _mapper.Map<ComplaintDetailReadOnlyDTO>(created);
        }
        
        //update/review του complaint
        public async Task ReviewComplaintAsync(int complaintId, ComplaintUpdateDTO dto, int currentAdminUserId)
        {
            var complaint = await _unitOfWork.ComplaintRepository.GetByIdWithDetailsAsync(complaintId);
            if (complaint == null)
            {
                throw new EntityNotFoundException("Complaint", "Το παράπονο δεν βρέθηκε.");
            }

            //έλεγχος του alt-text
            if (complaint.ComplaintImages.Any(img => img.AltText == null))
            {
                throw new ValidationException("Image",
                    "Όλες οι εικόνες πρέπει να έχουν εναλλακτικό κείμενο πριν την πρώτη αλλαγή του status.");
            }

            complaint.Status = dto.Status;
            complaint.ComplaintHistories.Add(new ComplaintHistory
            {
                Status = dto.Status,
                AdminComment = dto.AdminComment,
                AdminId = currentAdminUserId
            });

            await _unitOfWork.SaveAsync();

            _logger.LogInformation("Complaint {ComplaintId} reviewed by admin {AdminId}, new status {Status}.",
                complaintId, currentAdminUserId, dto.Status);
        }

        public async Task UpdateImageAltTextAsync(int complaintId, int imageId, ComplaintImageUpdateDTO dto)
        {
            var image = await _unitOfWork.ComplaintRepository.GetImageByIdAsync(imageId);
            if (image == null)
            {
                throw new EntityNotFoundException("Image", "Η εικόνα δεν βρέθηκε.");
            }

            // Έλεγχος ότι η εικόνα πράγματι ανήκει στο complaint του route — αποτρέπει
            // ασυνέπεια αν κάποιος στείλει σωστό imageId αλλά λάθος complaintId στο URL.
            if (image.ComplaintId != complaintId)
            {
                throw new EntityNotFoundException("Image", "Η εικόνα δεν ανήκει σε αυτό το παράπονο.");
            }

            // αποθηκεύουμε και το κενό στη βάση
            image.AltText = dto.AltText;

            await _unitOfWork.SaveAsync();
        }
        //αποθήκευση εικόνας στον δίσκο
        private async Task<string> SaveImageToDiskAsync(IFormFile file, int complaintId)
        {
            var folderPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "complaints", complaintId.ToString());
            Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Relative path — αυτό αποθηκεύεται στη βάση, όχι το πλήρες filesystem path
            return $"/uploads/complaints/{complaintId}/{fileName}";
        }
    }
}
