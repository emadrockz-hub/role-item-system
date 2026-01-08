using RoleBasedItemApi.DTOs;
using RoleBasedItemApi.Models;

namespace RoleBasedItemApi.Repositories
{
    public interface IAdminItemRepository
    {
        Task<IEnumerable<AdminItemDto>> GetAllAsync();
        Task UpdateAsync(int itemId, string name, string description);
        Task DeleteAsync(int itemId);
    }
}
