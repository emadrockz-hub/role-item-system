using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleBasedItemApi.DTOs;
using RoleBasedItemApi.Repositories;
using System.Security.Claims;

namespace RoleBasedItemApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "User")]
    public class RequestsController : ControllerBase
    {
        private readonly IRequestRepository _requests;
        private readonly IAuditRepository _audit;

        public RequestsController(IRequestRepository requests, IAuditRepository audit)
        {
            _requests = requests;
            _audit = audit;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Length < 2)
                return BadRequest(new { message = "Name is required (min 2 chars)." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var requestId = await _requests.Create(userId, dto.Name.Trim(), dto.Description?.Trim());

            await _audit.Write(userId, "CreateRequest", "ItemRequest", requestId,
                $"{{\"name\":\"{dto.Name}\"}}");

            return Ok(new { requestId });
        }

        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var mine = await _requests.GetMine(userId);
            return Ok(mine);
        }

        [HttpPost("{requestId:int}/appeal")]
        public async Task<IActionResult> Appeal([FromRoute] int requestId, [FromBody] AppealRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Message) || dto.Message.Length < 3)
                return BadRequest(new { message = "Appeal message is required (min 3 chars)." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                await _requests.Appeal(requestId, userId, dto.Message.Trim());
            }
            catch (Exception ex) when (ex.Message.Contains("INVALID_STATUS", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only denied requests can be appealed." });
            }
            catch (Exception ex) when (ex.Message.Contains("REQUEST_NOT_FOUND", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = "Request not found." });
            }

            await _audit.Write(userId, "AppealRequest", "ItemRequest", requestId,
                $"{{\"message\":\"{dto.Message}\"}}");

            return Ok(new { success = true });
        }
    }
}
