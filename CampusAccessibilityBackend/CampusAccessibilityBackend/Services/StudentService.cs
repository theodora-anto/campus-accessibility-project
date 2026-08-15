using AutoMapper;
using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Exceptions;
using CampusAccessibilityBackend.Models;
using CampusAccessibilityBackend.Repositories;
using CampusAccessibilityBackend.Security;

namespace CampusAccessibilityBackend.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEncryptionUtil _encryptionUtil;
        private readonly ILogger<StudentService> _logger;

        public StudentService(IUnitOfWork unitOfWork, IMapper mapper,
            IEncryptionUtil encryptionUtil, ILogger<StudentService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _encryptionUtil = encryptionUtil;
            _logger = logger;
        }

        public async Task SignUpStudentAsync(StudentSignupDTO request)
        {
            User user = _mapper.Map<User>(request);       
            Student student = _mapper.Map<Student>(request);

            try
            {
                User? existingUser = await _unitOfWork.UserRepository.GetByEmailAsync(user.Email);
                if (existingUser != null)
                {
                    throw new EntityAlreadyExistsException("User",
                        $"Υπάρχει ήδη λογαριασμός με το email {existingUser.Email}.");
                }

                // Ο ρόλος δίνεται πάντα από το service = με Student κατά το signup δεν θα γίνεται client input
                Role? studentRole = await _unitOfWork.RoleRepository.GetByNameAsync("Student");
                if (studentRole == null)
                {
                   
                    throw new ServerException("Role", "Ο ρόλος Student δεν βρέθηκε στο σύστημα.");
                }

                user.RoleId = studentRole.Id;
                user.Password = _encryptionUtil.Encrypt(user.Password); // αντικατάσταση plain text με hash

                user.Student = student;

                await _unitOfWork.UserRepository.AddAsync(user);
                await _unitOfWork.StudentRepository.AddAsync(student);

                await _unitOfWork.SaveAsync();

                _logger.LogInformation("Student {Email} signed up successfully.", user.Email);
            }
            catch (EntityAlreadyExistsException ex)
            {
                _logger.LogError("Error signing up student {Email}. {Message}", user.Email, ex.Message);
                throw;
            }
            catch (ServerException ex)
            {
                _logger.LogError("Error signing up student {Email}. {Message}", user.Email, ex.Message);
                throw;
            }
        }
    }
}
