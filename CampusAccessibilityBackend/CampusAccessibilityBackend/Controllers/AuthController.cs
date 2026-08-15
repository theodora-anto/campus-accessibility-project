using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CampusAccessibilityBackend.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly IUserService _userService;

        public AuthController(IStudentService studentService, IUserService userService)
        {
            _studentService = studentService;
            _userService = userService;
        }

        /// <summary>
        /// Registers a new student.
        /// </summary>
        /// <param name="studentSignupDTO">The student registration details.</param>
        /// <returns>No content.</returns>
        /// <response code="201">Student registered successfully.</response>
        /// <response code="400">If the registration data is invalid.</response>
        /// <response code="409">If the email already exists.</response>
        [HttpPost("register/student")] // μελλοντικά: register/admin αν χρειαστεί
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult> RegisterStudent([FromBody] StudentSignupDTO studentSignupDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Το frontend αγνοεί το response body (toast + redirect στο /login) —
            // δεν χρειάζεται να επιστρέψουμε token/LoginResponseDTO εδώ.
            await _studentService.SignUpStudentAsync(studentSignupDTO);

            return StatusCode(StatusCodes.Status201Created);
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token.
        /// </summary>
        /// <param name="credentials">The user email and password.</param>
        /// <returns>A JWT token with user details.</returns>
        /// <response code="200">Returns the JWT token and user details.</response>
        /// <response code="400">If the credentials data is invalid.</response>
        /// <response code="401">If the credentials are incorrect.</response>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(LoginResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] UserLoginDTO credentials)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Το LoginAsync κάνει ήδη όλη τη δουλειά εσωτερικά: verify credentials,
            // δημιουργία token, χτίσιμο του LoginResponseDTO. Πετάει ValidationException
            // αν τα credentials είναι λάθος.
            var result = await _userService.LoginAsync(credentials);

            return Ok(result);
        }
    }
}
