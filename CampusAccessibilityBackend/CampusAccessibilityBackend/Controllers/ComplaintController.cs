using CampusAccessibilityBackend.Core.Filters;
using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Filters;
using CampusAccessibilityBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CampusAccessibilityBackend.Controllers
{
    [ApiController]
    [Route("api/v1/complaints")]
    public class ComplaintController : ControllerBase
    {
        private readonly IComplaintService _complaintService;

        public ComplaintController(IComplaintService complaintService)
        {
            _complaintService = complaintService;
        }

        //Βοηθητικές μέθοδοι
        private string GetCurrentUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        /// <summary>
        /// Gets a paginated list of complaints with optional filtering.
        /// </summary>
        /// <param name="pageNumber">The page number (1-based). Default is 1.</param>
        /// <param name="pageSize">The number of items per page. Default is 20.</param>
        /// <param name="filters">Optional filters for department, category, status and keyword.</param>
        /// <returns>A paginated list of complaints matching the filters.</returns>
        /// <response code="200">Returns the paginated complaint list.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user lacks permission.</response>
        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedResult<ComplaintListReadOnlyDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PaginatedResult<ComplaintListReadOnlyDTO>>> GetAllComplaints(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] ComplaintFilters? filters = null)
        {
            var result = await _complaintService.GetAllComplaintsAsync(pageNumber, pageSize, filters);
            return Ok(result);
        }

        /// <summary>
        /// Gets the details of a specific complaint by ID.
        /// </summary>
        /// <param name="id">The complaint ID.</param>
        /// <returns>The full complaint details.</returns>
        /// <response code="200">Returns the complaint details.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user lacks permission to view this complaint.</response>
        /// <response code="404">If no complaint exists with the given ID.</response>
        [HttpGet("{id:int}")]
        [Authorize]
        [ProducesResponseType(typeof(ComplaintDetailReadOnlyDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ComplaintDetailReadOnlyDTO>> GetComplaintById(int id)
        {
            var result = await _complaintService.GetComplaintByIdAsync(
                id, GetCurrentUserId(), GetCurrentUserRole());
            
            return Ok(result);
        }

        /// <summary>
        /// Gets a paginated list of complaints submitted by the current student.
        /// </summary>
        /// <param name="pageNumber">The page number (1-based). Default is 1.</param>
        /// <param name="pageSize">The number of items per page. Default is 20.</param>
        /// <returns>A paginated list of the student's complaints.</returns>
        /// <response code="200">Returns the paginated complaint list.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user is not a student.</response>
        [HttpGet("my-complaints")]
        [Authorize(Roles = "Student")]
        [ProducesResponseType(typeof(PaginatedResult<ComplaintListReadOnlyDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PaginatedResult<ComplaintListReadOnlyDTO>>> GetMyComplaints(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _complaintService.GetMyComplaintsAsync(
                GetCurrentUserId(), pageNumber, pageSize);

            return Ok(result);
        }

        /// <summary>
        /// Gets complaint statistics for the admin dashboard.
        /// </summary>
        /// <returns>The complaint counts by status.</returns>
        /// <response code="200">Returns the complaint statistics.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user is not an admin.</response>
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(DashboardStatsDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<DashboardStatsDTO>> GetComplaintStats()
        {
            var result = await _complaintService.GetComplaintStatsAsync();
            return Ok(result);
        }

        /// <summary>
        /// Creates a new accessibility complaint.
        /// </summary>
        /// <param name="complaintInsertDTO">The complaint details including optional images.</param>
        /// <returns>The created complaint details.</returns>
        /// <response code="201">Returns the newly created complaint.</response>
        /// <response code="400">If the complaint data is invalid.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user is not a student.</response>
        [HttpPost]
        [Authorize(Roles = "Student")]
        [ProducesResponseType(typeof(ComplaintDetailReadOnlyDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ComplaintDetailReadOnlyDTO>> CreateComplaint(
            [FromForm] ComplaintInsertDTO complaintInsertDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _complaintService.CreateComplaintAsync(
                complaintInsertDTO, GetCurrentUserId());

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Updates the status and optional comment of a complaint.
        /// </summary>
        /// <param name="id">The complaint ID.</param>
        /// <param name="complaintUpdateDTO">The new status and optional comment.</param>
        /// <returns>No content.</returns>
        /// <response code="204">Complaint updated successfully.</response>
        /// <response code="400">If the update data is invalid.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user is not an admin.</response>
        /// <response code="404">If no complaint exists with the given ID.</response>
        [HttpPut("{id:int}/review")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> ReviewComplaint(
            int id,
            [FromBody] ComplaintUpdateDTO complaintUpdateDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _complaintService.ReviewComplaintAsync(id, complaintUpdateDTO, GetCurrentUserId());

            return NoContent();
        }

        /// <summary>
        /// Updates the alt text of a complaint image.
        /// </summary>
        /// <param name="id">The complaint ID.</param>
        /// <param name="imageId">The image ID.</param>
        /// <param name="complaintImageUpdateDTO">The new alt text.</param>
        /// <returns>No content.</returns>
        /// <response code="204">Alt text updated successfully.</response>
        /// <response code="400">If the alt text data is invalid.</response>
        /// <response code="401">If the request is not authenticated.</response>
        /// <response code="403">If the user is not an admin.</response>
        /// <response code="404">If no complaint or image exists with the given IDs.</response>
        [HttpPut("{id:int}/images/{imageId:int}/alttext")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> UpdateImageAltText(
            int id,
            int imageId,
            [FromBody] ComplaintImageUpdateDTO complaintImageUpdateDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _complaintService.UpdateImageAltTextAsync(id, imageId, complaintImageUpdateDTO);

            return NoContent();
        }
    }
}
