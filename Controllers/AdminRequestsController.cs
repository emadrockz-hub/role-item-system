using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleBasedItemApi.DTOs;
using RoleBasedItemApi.Repositories;
using System.Security.Claims;

namespace RoleBasedItemApi.Controllers
{
    [ApiController]
    [Route("api/admin/requests")]
    [Authorize(Roles = "Admin")]
    public class AdminRequestsController : ControllerBase
    {
        private readonly IRequestRepository _requests;
        private readonly IItemRepository _items; // (not used directly here, SP creates item)
        private readonly IAuditRepository _audit;

        public AdminRequestsController(IRequestRepository requests, IItemRepository items, IAuditRepository audit)
        {
            _requests = requests;
            _items = items;
            _audit = audit;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var all = await _requests.AdminGetAll();
            return Ok(all);
        }

        [HttpPost("{requestId:int}/approve")]
        public async Task<IActionResult> Approve([FromRoute] int requestId)
        {
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            int newItemId;
            try
            {
                newItemId = await _requests.AdminApprove(requestId, adminId);
            }
            catch (Exception ex) when (ex.Message.Contains("REQUEST_NOT_FOUND", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = "Request not found." });
            }
            catch (Exception ex) when (ex.Message.Contains("INVALID_STATUS", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Request cannot be approved in its current status." });
            }

            await _audit.Write(adminId, "ApproveRequest", "ItemRequest", requestId,
                $"{{\"newItemId\":{newItemId}}}");

            await _audit.Write(adminId, "CreateItemFromRequest", "Item", newItemId,
                $"{{\"requestId\":{requestId}}}");

            return Ok(new { requestId, newItemId });
        }

        [HttpPost("{requestId:int}/deny")]
        public async Task<IActionResult> Deny([FromRoute] int requestId, [FromBody] DenyRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Reason) || dto.Reason.Length < 3)
                return BadRequest(new { message = "Deny reason is required (min 3 chars)." });

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                await _requests.AdminDeny(requestId, adminId, dto.Reason.Trim());
            }
            catch (Exception ex) when (ex.Message.Contains("REQUEST_NOT_FOUND", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = "Request not found." });
            }
            catch (Exception ex) when (ex.Message.Contains("INVALID_STATUS", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only pending requests can be denied." });
            }
            catch (Exception ex) when (ex.Message.Contains("REASON_REQUIRED", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Deny reason is required." });
            }

            await _audit.Write(adminId, "DenyRequest", "ItemRequest", requestId,
                $"{{\"reason\":\"{dto.Reason}\"}}");

            return Ok(new { requestId, denied = true });
        }
    }
}
