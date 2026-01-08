using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleBasedItemApi.Contracts;
using RoleBasedItemApi.DTOs;
using RoleBasedItemApi.Repositories;
using RoleBasedItemApi.Services;
using System.Security.Claims;

namespace RoleBasedItemApi.Controllers
{
    [ApiController]
    [Route("api/admin/items")]
    [Authorize(Roles = "Admin")]
    public class AdminItemsController : ControllerBase
    {
        private readonly IItemRepository _items;          // existing create logic uses this
        private readonly IAdminItemRepository _repo;      // manage (list/update/delete)
        private readonly IAuditRepository _audit;

        public AdminItemsController(
            IItemRepository items,
            IAdminItemRepository repo,
            IAuditRepository audit)
        {
            _items = items;
            _repo = repo;
            _audit = audit;
        }

        // ✅ Create item (already working)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Trim().Length < 2)
                return BadRequest(new { message = "Item name is required (min 2 chars)." });

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var newItemId = await _items.Create(dto.Name.Trim(), dto.Description?.Trim(), adminId);

            await _audit.Write(adminId, "AdminCreateItem", "Item", newItemId,
                $"{{\"name\":\"{dto.Name}\"}}");

            return Ok(new { itemId = newItemId });
        }

        // ✅ List items for Manage Items page
        // GET /api/admin/items
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _repo.GetAllAsync();
            return Ok(items);
        }

        // ✅ Update item
        // PUT /api/admin/items/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AdminUpdateItemRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Description))
                return BadRequest(new { message = "Name and Description are required." });

            await _repo.UpdateAsync(id, req.Name.Trim(), req.Description.Trim());

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _audit.Write(adminId, "UpdateItem", "Item", id,
                $"{{\"name\":\"{req.Name}\",\"description\":\"{req.Description}\"}}");

            return Ok();
        }

        // ✅ Delete item
        // DELETE /api/admin/items/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _audit.Write(adminId, "DeleteItem", "Item", id, "{}");

            return Ok();
        }
    }
}
