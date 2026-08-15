using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Exceptions;
using CampusAccessibilityBackend.Repositories;
using CampusAccessibilityBackend.Security;

namespace CampusAccessibilityBackend.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEncryptionUtil _encryptionUtil;
        private readonly ITokenService _tokenService;
        private readonly ILogger<UserService> _logger;

        public UserService(IUnitOfWork unitOfWork, IEncryptionUtil encryptionUtil,
            ITokenService tokenService, ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _encryptionUtil = encryptionUtil;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<LoginResponseDTO> LoginAsync(UserLoginDTO credentials)
        {
            //φέρνουμε τον user βάση του email του
            var user = await _unitOfWork.UserRepository.GetByEmailAsync(credentials.Email!);

            if (user == null || !_encryptionUtil.IsValidPassword(credentials.Password!, user.Password))
            {
                
                _logger.LogError("Login failed for email {Email}.", credentials.Email);
                throw new ValidationException("Login", "Λάθος email ή κωδικός.");
            }

            var token = _tokenService.CreateToken(user);
            var fullName = $"{user.Firstname} {user.Lastname}";

            _logger.LogInformation("User {Email} logged in successfully.", user.Email);

            return new LoginResponseDTO(token, user.Role.Name, fullName);
        }
    }
}
