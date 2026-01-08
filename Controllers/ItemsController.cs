using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleBasedItemApi.Repositories;

namespace RoleBasedItemApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // any authenticated user can view items
    public class ItemsController : ControllerBase
    {
        private readonly IItemRepository _items;

        public ItemsController(IItemRepository items)
        {
            _items = items;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var all = await _items.GetAll();
            return Ok(all);
        }
    }
}
